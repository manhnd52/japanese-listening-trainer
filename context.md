## Japanese Listening Web App — Quiz System

---

## 1. System Overview

This is a **Japanese listening practice web application**.

The Quiz System exists to:

- Reinforce listening comprehension
- Validate understanding after listening
- Track correctness and mistakes per user

The system is **database-driven**.

All quiz-related data is fetched from and persisted to a **remote PostgreSQL database via Prisma**.

There is **no mock data** in the target implementation.

---

## 2. Tech Stack (Non-negotiable)

- **Frontend:** Next.js + Tailwind CSS + Redux Toolkit
- **Backend:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma (schema already deployed)

---

## 3. Core Concept (Very Important)

### Quiz = One Question

- Each quiz record represents **exactly one question**
- Each quiz has:
    - One question
    - Four options (A–D)
    - One correct option

There are:

- ❌ No question groups
- ❌ No answer tables
- ❌ No quiz sessions

This design is **intentional and final**.

---

## 4. Authoritative Database Schema

### Enum

```tsx
enum QuizOption {
  A
  B
  C
  D
}

```

---

### Quiz

Stores the quiz question itself.

```tsx
Quiz
- id
- userId        // creator
- audioId       // related listening audio
- questionText
- optionA
- optionB
- optionC
- optionD
- correctOption // enum QuizOption
- explanation? // optional

```

Each quiz:

- Belongs to **one audio**
- Is created by **one user**

---

### QuizAttemptLog

Logs **every attempt** a user makes.

```tsx
QuizAttemptLog
- id
- quizId
- userId
- audioId
- selectedOption
- isCorrect
- attemptAt

```

Used for:

- History
- Auditing
- EXP calculation

---

### QuizStats

Aggregated correctness per user per quiz.

```tsx
QuizStats
- userId
- quizId
- correctCount
- wrongCount

```

This record is:

- Created on first attempt
- Updated on every submission

---

### MistakeQuiz

Tracks quizzes answered incorrectly.

```tsx
MistakeQuiz
- userId
- quizId
- wrongAt

```

Rules:

- Inserted **only when an answer is wrong**
- Removed **when user answers correctly during review**

---

## 5. Data Ownership & Source of Truth

- **Database is the source of truth**
- Frontend **never fabricates quiz data**
- All quiz play, review, and stats come from API calls
- Redux is used only for **UI state + caching**

---

## 6. Quiz System – User Flows

---

### 6.1 Quiz After Listening

**Trigger:**

- Audio finishes playing
- OR user taps “Quiz” button

**Backend flow:**

1. Fetch quizzes by `audioId`
2. Randomly select **one quiz**
3. Return quiz data to frontend

**Frontend flow:**

1. Show quiz modal
2. User selects option (A–D)
3. Submit answer to backend

---

### 6.2 Answer Submission Flow (CRITICAL)

On submit:

1. Backend checks correctness
2. Create `QuizAttemptLog`
3. Update or create `QuizStats`
4. If wrong → insert `MistakeQuiz`
5. Return result to frontend:
    - isCorrect
    - correctOption
    - explanation

Frontend:

- Displays feedback
- Grants EXP (based on backend response)

---

### 6.3 Manual Quiz Creation

**Entry points:**

- Add Audio flow
- Audio Detail page

**Frontend:**

- Collect quiz input
- Send POST request to backend

**Backend:**

- Validate input
- Insert `Quiz` record
- Return created quiz

---

### 6.4 Quiz List per Audio

**Backend:**

- Fetch quizzes by `audioId`

**Frontend:**

- Display question text
- Allow delete / edit (optional)

---

### 6.5 Review Mistake Quizzes

**Entry:**

- Home → Review

**Backend flow:**

1. Fetch quizzes joined via `MistakeQuiz` by `userId`
2. Return list of quizzes

**Frontend flow:**

1. Show quizzes one by one
2. User retries quiz
3. Submit answer

**Backend logic:**

- Correct → delete related `MistakeQuiz`
- Wrong → keep record

---

## 7. API-Driven Architecture (Assumed)

All quiz operations must go through backend APIs.

Examples (conceptual):

- `GET /quizzes?audioId=`
- `POST /quizzes`
- `POST /quiz-attempts`
- `GET /mistake-quizzes`
- `DELETE /mistake-quizzes/:quizId`

Frontend **must not** bypass backend logic.

---

## 8. Frontend Expectations

- FE fetches real data from backend
- Redux stores:
    - Current quiz
    - Quiz result state
    - Review queue
- No hardcoded quizzes
- No mock services

---

## 9. Implementation Order

### Phase 1 – Core Quiz

1. Fetch quiz by audio
2. Quiz modal UI
3. Submit answer
4. Display result

### Phase 2 – Persistence

1. Attempt logging
2. Stats update
3. Mistake insertion

### Phase 3 – Management

1. Add quiz
2. List quizzes
3. Delete quiz

### Phase 4 – Review

1. Fetch mistake quizzes
2. Retry logic
3. Cleanup on success

---

## 10. Absolute Rules for Coding Agent

- Prisma schema is FINAL
- Quiz = single question
- Always read/write from DB
- No mock data
- No legacy concepts
- No inferred tables