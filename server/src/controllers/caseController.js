
const mongoose = require("mongoose");
const Case = require("../models/Case");
const { generateMystery } = require("../services/geminiService");
const { getFallbackMystery } = require("../services/fallbackMysteryService");

const ALLOWED_DIFFICULTIES = ["easy", "medium", "hard"];

const ALLOWED_CATEGORIES = [
  "General Mystery",
  "Murder Mystery",
  "Art Theft",
  "Cyber Crime",
  "Missing Person",
  "Museum Heist",
];

// --------------------------------------------------
// Format case data safely for the frontend
// Hide undiscovered clue details and the solution
// --------------------------------------------------

function formatCase(caseDoc, revealSolution = false) {
  const data =
    typeof caseDoc.toObject === "function"
      ? caseDoc.toObject()
      : { ...caseDoc };

  const discoveredIds = data.discoveredClueIds || [];

  const safeClues = (data.clues || []).map((clue) => {
    const isDiscovered = discoveredIds.includes(clue.clueId);

    if (isDiscovered) {
      return {
        ...clue,
        discovered: true,
      };
    }

    // Do not send undiscovered evidence details to the browser.
    return {
      clueId: clue.clueId,
      title: clue.title,
      location: clue.location,
      discovered: false,
    };
  });

  const formatted = {
    id: String(data._id),
    title: data.title,
    story: data.story,
    category: data.category,
    difficulty: data.difficulty,
    suspects: data.suspects,
    clues: safeClues,
    discoveredClueIds: discoveredIds,
    hintsUsed: data.hintsUsed || 0,
    maxHints: data.maxHints,
    baseScore: data.baseScore,
    isCompleted: data.isCompleted || false,
    accusedSuspectId: data.accusedSuspectId || null,
    finalScore: data.finalScore ?? null,
  };

  if (revealSolution && data.isCompleted) {
    formatted.culpritSuspectId = data.culpritSuspectId;
    formatted.solutionExplanation = data.solutionExplanation;
  }

  return formatted;
}

function invalidCaseId(id) {
  return !mongoose.Types.ObjectId.isValid(id);
}

// --------------------------------------------------
// Create a new mystery case
// Use a built-in mystery when Gemini quota is exhausted
// --------------------------------------------------

async function createCase(req, res) {
  try {
    let { difficulty = "easy", category = "General Mystery" } =
      req.body || {};

    difficulty = String(difficulty).toLowerCase().trim();
    category = String(category).trim();

    if (!ALLOWED_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty. Choose easy, medium, or hard.",
      });
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category. Please choose a supported mystery category.",
      });
    }

    let mystery;

    try {
      mystery = await generateMystery({ difficulty, category });
    } catch (aiError) {
      const message = String(aiError.message || aiError);

      const quotaExceeded =
        aiError.status === 429 ||
        /429|RESOURCE_EXHAUSTED|quota exceeded|daily.*limit/i.test(message);

      if (!quotaExceeded) {
        throw aiError;
      }

      console.warn(
        "Gemini quota exhausted. Creating a built-in fallback mystery."
      );

      mystery = getFallbackMystery(difficulty, category);
    }

    const newCase = await Case.create({
      ...mystery,
      difficulty,
      category,
      discoveredClueIds: [],
      hintsUsed: 0,
      isCompleted: false,
      accusedSuspectId: null,
      finalScore: null,
    });

    return res.status(201).json({
      success: true,
      message: "Mystery case created successfully.",
      case: formatCase(newCase),
    });
  } catch (error) {
    console.error("Create case error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create a mystery case. Please try again.",
    });
  }
}

// --------------------------------------------------
// Get an existing case
// --------------------------------------------------

async function getCaseById(req, res) {
  try {
    const { id } = req.params;

    if (invalidCaseId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid case ID.",
      });
    }

    const caseDoc = await Case.findById(id);

    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        message: "Mystery case not found.",
      });
    }

    return res.status(200).json({
      success: true,
      case: formatCase(caseDoc),
    });
  } catch (error) {
    console.error("Get case error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve the mystery case.",
    });
  }
}

// --------------------------------------------------
// Discover a clue
// --------------------------------------------------

async function discoverClue(req, res) {
  try {
    const { id, clueId } = req.params;

    if (invalidCaseId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid case ID.",
      });
    }

    const caseDoc = await Case.findById(id);

    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        message: "Mystery case not found.",
      });
    }

    if (caseDoc.isCompleted) {
      return res.status(409).json({
        success: false,
        message: "This investigation has already been completed.",
      });
    }

    const clue = caseDoc.clues.find((item) => item.clueId === clueId);

    if (!clue) {
      return res.status(404).json({
        success: false,
        message: "Clue not found in this case.",
      });
    }

    const alreadyDiscovered = caseDoc.discoveredClueIds.includes(clueId);

    if (!alreadyDiscovered) {
      caseDoc.discoveredClueIds.push(clueId);
      await caseDoc.save();
    }

    return res.status(200).json({
      success: true,
      message: alreadyDiscovered
        ? "You have already discovered this clue."
        : "Clue discovered successfully.",
      clue: {
        ...clue.toObject?.() || clue,
        discovered: true,
      },
      case: formatCase(caseDoc),
    });
  } catch (error) {
    console.error("Discover clue error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to discover this clue.",
    });
  }
}

// --------------------------------------------------
// Request a hint
// --------------------------------------------------

async function requestHint(req, res) {
  try {
    const { id } = req.params;

    if (invalidCaseId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid case ID.",
      });
    }

    const caseDoc = await Case.findById(id);

    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        message: "Mystery case not found.",
      });
    }

    if (caseDoc.isCompleted) {
      return res.status(409).json({
        success: false,
        message: "This investigation has already been completed.",
      });
    }

    if (caseDoc.hintsUsed >= caseDoc.maxHints) {
      return res.status(409).json({
        success: false,
        message: "You have used all available hints.",
      });
    }

    const undiscoveredClues = caseDoc.clues.filter(
      (clue) => !caseDoc.discoveredClueIds.includes(clue.clueId)
    );

    const hintClue =
      undiscoveredClues.length > 0
        ? undiscoveredClues[
            Math.floor(Math.random() * undiscoveredClues.length)
          ]
        : null;

    const hint = hintClue
      ? `Investigate ${hintClue.location || "the scene"} carefully. Look for details connected to "${hintClue.title}".`
      : "Review the clues you have already discovered and compare the suspects' alibis.";

    caseDoc.hintsUsed += 1;
    await caseDoc.save();

    return res.status(200).json({
      success: true,
      message: "Hint provided.",
      hint,
      hintsUsed: caseDoc.hintsUsed,
      hintsRemaining: Math.max(0, caseDoc.maxHints - caseDoc.hintsUsed),
    });
  } catch (error) {
    console.error("Request hint error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to provide a hint.",
    });
  }
}

// --------------------------------------------------
// Accuse a suspect and calculate the score on server
// --------------------------------------------------

async function accuseSuspect(req, res) {
  try {
    const { id } = req.params;
    const { suspectId } = req.body || {};

    if (invalidCaseId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid case ID.",
      });
    }

    if (typeof suspectId !== "string" || !suspectId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please select a suspect to accuse.",
      });
    }

    const caseDoc = await Case.findById(id).select(
      "+culpritSuspectId +solutionExplanation"
    );

    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        message: "Mystery case not found.",
      });
    }

    if (caseDoc.isCompleted) {
      return res.status(409).json({
        success: false,
        message: "This investigation has already been completed.",
      });
    }

    const suspectExists = caseDoc.suspects.some(
      (suspect) => suspect.suspectId === suspectId
    );

    if (!suspectExists) {
      return res.status(400).json({
        success: false,
        message: "The selected suspect is not part of this case.",
      });
    }

    const correct = suspectId === caseDoc.culpritSuspectId;
    const baseScore = caseDoc.baseScore;
    const clueBonus = caseDoc.discoveredClueIds.length * 5;
    const hintPenalty = caseDoc.hintsUsed * 10;

    const score = correct
      ? Math.max(0, baseScore + clueBonus - hintPenalty)
      : 0;

    caseDoc.accusedSuspectId = suspectId;
    caseDoc.finalScore = score;
    caseDoc.isCompleted = true;

    await caseDoc.save();

    return res.status(200).json({
      success: true,
      message: correct
        ? "Correct accusation! Case solved."
        : "Incorrect accusation. Case completed.",
      correct,
      score,
      scoreBreakdown: {
        baseScore,
        clueBonus: correct ? clueBonus : 0,
        hintPenalty: correct ? hintPenalty : 0,
        finalScore: score,
      },
      case: formatCase(caseDoc, true),
    });
  } catch (error) {
    console.error("Accuse suspect error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to submit your accusation.",
    });
  }
}

// --------------------------------------------------
// Get the result after the case is completed
// --------------------------------------------------

async function getCaseResult(req, res) {
  try {
    const { id } = req.params;

    if (invalidCaseId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid case ID.",
      });
    }

    const caseDoc = await Case.findById(id).select(
      "+culpritSuspectId +solutionExplanation"
    );

    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        message: "Mystery case not found.",
      });
    }

    if (!caseDoc.isCompleted) {
      return res.status(409).json({
        success: false,
        message: "Complete the investigation to view the solution.",
      });
    }

    const correct = caseDoc.accusedSuspectId === caseDoc.culpritSuspectId;
    const baseScore = caseDoc.baseScore;
    const clueBonus = caseDoc.discoveredClueIds.length * 5;
    const hintPenalty = caseDoc.hintsUsed * 10;

    return res.status(200).json({
      success: true,
      correct,
      score: caseDoc.finalScore,
      scoreBreakdown: {
        baseScore,
        clueBonus: correct ? clueBonus : 0,
        hintPenalty: correct ? hintPenalty : 0,
        finalScore: caseDoc.finalScore,
      },
      culpritSuspectId: caseDoc.culpritSuspectId,
      solutionExplanation: caseDoc.solutionExplanation,
      case: formatCase(caseDoc, true),
    });
  } catch (error) {
    console.error("Get case result error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve the case result.",
    });
  }
}

module.exports = {
  createCase,
  getCaseById,
  discoverClue,
  requestHint,
  accuseSuspect,
  getCaseResult,
};
