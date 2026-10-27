
const MYSTERIES = {
  easy: {
    title: "The Missing Diamond",
    story:
      "A priceless diamond disappeared from the city museum shortly before closing. Three people were inside the museum, and each has a possible motive. Investigate the clues and identify the thief.",
    suspects: [
      {
        suspectId: "suspect_1",
        name: "Alex Morgan",
        role: "Museum Curator",
        description:
          "The curator knows the museum's security system and has access to the diamond display.",
        motive: "Wanted to sell the diamond to pay off personal debts.",
        alibi:
          "Claims to have been checking inventory in the east wing.",
      },
      {
        suspectId: "suspect_2",
        name: "Sarah Blake",
        role: "Security Guard",
        description:
          "A security guard responsible for monitoring the museum's exhibition rooms.",
        motive: "Was recently threatened with losing her job.",
        alibi:
          "Claims to have been monitoring the main entrance cameras.",
      },
      {
        suspectId: "suspect_3",
        name: "Daniel Reed",
        role: "Art Collector",
        description:
          "A wealthy collector who had expressed strong interest in purchasing the diamond.",
        motive: "Wanted the diamond for his private collection.",
        alibi:
          "Claims to have been waiting in the museum reception area.",
      },
    ],
    clues: [
      {
        clueId: "clue_1",
        title: "Broken Display Lock",
        description:
          "The display lock was opened without leaving obvious signs of forced entry.",
        location: "Diamond exhibition room",
        relatedSuspectIds: ["suspect_1"],
      },
      {
        clueId: "clue_2",
        title: "Security Camera Gap",
        description:
          "The camera recording has a short unexplained gap around the time of the theft.",
        location: "Security control room",
        relatedSuspectIds: ["suspect_2"],
      },
      {
        clueId: "clue_3",
        title: "Collector's Note",
        description:
          "A note shows that Daniel had asked about the diamond's security arrangements.",
        location: "Museum reception",
        relatedSuspectIds: ["suspect_3"],
      },
      {
        clueId: "clue_4",
        title: "Inventory Record",
        description:
          "The inventory record was edited shortly before the diamond disappeared.",
        location: "Curator's office",
        relatedSuspectIds: ["suspect_1"],
      },
      {
        clueId: "clue_5",
        title: "Dust-Free Gloves",
        description:
          "A pair of clean handling gloves was found near the display case.",
        location: "Exhibition room storage cabinet",
        relatedSuspectIds: ["suspect_1", "suspect_2"],
      },
    ],
    culpritSuspectId: "suspect_1",
    solutionExplanation:
      "Alex Morgan stole the diamond. As curator, Alex had access to the display and inventory records. The altered inventory and the opened display lock connect Alex to the theft. The other suspects had motives, but the physical evidence points to Alex.",
  },

  medium: {
    title: "The Midnight Museum Heist",
    story:
      "A rare artifact vanished during a private museum event. The doors were locked, and four people had access to restricted areas. Examine the evidence carefully before accusing anyone.",
    suspects: [
      {
        suspectId: "suspect_1",
        name: "Victor Hale",
        role: "Head Curator",
        description:
          "Responsible for the artifact collection and authorized access to storage rooms.",
        motive: "Wanted to sell the artifact to cover hidden financial losses.",
        alibi:
          "Claims to have been reviewing collection records in his office.",
      },
      {
        suspectId: "suspect_2",
        name: "Mia Carter",
        role: "Restoration Specialist",
        description:
          "Works with delicate artifacts and has knowledge of protective display cases.",
        motive: "Wanted to gain recognition by taking the artifact.",
        alibi:
          "Claims to have been working in the restoration laboratory.",
      },
      {
        suspectId: "suspect_3",
        name: "Oliver Grant",
        role: "Event Manager",
        description:
          "Organized the private event and coordinated staff movements.",
        motive: "Was under pressure from a large personal debt.",
        alibi:
          "Claims to have been coordinating the event in the main hall.",
      },
      {
        suspectId: "suspect_4",
        name: "Elena Brooks",
        role: "Security Supervisor",
        description:
          "Managed the museum's night security team and surveillance systems.",
        motive: "Had a dispute with museum management.",
        alibi:
          "Claims to have been conducting a perimeter patrol.",
      },
    ],
    clues: [
      {
        clueId: "clue_1",
        title: "Duplicated Access Record",
        description:
          "An access log contains an unusual entry made with a curator-level credential.",
        location: "Restricted storage entrance",
        relatedSuspectIds: ["suspect_1"],
      },
      {
        clueId: "clue_2",
        title: "Restoration Material",
        description:
          "A small amount of restoration material was found near the display.",
        location: "Artifact exhibition room",
        relatedSuspectIds: ["suspect_2"],
      },
      {
        clueId: "clue_3",
        title: "Revised Event Schedule",
        description:
          "The event schedule was changed shortly before the artifact disappeared.",
        location: "Event management desk",
        relatedSuspectIds: ["suspect_3"],
      },
      {
        clueId: "clue_4",
        title: "Camera Blind Spot",
        description:
          "The camera covering the restricted corridor stopped recording briefly.",
        location: "Security control room",
        relatedSuspectIds: ["suspect_4"],
      },
      {
        clueId: "clue_5",
        title: "Unusual Inventory Change",
        description:
          "The artifact was marked as transferred even though no transfer was approved.",
        location: "Curator's office",
        relatedSuspectIds: ["suspect_1"],
      },
      {
        clueId: "clue_6",
        title: "Unsent Message",
        description:
          "A draft message mentions a secret meeting with an unknown buyer.",
        location: "Curator's workstation",
        relatedSuspectIds: ["suspect_1"],
      },
      {
        clueId: "clue_7",
        title: "Hallway Witness",
        description:
          "A staff member saw someone carrying a covered case toward the storage wing.",
        location: "West hallway",
        relatedSuspectIds: ["suspect_1", "suspect_3"],
      },
    ],
    culpritSuspectId: "suspect_1",
    solutionExplanation:
      "Victor Hale arranged the theft by abusing curator-level access. The unusual access record, false inventory transfer, and draft message about a buyer form a consistent chain of evidence. The other suspects had opportunities or suspicious circumstances, but the strongest evidence points to Victor.",
  },

  hard: {
    title: "The Cipher at Blackwood Manor",
    story:
      "A coded manuscript disappeared from a locked study during a storm at Blackwood Manor. Five people were present. Conflicting accounts and misleading evidence make this case especially difficult.",
    suspects: [
      {
        suspectId: "suspect_1",
        name: "Dr. Evelyn Shaw",
        role: "Historian",
        description:
          "A respected historian researching the manuscript's origins.",
        motive: "Wanted exclusive access to publish a groundbreaking discovery.",
        alibi:
          "Claims to have been reading in the library throughout the storm.",
      },
      {
        suspectId: "suspect_2",
        name: "Marcus Vale",
        role: "Estate Manager",
        description:
          "Managed the manor's keys, maintenance, and staff schedules.",
        motive: "Had been promised money if the manuscript was sold.",
        alibi:
          "Claims to have been inspecting a leak near the west staircase.",
      },
      {
        suspectId: "suspect_3",
        name: "Clara Whitmore",
        role: "Manuscript Conservator",
        description:
          "Specialized in preserving rare documents and their protective cases.",
        motive: "Wanted to prevent the manuscript from being privately sold.",
        alibi:
          "Claims to have been securing conservation supplies in the workshop.",
      },
      {
        suspectId: "suspect_4",
        name: "Adrian Blackwood",
        role: "Family Heir",
        description:
          "The manor's heir, familiar with its hidden passages and family history.",
        motive: "Needed money to settle a significant family debt.",
        alibi:
          "Claims to have been in the dining room during the power outage.",
      },
      {
        suspectId: "suspect_5",
        name: "Thomas Reed",
        role: "Private Investigator",
        description:
          "Was hired to investigate threats against the manuscript before it vanished.",
        motive: "Wanted to make the case famous and improve his reputation.",
        alibi:
          "Claims to have been interviewing staff near the front entrance.",
      },
    ],
    clues: [
      {
        clueId: "clue_1",
        title: "Scrambled Cipher",
        description:
          "A cipher fragment was found beside the empty manuscript case.",
        location: "Locked study",
        relatedSuspectIds: ["suspect_1", "suspect_4"],
      },
      {
        clueId: "clue_2",
        title: "Old Passage Blueprint",
        description:
          "A blueprint reveals a concealed route connecting the study to an unused corridor.",
        location: "Estate archive",
        relatedSuspectIds: ["suspect_2", "suspect_4"],
      },
      {
        clueId: "clue_3",
        title: "Damaged Seal",
        description:
          "The manuscript case seal was damaged in a way consistent with careful handling.",
        location: "Locked study",
        relatedSuspectIds: ["suspect_3"],
      },
      {
        clueId: "clue_4",
        title: "Unusual Power Interruption",
        description:
          "The power interruption occurred shortly before the manuscript disappeared.",
        location: "Electrical control room",
        relatedSuspectIds: ["suspect_2", "suspect_4"],
      },
      {
        clueId: "clue_5",
        title: "Private Correspondence",
        description:
          "A letter mentions an urgent payment connected to a rare historical item.",
        location: "Family office",
        relatedSuspectIds: ["suspect_4"],
      },
      {
        clueId: "clue_6",
        title: "Misleading Fingerprint",
        description:
          "A fingerprint on the display case belongs to someone who handled it earlier in the week.",
        location: "Locked study",
        relatedSuspectIds: ["suspect_3"],
      },
      {
        clueId: "clue_7",
        title: "Contradictory Testimony",
        description:
          "Two witnesses disagree about who was near the west corridor during the outage.",
        location: "West corridor",
        relatedSuspectIds: ["suspect_2", "suspect_5"],
      },
      {
        clueId: "clue_8",
        title: "Fresh Mud",
        description:
          "Fresh mud was found near the concealed passage entrance.",
        location: "Unused corridor",
        relatedSuspectIds: ["suspect_4"],
      },
      {
        clueId: "clue_9",
        title: "Hidden Key Impression",
        description:
          "A wax impression suggests someone copied a key to the study.",
        location: "Workshop",
        relatedSuspectIds: ["suspect_2", "suspect_4"],
      },
    ],
    culpritSuspectId: "suspect_4",
    solutionExplanation:
      "Adrian Blackwood stole the manuscript using the concealed passage. The family correspondence supplies a financial motive, while the fresh mud and passage blueprint support the route used. The power interruption provided cover. The fingerprint is misleading because it came from earlier legitimate handling.",
  },
};

function getFallbackMystery(difficulty = "easy", category = "General Mystery") {
  const normalizedDifficulty = ["easy", "medium", "hard"].includes(
    String(difficulty).toLowerCase()
  )
    ? String(difficulty).toLowerCase()
    : "easy";

  const mystery = JSON.parse(
    JSON.stringify(MYSTERIES[normalizedDifficulty])
  );

  const settings = {
    easy: { maxHints: 2, baseScore: 100 },
    medium: { maxHints: 3, baseScore: 150 },
    hard: { maxHints: 3, baseScore: 200 },
  };

  return {
    ...mystery,
    category: category || "General Mystery",
    difficulty: normalizedDifficulty,
    maxHints: settings[normalizedDifficulty].maxHints,
    baseScore: settings[normalizedDifficulty].baseScore,
  };
}

module.exports = { getFallbackMystery };
