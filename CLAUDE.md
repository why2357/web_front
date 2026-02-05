# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite frontend for a TTS (Text-to-Speech) system with user authentication, voice synthesis, and admin panel features.

## Common Commands

```bash
# Install dependencies
npm install

# Start development server (port 3000, auto-opens browser)
npm run dev

# Build for production (TypeScript check + Vite build)
npm run build

# Preview production build
npm run preview
```

**Note**: No linting or testing tools are currently configured (no ESLint, Prettier, Jest, etc.).

## Architecture

### Layered Structure

```
src/
├── api/          # API layer - centralized HTTP calls
├── pages/        # Page components - feature-based routing
├── components/   # Reusable UI components
├── App.tsx       # Root component with router configuration
└── main.tsx      # Application entry point
```

### API Layer ([src/api/](src/api/))

All HTTP requests go through a centralized Axios instance ([request.ts](src/api/request.ts)):

- **Request Interceptor**: Automatically adds `Authorization: Bearer <token>` header
  - Dev: Uses `VITE_DEV_TOKEN` from `.env.development.local` if present
  - Prod: Uses `access_token` from localStorage with expiration checking
- **Response Interceptor**: Handles unified response format `{code, message, data}`
  - Code 200/201: returns `data` field
  - Code 401: Auto-redirects to `/login`, clears token
  - Code 402: Insufficient credits error
  - Code 403: Account frozen error
  - Other errors: Rejects with error message

### Backend Configuration

Default API base URL (overridable via `VITE_API_BASE` env var):
- Dev: `http://localhost:8000/tts/`
- Prod: `/tts/` (relative path for Nginx reverse proxy)

### Routing

Routes are defined in [App.tsx](src/App.tsx):
- `/` → redirects to `/login`
- `/login` → Login page (phone + SMS verification)
- `/user` → User dashboard (TTS synthesis, history)
- `/admin` → Admin panel (user management, transaction records)

### State Management

- No global state library (Redux, Zustand, etc.)
- Uses React Hooks (useState, useEffect) for local state
- Custom hooks for page-specific logic (e.g., [useUserPage.ts](src/pages/User/useUserPage.ts))
- localStorage for token persistence

### Component Patterns

- Function components with hooks
- Co-located CSS files (`index.css` alongside `index.tsx`)
- Ant Design for UI components
- Error boundary wraps all routes

## Key Implementation Details

### Token Management

Tokens are stored in localStorage as `access_token` and `access_token_expires_at`. The request interceptor includes a 5-second grace period for token expiration.

### Response Format Handling

The API layer handles two response formats:
1. **Wrapped**: `{code: 200, message: "...", data: {...}}` - returns `data`
2. **Unwrapped**: Direct response data (e.g., history list)

### Role-Based Redirects

After login, users are redirected based on their role:
- Regular users → `/user`
- Admin users → `/admin`

## Type Safety

TypeScript is configured with strict mode enabled. Unused locals/parameters are checked to prevent code bloat.
