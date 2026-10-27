
const mongoose = require("mongoose");

const suspectSchema = new mongoose.Schema(
  {
    suspectId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    alibi: {
      type: String,
      required: true,
    },
    motive: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const clueSchema = new mongoose.Schema(
  {
    clueId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    relatedSuspectIds: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const caseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    story: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    suspects: {
      type: [suspectSchema],
      required: true,
    },
    clues: {
      type: [clueSchema],
      required: true,
    },
    culpritSuspectId: {
      type: String,
      required: true,
      select: false,
    },
    solutionExplanation: {
      type: String,
      required: true,
      select: false,
    },
    discoveredClueIds: {
      type: [String],
      default: [],
    },
    hintsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxHints: {
      type: Number,
      required: true,
      min: 0,
    },
    baseScore: {
      type: Number,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    accusedSuspectId: {
      type: String,
      default: null,
    },
    finalScore: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Case", caseSchema);
