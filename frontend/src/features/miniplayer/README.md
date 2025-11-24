# Player Feature

Feature module for audio player functionality following the Custom Hook + Dispatch pattern.

## Structure

```
features/player/
├── types.ts              # TypeScript interfaces
├── api.ts                # API service for backend calls
└── hooks/
    └── usePlayer.ts      # Custom hook with async logic
```

## Usage

### In Components

```tsx
import { usePlayer } from '@/features/player/hooks/usePlayer';

function MyComponent() {
  const { toggleFavorite, isFavorite, currentAudio } = usePlayer();
  
  return (
    <button onClick={() => toggleFavorite(currentAudio.id)}>
      {isFavorite() ? '❤️' : '🤍'}
    </button>
  );
}
```

## API Integration

Requires Express backend with endpoint:

```
POST /api/audio/:audioId/favorite
```

See [`BACKEND_INTEGRATION.md`](../../docs/backend_integration.md) for setup details.

## Pattern

- **Hook**: Handles async logic, API calls, Redux dispatch
- **Redux**: State management only (no async logic)
- **Component**: UI rendering only

See [`STATE_MANAGEMENT_PATTERNS.md`](../../docs/STATE_MANAGEMENT_PATTERNS.md) for details.
