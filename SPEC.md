# AI Mystery Room — Project Specification

## 1. Project Overview

**Project Name:** AI Mystery Room

**Project Type:** AI-powered mystery investigation web application

**Objective:** Build a web application where users investigate AI-generated mystery cases, discover clues, examine suspects, request hints, accuse a suspect, and receive a final verdict with an explanation and score.

**Problem Statement:**

Traditional mystery games often have fixed stories and limited replayability. AI Mystery Room uses the Gemini API to generate mystery cases with different stories, suspects, clues, and solutions. This provides an interactive investigation experience.

**Target Users:**
- Students interested in AI and web development.
- Mystery and detective game enthusiasts.
- Users looking for interactive problem-solving games.

**Core Technologies:**
- Frontend: React, Vite, Tailwind CSS.
- Routing: React Router.
- HTTP requests: Axios.
- Backend: Node.js and Express.js.
- Database: MongoDB Atlas.
- ODM: Mongoose.
- AI: Google Gemini API using `@google/genai`.
- Validation: Zod.
- Configuration: dotenv.

## 2. Core Features

### 2.1 Home Page
- Display the game name and introduction.
- Explain how the game works.
- Provide a button to start a new mystery.
- Provide an option to continue an existing case when supported.

### 2.2 Create Mystery
- Let users select a difficulty: Easy, Medium, or Hard.
- Let users optionally select a mystery category, such as murder, theft, or disappearance.
- Generate a new mystery using the Gemini API.
- Validate the AI-generated response before saving it.
- Display an understandable error if generation fails.

### 2.3 Investigation Room
- Display the case title and mystery story.
- Display the suspects and their descriptions.
- Display available clues.
- Let users discover clues.
- Allow users to request hints.
- Display discovered clues and used hints.
- Show the current score or score breakdown.
- Keep the culprit and solution hidden until the user makes an accusation.

### 2.4 Accusation
- Allow the user to select a suspect.
- Ask the user to confirm the accusation.
- Submit the selected suspect to the backend.
- Prevent repeated accusations after the case has been completed.

### 2.5 Results Page
- Display whether the accusation was correct.
- Reveal the actual culprit.
- Display the explanation of the mystery.
- Display the final score.
- Offer an option to start another mystery.

## 3. Difficulty Rules and Scoring

| Difficulty | Number of Suspects | Number of Clues | Available Hints | Base Correct Score |
|---|---:|---:|---:|---:|
| Easy | 3 | 5 | 2 | 100 |
| Medium | 4 | 7 | 3 | 150 |
| Hard | 5 | 9 | 3 | 200 |

### Scoring Formula

If the accusation is correct:

`Final Score = Base Score + (Unique Clues Discovered × 5) - (Hints Used × 10)`

The minimum possible score is zero.

If the accusation is incorrect, the final score is zero.

The backend must calculate the score. The frontend must never determine or submit the authoritative score.

Each clue can earn points only once. Each hint use counts once, and the total number of hints cannot exceed the difficulty limit.

## 4. Complete User Flow

1. The user opens the Home page.
2. The user selects Start New Mystery.
3. The user chooses a difficulty and optional category.
4. The frontend sends a request to create a case.
5. The backend asks Gemini to generate a mystery.
6. The backend validates the generated data.
7. The backend saves the case in MongoDB.
8. The backend returns the case's public information and ID.
9. The user opens the Investigation Room.
10. The user reviews the story and suspects.
11. The user discovers clues and optionally requests hints.
12. The backend updates investigation progress.
13. The user selects a suspect and submits an accusation.
14. The backend checks the accusation and calculates the score.
15. The Results page displays the verdict, culprit, explanation, and final score.
16. The user can start another mystery.

## 5. Frontend Requirements

### Pages

**Home Page**
- Project introduction.
- Start New Mystery button.
- Instructions or rules.

**Create Mystery Page**
- Difficulty selector.
- Optional category selector.
- Generate Mystery button.
- Loading and error states.

**Investigation Room Page**
- Case title and story.
- Suspect cards.
- Clue list with discover actions.
- Hint request button.
- Investigation progress and score information.
- Accusation action.

**Accusation Section or Page**
- Suspect selection.
- Confirmation before submission.
- Loading and error states.

**Results Page**
- Verdict.
- Culprit identity.
- Solution explanation.
- Final score and score breakdown.
- Play Again button.

### Frontend Rules
- Use React components to avoid duplicating UI code.
- Use React Router for navigation.
- Use Axios for backend requests.
- Display loading indicators while requests are running.
- Display clear messages for errors and empty states.
- Do not hardcode generated mystery data as the production data source.
- Do not put the Gemini API key in frontend code.
- Do not reveal the culprit before the accusation is submitted.

## 6. Backend API Design

Base URL during local development:

`http://localhost:5000`

### 6.1 Create a Case

**Endpoint:** `POST /api/cases`

**Request body example:**

    {
      "difficulty": "Easy",
      "category": "Theft"
    }

**Expected behavior:**
- Validate the difficulty and category.
- Request a mystery from Gemini.
- Validate the generated response.
- Save the case in MongoDB.
- Return the case ID and public case information.
- Never return the culprit ID or solution explanation in the initial public response.

### 6.2 Get Case Details

**Endpoint:** `GET /api/cases/:id`

**Expected behavior:**
- Validate the case ID.
- Find the case in MongoDB.
- Return the story, suspects, clue information, difficulty, and investigation progress.
- Hide the culprit and solution explanation until the case is completed.

### 6.3 Discover a Clue

**Endpoint:** `POST /api/cases/:id/clues/:clueId/discover`

**Expected behavior:**
- Verify that the case exists and is active.
- Verify that the clue belongs to the case.
- Mark the clue as discovered if it has not already been discovered.
- Award five points for a newly discovered clue in the score breakdown.
- Prevent duplicate points for rediscovering the same clue.
- Return the updated public investigation state.

### 6.4 Request a Hint

**Endpoint:** `POST /api/cases/:id/hints`

**Expected behavior:**
- Verify that the case is active.
- Check the difficulty's hint limit.
- Generate or retrieve a relevant hint without revealing the culprit directly.
- Record the hint use on the backend.
- Apply a ten-point penalty per hint.
- Return the hint and updated progress.
- Reject requests when no hints remain.

### 6.5 Submit an Accusation

**Endpoint:** `POST /api/cases/:id/accuse`

**Request body example:**

    {
      "suspectId": "suspect_2"
    }

**Expected behavior:**
- Verify that the case exists and is active.
- Verify that the suspect belongs to the case.
- Compare the selected suspect with the stored culprit ID.
- Calculate the final score on the backend.
- Mark the case as completed.
- Return the verdict, culprit, solution explanation, and score.
- Prevent multiple accusations for the same completed case.

### 6.6 Get Case Results

**Endpoint:** `GET /api/cases/:id/result`

**Expected behavior:**
- Return results only after the case is completed.
- Return the verdict, culprit, solution explanation, and score.
- Do not expose the solution through this endpoint before completion.

## 7. AI Response Format

Gemini must generate structured JSON matching the following general format:

    {
      "title": "The Missing Diamond",
      "story": "A diamond disappeared from a locked exhibition room...",
      "suspects": [
        {
          "id": "suspect_1",
          "name": "Alex",
          "description": "The exhibition manager"
        },
        {
          "id": "suspect_2",
          "name": "Maya",
          "description": "A security officer"
        },
        {
          "id": "suspect_3",
          "name": "Daniel",
          "description": "A frequent visitor"
        }
      ],
      "clues": [
        {
          "id": "clue_1",
          "description": "A broken lock was found near the display",
          "detail": "The lock shows signs of tampering"
        }
      ],
      "hints": [
        "Examine who had access to the exhibition room"
      ],
      "culpritId": "suspect_2",
      "solutionExplanation": "The evidence connects the security officer to the incident..."
    }

This is an illustrative example of the structure, not the complete mystery. The generated case must contain the exact number of suspects and clues required by the selected difficulty.

### AI Generation Rules
- The story must be understandable and internally consistent.
- Every suspect must have a unique ID.
- Every clue must have a unique ID.
- The culprit ID must match one of the generated suspects.
- The solution must be supported by the story and clues.
- The mystery must have one intended culprit.
- Hints must help the user reason without immediately revealing the answer.
- The AI must return structured JSON, not extra explanatory text around the JSON.
- Validate all generated data on the backend before saving it.
- Retry generation a limited number of times if the output is invalid, then return a clear error.

## 8. Data Model

Use Mongoose to define a `Case` model.

### Case Fields
- `title`: String, required.
- `story`: String, required.
- `difficulty`: String, required; Easy, Medium, or Hard.
- `category`: String.
- `suspects`: Array of suspect objects.
- `clues`: Array of clue objects.
- `hints`: Array of hint strings or structured hint objects.
- `culpritId`: String, required, private until completion.
- `solutionExplanation`: String, required, private until completion.
- `discoveredClueIds`: Array of clue IDs.
- `usedHints`: Number, default zero.
- `status`: String; active or completed.
- `accusedSuspectId`: String, optional.
- `isCorrect`: Boolean, optional.
- `finalScore`: Number, default zero.
- `createdAt`: Date.
- `updatedAt`: Date.

Use Mongoose timestamps where appropriate.

Suspect objects should contain an ID, name, and description.

Clue objects should contain an ID, description, and any additional detail needed when discovered.

Do not expose private fields through public API responses. Use explicit response serializers or DTOs rather than returning the complete database document.

## 9. Validation and Error Handling

Validate all user input on the backend with Zod or equivalent validation.

Handle these cases:
- Invalid difficulty or category.
- Invalid or malformed case ID.
- Case not found.
- Clue not found or not associated with the case.
- Hint limit exceeded.
- Accusation with an unknown suspect ID.
- Accusation submitted after completion.
- Gemini API failure or rate limit.
- Invalid AI-generated JSON.
- MongoDB connection or database errors.
- Unexpected server errors.

Use suitable HTTP status codes, including:
- `200`: Successful request.
- `201`: Case created.
- `400`: Invalid request.
- `404`: Case or resource not found.
- `409`: Action conflicts with the case state, such as a repeated accusation.
- `429`: Rate limit exceeded, where appropriate.
- `500`: Unexpected server error.
- `502` or `503`: AI service failure or temporary unavailability, where appropriate.

Return a consistent error structure, for example:

    {
      "error": {
        "code": "CASE_NOT_FOUND",
        "message": "The requested case could not be found."
      }
    }

Do not return API keys, database credentials, stack traces, or internal secrets to the client.

## 10. Security Requirements

- Store the Gemini API key only in the backend environment.
- Store the MongoDB connection string only in backend environment variables.
- Never commit `.env` files containing real credentials.
- Include `.env` in `.gitignore`.
- Configure CORS to allow the intended frontend origin.
- Validate and sanitize incoming data.
- Keep the culprit ID and solution explanation private until the accusation is submitted.
- Calculate the score on the server.
- Prevent duplicate clue rewards.
- Enforce hint limits on the server.
- Prevent repeated accusations after a case is completed.
- Avoid logging secrets or sensitive configuration values.
- Add rate limiting before public deployment if feasible.
- Do not trust any score or verdict supplied by the frontend.

## 11. Environment Configuration

Create a `.env` file inside the `server` folder.

Required variables:

    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    GEMINI_API_KEY=your_gemini_api_key
    CLIENT_URL=http://localhost:5173

Replace the placeholder values with your actual credentials.

Keep `.env` private. Create a `.env.example` file containing only placeholder values for GitHub.

## 12. Suggested Folder Structure

    ai-mystery-room/
    ├── SPEC.md
    ├── client/
    │   ├── public/
    │   ├── src/
    │   │   ├── components/
    │   │   ├── pages/
    │   │   ├── services/
    │   │   ├── App.jsx
    │   │   ├── main.jsx
    │   │   └── index.css
    │   ├── package.json
    │   └── .env.example
    ├── server/
    │   ├── src/
    │   │   ├── config/
    │   │   ├── controllers/
    │   │   ├── middleware/
    │   │   ├── models/
    │   │   ├── routes/
    │   │   ├── services/
    │   │   ├── validators/
    │   │   ├── app.js
    │   │   └── server.js
    │   ├── package.json
    │   ├── .env
    │   └── .env.example
    ├── .gitignore
    └── README.md

Create folders as they are needed during implementation. This structure is the target structure, not a requirement to create every file immediately.

## 13. Testing Requirements

Test the following before deployment:

- Create a case for every difficulty.
- Verify that each difficulty generates the correct number of suspects and clues.
- Verify that generated cases contain a valid culprit ID.
- Verify that the public API never exposes the solution early.
- Discover a clue and confirm that it earns points only once.
- Request hints and verify the hint limit and score penalty.
- Submit a correct accusation and verify the score.
- Submit an incorrect accusation and verify that the score is zero.
- Verify that a completed case cannot be accused again.
- Test invalid IDs and invalid request bodies.
- Test AI service failures and database errors.
- Verify that the frontend displays loading and error states.
- Test the full game on the deployed website.

## 14. Deployment Requirements

**Database:** MongoDB Atlas.

**Backend:** Deploy to a suitable Node.js hosting provider.

**Frontend:** Deploy to Vercel or another suitable static frontend host.

Before deployment:
- Configure production environment variables.
- Set `CLIENT_URL` to the deployed frontend URL.
- Configure frontend API requests to use the deployed backend URL.
- Restrict CORS to the intended frontend origin.
- Confirm that no secrets are committed to GitHub.
- Test all major gameplay actions on the live website.

## 15. Acceptance Criteria

The project is considered ready when:

1. A user can create a mystery by selecting a difficulty.
2. Gemini generates a valid mystery that is stored in MongoDB.
3. The user can inspect suspects and discover clues.
4. Clue rewards cannot be duplicated.
5. The user can request hints within the allowed limit.
6. The user can submit an accusation.
7. The backend calculates the verdict and final score.
8. The culprit and solution remain private until the case is completed.
9. The results page displays the verdict, culprit, explanation, and score.
10. The application handles common errors without crashing.
11. The application is deployed and tested.
12. The GitHub repository contains setup instructions and no real secrets.
13. The live application URL and repository URL are ready for submission.

## 16. Implementation Order

Follow this order to avoid unnecessary rework:

1. Create and save this `SPEC.md`.
2. Set up the React/Vite frontend.
3. Set up the Express backend.
4. Configure MongoDB Atlas and environment variables.
5. Implement the Mongoose Case model.
6. Implement Gemini mystery generation and validation.
7. Implement the API routes and private/public response handling.
8. Test the backend endpoints.
9. Build the frontend pages and connect them to the backend.
10. Test scoring, hints, clues, accusations, and results.
11. Add README and `.gitignore`.
12. Push the project to GitHub.
13. Deploy the backend, database connection, and frontend.
14. Test the complete live game.
15. Submit the GitHub repository and live URL through the provided submission form.

**Submission form:** https://bit.ly/ai-mystery-room-sub-form
