
const express = require("express");

const {
  createCase,
  getCaseById,
  discoverClue,
  requestHint,
  accuseSuspect,
  getCaseResult,
} = require("../controllers/caseController");

const router = express.Router();

// Create and retrieve cases
router.post("/", createCase);
router.get("/:id", getCaseById);

// Clue discovery
router.post("/:id/clues/:clueId/discover", discoverClue);

// Hint system
router.post("/:id/hints", requestHint);

// Accusation and final result
router.post("/:id/accuse", accuseSuspect);
router.get("/:id/result", getCaseResult);

module.exports = router;
