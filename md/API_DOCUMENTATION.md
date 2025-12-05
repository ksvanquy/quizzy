# API Documentation - Quizzy

## Base URL
```
http://localhost:3000/api
```

## Authentication

Most endpoints require JWT authentication. Include token in header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### 1. Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "student"
    },
    "token": "jwt_token"
  }
}
```

### 2. Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as register

### 3. Get Profile
**GET** `/auth/profile`
- **Protected**: Yes

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "student",
    "avatar": "url",
    "bio": "My bio",
    "phone": "1234567890",
    "address": "123 Main St"
  }
}
```

### 4. Update Profile
**PUT** `/auth/profile`
- **Protected**: Yes

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "bio": "New bio",
  "phone": "9876543210",
  "address": "456 Oak Ave"
}
```

**Response:** Updated user object

---

## Category Endpoints

### 1. Get All Categories
**GET** `/categories`

**Query Parameters:**
- None

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "category_id",
      "name": "Mathematics",
      "slug": "mathematics",
      "description": "Math quizzes",
      "color": "#FF6B6B",
      "createdAt": "2024-12-05T10:00:00Z",
      "updatedAt": "2024-12-05T10:00:00Z"
    }
  ]
}
```

### 2. Get Category by Slug
**GET** `/categories/[slug]`

**Response:** Single category object

### 3. Create Category
**POST** `/categories`
- **Protected**: Yes

**Request Body:**
```json
{
  "name": "Science",
  "description": "Science quizzes",
  "icon": "microscope",
  "color": "#4ECDC4"
}
```

---

## Question Endpoints

### 1. Get All Questions
**GET** `/questions`

**Query Parameters:**
- `category` (optional): Filter by category ID
- `difficulty` (optional): easy, medium, hard
- `topic` (optional): Filter by topic
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "_id": "question_id",
        "text": "What is 2+2?",
        "type": "single_choice",
        "topic": "Basic Math",
        "difficulty": "easy",
        "points": 1,
        "optionIds": ["option_id_1", "option_id_2"],
        "correctOptionId": "option_id_1"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

### 2. Get Question Details
**GET** `/questions/[id]`

**Response:** Single question with populated options

### 3. Create Question
**POST** `/questions`
- **Protected**: Yes

**Request Body:**
```json
{
  "text": "What is 2+2?",
  "type": "single_choice",
  "topic": "Basic Math",
  "category": "category_id",
  "difficulty": "easy",
  "points": 1,
  "options": [
    { "text": "4" },
    { "text": "5" },
    { "text": "6" }
  ],
  "correctAnswer": "option_id_for_4"
}
```

### 4. Update Question
**PUT** `/questions/[id]`
- **Protected**: Yes

**Request Body:** Same fields as create

### 5. Delete Question
**DELETE** `/questions/[id]`
- **Protected**: Yes

---

## Quiz Endpoints

### 1. Get All Quizzes
**GET** `/quizzes`

**Query Parameters:**
- `category` (optional): Filter by category
- `difficulty` (optional): easy, medium, hard
- `published` (optional): true/false
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "quizzes": [
      {
        "_id": "quiz_id",
        "title": "Math Basics",
        "description": "Basic math quiz",
        "difficulty": "easy",
        "duration": 10,
        "totalPoints": 10,
        "passingScore": 5,
        "isPublished": true,
        "category": { "_id": "cat_id", "name": "Mathematics" },
        "createdBy": { "_id": "user_id", "username": "teacher1" }
      }
    ],
    "pagination": { ... }
  }
}
```

### 2. Get Quiz Details
**GET** `/quizzes/[id]`

**Response:** Quiz with populated questions and options

### 3. Create Quiz
**POST** `/quizzes`
- **Protected**: Yes

**Request Body:**
```json
{
  "title": "Math Basics",
  "description": "A quiz on basic math",
  "category": "category_id",
  "difficulty": "easy",
  "duration": 10,
  "totalPoints": 10,
  "passingScore": 5,
  "questionIds": ["question_id_1", "question_id_2"],
  "isPublished": true
}
```

### 4. Update Quiz
**PUT** `/quizzes/[id]`
- **Protected**: Yes

**Request Body:** Same as create

### 5. Delete Quiz
**DELETE** `/quizzes/[id]`
- **Protected**: Yes

---

## Attempt Endpoints

### 1. Get User Attempts
**GET** `/attempts`
- **Protected**: Yes

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "attempts": [
      {
        "_id": "attempt_id",
        "userId": "user_id",
        "quizId": { "_id": "quiz_id", "title": "Math Basics" },
        "status": "graded",
        "totalScore": 8,
        "isPassed": true,
        "submittedAt": "2024-12-05T10:30:00Z",
        "createdAt": "2024-12-05T10:20:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

### 2. Start Quiz Attempt
**POST** `/attempts`
- **Protected**: Yes

**Request Body:**
```json
{
  "quizId": "quiz_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "attempt_id",
    "quizId": "quiz_id",
    "status": "in_progress",
    "answers": [
      {
        "questionId": "question_id",
        "userAnswer": null
      }
    ],
    "startedAt": "2024-12-05T10:20:00Z"
  }
}
```

### 3. Get Attempt Details
**GET** `/attempts/[id]`
- **Protected**: Yes

**Response:** Full attempt with answers

### 4. Save Answer
**PUT** `/attempts/[id]`
- **Protected**: Yes

**Request Body:**
```json
{
  "questionId": "question_id",
  "userAnswer": "answer_value"
}
```

**Response:** Updated attempt with answer marked as correct/incorrect

### 5. Submit Quiz
**POST** `/attempts/[id]/submit`
- **Protected**: Yes

**Response:**
```json
{
  "success": true,
  "data": {
    "attemptId": "attempt_id",
    "totalScore": 8,
    "isPassed": true,
    "passingScore": 5,
    "totalPoints": 10
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "All fields are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Quiz not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Question Answer Types

### Single Choice
- `userAnswer`: string (option ID)

### Multiple Choice
- `userAnswer`: string[] (array of option IDs)

### True/False
- `userAnswer`: boolean

### Fill Blank / Cloze Test
- `userAnswer`: string

### Numeric Input
- `userAnswer`: number

### Ordering
- `userAnswer`: string[] (ordered array)

### Matching
- `userAnswer`: object (key-value pairs)

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer your_token_here"
```

### Get Quizzes
```bash
curl -X GET "http://localhost:3000/api/quizzes?published=true" \
  -H "Authorization: Bearer your_token_here"
```
