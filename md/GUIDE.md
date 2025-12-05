# Quizzy - Full Stack Quiz Application

A modern full-stack quiz application built with Next.js 16, MongoDB, Mongoose, and TypeScript. Features user authentication, quiz creation, quiz attempts, and comprehensive scoring system.

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **react-hook-form** - Form management

### Backend (API Routes)
- **Next.js API Routes** - Serverless backend
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Features

✅ **Authentication**
- User registration and login
- JWT token-based authentication
- Profile management

✅ **Quiz Management**
- Create, read, update, delete quizzes
- Support for multiple question types:
  - Single choice
  - Multiple choice
  - True/False
  - Fill in the blank
  - Numeric input
  - Ordering
  - Matching
  - Cloze test
  - Image choice

✅ **Quiz Attempts**
- Take quizzes with timer
- Auto-save answers
- Instant feedback and scoring
- View attempt history

✅ **User Dashboard**
- View available quizzes
- Track quiz attempts and scores
- Update profile

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud)

## Installation

1. **Clone the repository**
```bash
cd d:\dev\quizzy
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**

Create `.env.local` file in the root directory:
```
MONGODB_URI=mongodb://localhost:27017/quizzy_db
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRATION=7d
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. **Seed the database** (optional)
```bash
npm run seed
```

This will create sample users, categories, questions, and quizzes.

## Running the Application

### Development
```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm start
```

## Project Structure

```
d:\dev\quizzy\
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── categories/      # Category endpoints
│   │   ├── questions/       # Question endpoints
│   │   ├── quizzes/         # Quiz endpoints
│   │   └── attempts/        # Quiz attempt endpoints
│   ├── auth/               # Auth pages (login, register)
│   ├── quiz/               # Quiz attempt pages
│   ├── attempts/           # Attempts history page
│   ├── profile/            # User profile page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── quizzes/            # Quiz list page
│
├── lib/
│   ├── db.ts               # MongoDB connection
│   ├── models/             # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Quiz.ts
│   │   ├── Question.ts
│   │   ├── Category.ts
│   │   ├── Attempt.ts
│   │   ├── Option.ts
│   │   ├── Bookmark.ts
│   │   └── Watchlist.ts
│   ├── contexts/
│   │   └── AuthContext.tsx # Authentication context
│   ├── hooks/
│   │   ├── useFetch.ts    # Data fetching hook
│   │   └── useTimer.ts    # Timer hook
│   └── utils/
│       ├── jwt.ts         # JWT utilities
│       ├── password.ts    # Password hashing
│       ├── api.ts         # API utilities
│       └── helpers.ts     # Helper functions
│
├── components/
│   ├── LoginForm.tsx       # Login form component
│   └── RegisterForm.tsx    # Registration form component
│
├── public/                 # Static assets
├── seed.ts                 # Database seeding script
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (protected)
- `GET /api/categories/[slug]` - Get category by slug

### Questions
- `GET /api/questions` - Get all questions with pagination
- `POST /api/questions` - Create question (protected)
- `GET /api/questions/[id]` - Get question details
- `PUT /api/questions/[id]` - Update question (protected)
- `DELETE /api/questions/[id]` - Delete question (protected)

### Quizzes
- `GET /api/quizzes` - Get all quizzes with pagination
- `POST /api/quizzes` - Create quiz (protected)
- `GET /api/quizzes/[id]` - Get quiz details
- `PUT /api/quizzes/[id]` - Update quiz (protected)
- `DELETE /api/quizzes/[id]` - Delete quiz (protected)

### Attempts
- `GET /api/attempts` - Get user attempts (protected)
- `POST /api/attempts` - Start quiz attempt (protected)
- `GET /api/attempts/[id]` - Get attempt details (protected)
- `PUT /api/attempts/[id]` - Save answer (protected)
- `POST /api/attempts/[id]/submit` - Submit quiz (protected)

## Database Models

### User
- username, email, password, name, avatar, role, bio, phone, address, lastLogin, isActive

### Quiz
- title, description, category, createdBy, difficulty, duration, totalPoints, passingScore, questionIds, isPublished, shuffleQuestions, shuffleOptions

### Question
- text, type, topic, category, difficulty, points, shuffleOptions, optionIds, correctOptionId/Ids, correctBoolean, correctOrder, correctPairs, correctAnswers, caseSensitive, correctNumber, tolerance

### Category
- name, slug, description, icon, color

### Attempt
- userId, quizId, startedAt, submittedAt, status, answers, totalScore, isPassed

### Option
- text, imageUrl, questionId

## Sample Users (After Seeding)

- **Admin**: admin@example.com / admin123 (role: admin)
- **Teacher**: teacher@example.com / teacher123 (role: teacher)
- **Student**: student@example.com / student123 (role: student)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/quizzy_db` |
| `JWT_SECRET` | Secret key for JWT signing | `secret` |
| `JWT_EXPIRATION` | JWT token expiration time | `7d` |
| `NEXT_PUBLIC_API_URL` | API base URL (client-side) | `http://localhost:3000` |

## Development Notes

### Question Types

1. **single_choice** - Select one correct answer from options
2. **multi_choice** - Select multiple correct answers
3. **true_false** - Select true or false
4. **fill_blank** - Fill in the blank with correct answer(s)
5. **cloze_test** - Similar to fill blank with context
6. **numeric_input** - Enter a numeric answer with tolerance
7. **ordering** - Order items correctly
8. **matching** - Match pairs of items
9. **image_choice** - Select from image options

### Authentication Flow

1. User registers or logs in
2. Backend validates credentials and generates JWT token
3. Token stored in localStorage on client
4. Token sent in Authorization header for protected routes
5. Backend verifies token and processes request

## Testing

To test the application:

1. Start MongoDB
2. Run `npm run seed` to populate sample data
3. Run `npm run dev`
4. Visit http://localhost:3000
5. Login with sample credentials

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env.local`

### Authentication Error
- Clear localStorage and try again
- Check JWT_SECRET is set correctly
- Verify token hasn't expired

### Build Errors
- Delete `node_modules` and `.next` folders
- Run `npm install`
- Run `npm run build`

## Future Enhancements

- Leaderboard system
- Quiz analytics and reports
- Question tagging and search
- Quiz templates
- Email notifications
- Social sharing
- Mobile app

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
