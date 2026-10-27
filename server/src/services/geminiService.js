
const { GoogleGenAI, Type } = require("@google/genai");
const { z } = require("zod");

// --------------------------------------------------
// Gemini configuration
// --------------------------------------------------

const API_TIMEOUT_MS = 30000;
const MAX_ATTEMPTS = 2;

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    "Warning: GEMINI_API_KEY is missing. Check your server/.env file."
  );
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    timeout: API_TIMEOUT_MS,
  },
});

// --------------------------------------------------
// Mystery response validation
// --------------------------------------------------

const mysterySchema = z.object({
  title: z.string().min(1),
  story: z.string().min(1),
  category: z.string().min(1),

  suspects: z
    .array(
      z.object({
        suspectId: z.string().min(1),
        name: z.string().min(1),
        description: z.string().min(1),
        alibi: z.string().min(1),
        motive: z.string().min(1),
      })
    )
    .min(3),

  clues: z
    .array(
      z.object({
        clueId: z.string().min(1),
        title: z.string().min(1),
        description: z.string().min(1),
        location: z.string().min(1),
        relatedSuspectIds: z.array(z.string()),
      })
    )
    .min(5),

  culpritSuspectId: z.string().min(1),
  solutionExplanation: z.string().min(1),
});

// --------------------------------------------------
// Difficulty settings
// --------------------------------------------------

const DIFFICULTY_SETTINGS = {
  easy: {
    suspects: 3,
    clues: 5,
    hints: 2,
    baseScore: 100,
  },
  medium: {
    suspects: 4,
    clues: 7,
    hints: 3,
    baseScore: 150,
  },
  hard: {
    suspects: 5,
    clues: 9,
    hints: 3,
    baseScore: 200,
  },
};

// --------------------------------------------------
// Gemini response schema
// --------------------------------------------------

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
    },
    story: {
      type: Type.STRING,
    },
    category: {
      type: Type.STRING,
    },
    suspects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          suspectId: { type: Type.STRING },
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          alibi: { type: Type.STRING },
          motive: { type: Type.STRING },
        },
        required: [
          "suspectId",
          "name",
          "description",
          "alibi",
          "motive",
        ],
      },
    },
    clues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          clueId: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          location: { type: Type.STRING },
          relatedSuspectIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          "clueId",
          "title",
          "description",
          "location",
          "relatedSuspectIds",
        ],
      },
    },
    culpritSuspectId: {
      type: Type.STRING,
    },
    solutionExplanation: {
      type: Type.STRING,
    },
  },
  required: [
    "title",
    "story",
    "category",
    "suspects",
    "clues",
    "culpritSuspectId",
    "solutionExplanation",
  ],
};

// --------------------------------------------------
// Error handling and retries
// --------------------------------------------------

function getErrorStatus(error, message) {
  if (error.status) {
    return Number(error.status);
  }

  // Some SDK errors contain the HTTP status inside a JSON message.
  try {
    const parsed = JSON.parse(message);

    if (parsed.error?.code) {
      return Number(parsed.error.code);
    }

    if (parsed.code) {
      return Number(parsed.code);
    }
  } catch {
    // The message was not JSON; check its text below.
  }

  if (/RESOURCE_EXHAUSTED|quota exceeded/i.test(message)) {
    return 429;
  }

  if (/UNAVAILABLE/i.test(message)) {
    return 503;
  }

  return undefined;
}

function isQuotaError(status, message) {
  return (
    status === 429 ||
    /RESOURCE_EXHAUSTED|daily.*limit exceeded|quota exceeded/i.test(
      message
    )
  );
}

function isTemporaryError(status, message) {
  return (
    [500, 502, 503, 504].includes(status) ||
    /UNAVAILABLE|INTERNAL|ETIMEDOUT|ECONNRESET|fetch failed/i.test(
      message
    )
  );
}

async function generateWithRetry(request) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const startedAt = Date.now();

    try {
      console.log(
        `Gemini request started (attempt ${attempt}/${MAX_ATTEMPTS}).`
      );

      const response = await ai.models.generateContent(request);

      console.log(
        `Gemini response received in ${Date.now() - startedAt} ms.`
      );

      return response;
    } catch (error) {
      const message = String(error.message || error);
      const status = getErrorStatus(error, message);

      console.error("Gemini error details:", {
        message,
        status,
        code: error.code,
      });

      // Do not retry quota errors. Retrying cannot restore daily quota.
      if (isQuotaError(status, message)) {
        throw new Error(
          "Gemini API quota exceeded. Please wait for the quota to reset or check your Gemini API plan and billing details."
        );
      }

      // Retry only temporary service or network errors.
      if (!isTemporaryError(status, message) || attempt === MAX_ATTEMPTS) {
        throw new Error(
          status
            ? `Gemini API request failed (HTTP ${status}). ${message}`
            : `Gemini API request failed. ${message}`
        );
      }

      const delay = attempt * 2000;

      console.log(
        `Gemini temporarily unavailable. Retrying in ${
          delay / 1000
        } seconds.`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Gemini request failed after retries.");
}

// --------------------------------------------------
// Generate a mystery
// --------------------------------------------------

async function generateMystery({ difficulty, category }) {
  const settings = DIFFICULTY_SETTINGS[difficulty];

  if (!settings) {
    throw new Error("Invalid difficulty. Choose easy, medium, or hard.");
  }

  const selectedCategory =
    typeof category === "string" && category.trim()
      ? category.trim().slice(0, 80)
      : "general mystery";

  const prompt = `
You are an expert detective-game writer.

Create a complete, original, logically consistent mystery investigation.

CATEGORY: ${selectedCategory}
DIFFICULTY: ${difficulty}

EXACT REQUIREMENTS:
- Generate exactly ${settings.suspects} suspects.
- Generate exactly ${settings.clues} clues.
- Give every suspect a unique suspectId, such as suspect_1.
- Give every clue a unique clueId, such as clue_1.
- Every relatedSuspectIds entry must refer to a valid suspectId.
- culpritSuspectId must match exactly one suspectId.
- Include a compelling story, believable motives, and plausible alibis.
- Clues must be meaningful and collectively support one logical solution.
- Include misleading details, but do not make the mystery impossible to solve.
- Each clue must have a title, description, location, and related suspects.
- The story must not directly reveal the culprit.
- Do not reveal the culprit in the story, suspect descriptions, or clues.
- Keep the solutionExplanation separate from the player-facing story.
- The solutionExplanation must explain how the evidence identifies the culprit.
- Return valid JSON matching the requested response schema.
- Do not include Markdown or text outside the JSON.
`;

  try {
    const response = await generateWithRetry({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const rawText = response.text;

    if (!rawText) {
      throw new Error("Gemini returned an empty response.");
    }

    let parsedResponse;

    try {
      parsedResponse = JSON.parse(rawText);
    } catch {
      throw new Error("Gemini returned invalid JSON.");
    }

    const mystery = mysterySchema.parse(parsedResponse);

    // Verify the exact number of suspects and clues.
    if (mystery.suspects.length !== settings.suspects) {
      throw new Error(
        `Invalid mystery: expected ${settings.suspects} suspects, received ${mystery.suspects.length}.`
      );
    }

    if (mystery.clues.length !== settings.clues) {
      throw new Error(
        `Invalid mystery: expected ${settings.clues} clues, received ${mystery.clues.length}.`
      );
    }

    // Verify unique IDs.
    const suspectIds = mystery.suspects.map(
      (suspect) => suspect.suspectId
    );

    const clueIds = mystery.clues.map((clue) => clue.clueId);

    if (new Set(suspectIds).size !== suspectIds.length) {
      throw new Error("Gemini returned duplicate suspect IDs.");
    }

    if (new Set(clueIds).size !== clueIds.length) {
      throw new Error("Gemini returned duplicate clue IDs.");
    }

    // Verify that the culprit is one of the suspects.
    if (!suspectIds.includes(mystery.culpritSuspectId)) {
      throw new Error(
        "Gemini returned a culprit ID that does not match any suspect."
      );
    }

    // Verify every clue's related suspect IDs.
    for (const clue of mystery.clues) {
      for (const relatedId of clue.relatedSuspectIds) {
        if (!suspectIds.includes(relatedId)) {
          throw new Error(
            `Clue "${clue.title}" references an unknown suspect ID.`
          );
        }
      }
    }

    console.log(
      `Mystery generated successfully: ${mystery.title}`
    );

    // Keep the fields required by the existing case controller.
    return {
      ...mystery,
      difficulty,
      maxHints: settings.hints,
      baseScore: settings.baseScore,
    };
  } catch (error) {
    console.error("Mystery generation failed:", error.message);
    throw error;
  }
}

module.exports = {
  generateMystery,
};
