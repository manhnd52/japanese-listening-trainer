# Backend API Integration Guide

## Express Backend Setup

This Next.js frontend connects to an Express backend server for data persistence and API operations.

### Environment Configuration

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Note:** The `NEXT_PUBLIC_` prefix is required for environment variables that need to be accessible in the browser.

### API Client Configuration

The frontend uses a centralized API client (`src/lib/api.ts`) with the following features:

- **Base URL**: Configured from `NEXT_PUBLIC_API_URL`
- **Timeout**: 10 seconds
- **Authentication**: Automatically adds **JWT token** from localStorage
- **Error Handling**: Global error interceptor for 401 responses

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│           EXPRESS BACKEND (Port 4000)                     │
│  - Database (MongoDB/PostgreSQL/etc.)                     │
│  - REST API Endpoints                                     │
│  - Business Logic                                         │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP/REST
                         ↓
┌──────────────────────────────────────────────────────────┐
│         NEXT.JS FRONTEND (Port 3000)                      │
│                                                           │
│  Component → Hook → API Service → Express Backend        │
│      ↓         ↓                                          │
│      └─────────→ Redux Store (state only)                │
└──────────────────────────────────────────────────────────┘
```

### Example Data Flow: Toggle Favorite

1. **User clicks heart icon** in MiniPlayer
2. **Component** calls `toggleFavorite(audioId)` from hook
3. **Hook** (`usePlayer.ts`):
   - Dispatches `toggleFavoriteOptimistic` → UI updates instantly ⚡
   - Calls `playerAPI.toggleFavorite(audioId)` → HTTP POST to Express
      **Express Backend** updates database and returns new state
   - Dispatches `updateFavoriteStatus` with server response

