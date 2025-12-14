# Audio Detail Feature

## Overview

The Audio Detail feature provides a comprehensive view of individual audio tracks with interactive capabilities including:
- Full transcript display with clickable dictionary lookup
- AI-generated context overview
- Interactive quiz system
- Playback controls integrated with Redux
- Favorite management

## Architecture

This feature follows the **Single Responsibility Principle (SRP)** by separating concerns into distinct, focused components and hooks.

### File Structure

```
features/audio-detail/
├── components/
│   ├── AudioDetailContainer.tsx    # Main orchestrator component
│   ├── AudioDetailInfo.tsx         # Left sidebar with audio info and controls
│   ├── AudioScript.tsx             # Transcript/overview display
│   ├── QuizModal.tsx               # Quiz interface modal
│   ├── DictionaryPopup.tsx         # Word definition popup
│   └── index.ts                    # Barrel exports
├── hooks/
│   ├── useAudioDetail.ts           # Fetch audio data from API
│   ├── useQuiz.ts                  # Quiz state management
│   ├── useDictionary.ts            # Dictionary lookup logic
│   └── index.ts                    # Barrel exports
├── types.ts                        # Feature-specific types
└── index.ts                        # Main barrel export
```

## Components

### AudioDetailContainer
**Responsibility:** Main orchestrator that connects all sub-components and manages Redux integration

**Props:**
- `audioId: string` - ID of the audio track to display
- `onBack: () => void` - Callback for back navigation

**Features:**
- Fetches audio details via `useAudioDetail` hook
- Manages Redux state for playback control
- Handles favorite toggling with optimistic updates
- Coordinates dictionary and quiz interactions

### AudioDetailInfo
**Responsibility:** Display audio metadata and playback controls

**Props:**
- `audio: AudioTrack` - Audio track data
- `isPlaying: boolean` - Current playback state
- `onPlay: () => void` - Play handler
- `onPause: () => void` - Pause handler
- `onOpenQuiz: () => void` - Open quiz modal
- `onToggleFavorite?: () => void` - Toggle favorite status

**Features:**
- Audio thumbnail and title
- Play/Pause button
- Quiz button
- Favorite and share actions
- Play count and duration stats

### AudioScript
**Responsibility:** Display transcript and AI-generated overview

**Props:**
- `audio: AudioTrack` - Audio track with script
- `onWordClick: (e, word) => void` - Word click handler for dictionary
- `onUpdateAudio?: (audio) => void` - Update audio with generated overview

**Features:**
- Toggle between transcript and overview modes
- Clickable words for dictionary lookup
- AI overview generation with loading state
- Smooth transitions and animations

### QuizModal
**Responsibility:** Full-screen quiz interface

**Props:**
- `isOpen: boolean` - Modal visibility state
- `onClose: () => void` - Close modal handler
- `quizzes: Quiz[]` - Array of quiz questions
- `activeQuizIndex: number` - Current quiz index
- `selectedQuizOption: number | null` - Selected answer
- `quizAnswerStatus: 'correct' | 'wrong' | null` - Answer validation result
- `currentQuiz: Quiz | null` - Current quiz question
- `onQuizOptionClick: (quiz, optionIdx) => void` - Answer selection handler
- `onNextQuiz: () => void` - Next question handler
- `onEditQuiz: () => void` - Edit quiz handler

**Features:**
- Progress tracking
- Multiple choice answers
- Instant feedback (correct/wrong)
- Explanation display
- Auto-advance to next question

### DictionaryPopup
**Responsibility:** Display word definitions with examples

**Props:**
- `popup: DictionaryPopupState` - Popup state with position and data
- `onClose: () => void` - Close popup handler

**Features:**
- Positioned near clicked word
- Loading state during API call
- Word type badge
- Example sentence
- Click outside to close

## Hooks

### useAudioDetail(audioId: string)
**Purpose:** Fetch audio details from backend API

**Returns:**
```typescript
{
  audio: AudioTrack | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

**Usage:**
```typescript
const { audio, loading, error } = useAudioDetail(audioId);
```

### useQuiz(quizzes, onMistake, onCorrect)
**Purpose:** Manage quiz modal state and progression

**Returns:**
```typescript
{
  isQuizModalOpen: boolean;
  activeQuizIndex: number;
  selectedQuizOption: number | null;
  quizAnswerStatus: 'correct' | 'wrong' | null;
  currentQuiz: Quiz | null;
  openQuiz: () => void;
  closeQuiz: () => void;
  handleQuizOptionClick: (quiz, optionIdx) => void;
  handleNextQuiz: () => void;
}
```

**Usage:**
```typescript
const {
  isQuizModalOpen,
  currentQuiz,
  openQuiz,
  handleQuizOptionClick
} = useQuiz(audio?.quizzes, handleMistake, handleCorrectAnswer);
```

### useDictionary(script: string)
**Purpose:** Manage dictionary popup state and word lookup

**Returns:**
```typescript
{
  dictPopup: DictionaryPopupState | null;
  handleWordClick: (e, word) => void;
  closeDictionary: () => void;
}
```

**Usage:**
```typescript
const { dictPopup, handleWordClick, closeDictionary } = useDictionary(audio?.script || '');
```

## Redux Integration

The feature integrates with `playerSlice` from the Redux store:

### Actions Used:
- `setTrack(audio)` - Set new audio track for playback
- `playPause()` - Toggle play/pause state
- `toggleFavoriteOptimistic()` - Optimistically toggle favorite status

### State Accessed:
```typescript
const { currentAudio, isPlaying } = useAppSelector((state) => state.player);
```

## Routing

### Route Structure
- **Path:** `/audios/[audioId]`
- **Page:** `app/(main)/audios/[audioId]/page.tsx`

### Navigation Triggers
1. **From MiniPlayer:**
   - Click on track info
   - Click maximize button
   - Navigates using `router.push(\`/audios/${audioId}\`)`

2. **Back Navigation:**
   - Click "Hide" button
   - Uses `router.back()` to return to previous page

## API Integration

### Expected Backend Endpoints

#### GET `/api/audios/:audioId`
**Response:**
```typescript
{
  data: {
    id: string;
    title: string;
    fileUrl: string;
    duration: number;
    folderId: string;
    folder?: {
      id: string;
      name: string;
    };
    status?: AudioStatus;
    isFavorite?: boolean;
    script?: string;
    overview?: string;
    quizzes?: Quiz[];
  }
}
```

#### PUT `/api/audios/:audioId/favorite` (TODO)
Toggle favorite status

#### POST `/api/audios/:audioId/mistakes` (TODO)
Track quiz mistakes

#### POST `/api/dictionary/lookup` (TODO)
Dictionary word lookup with context

#### POST `/api/ai/generate-overview` (TODO)
Generate context overview from script

## TODO/Future Enhancements

### High Priority
- [ ] Implement real dictionary API integration (replace mock)
- [ ] Implement AI overview generation (Gemini API)
- [ ] Add favorite persistence API call
- [ ] Add quiz mistake tracking API
- [ ] Implement EXP gain system for correct answers

### Medium Priority
- [ ] Add edit audio functionality
- [ ] Add edit/manage quiz functionality
- [ ] Add progress saving (resume from last position)
- [ ] Add sharing functionality
- [ ] Add play count tracking

### Low Priority
- [ ] Add audio waveform visualization
- [ ] Add speed control
- [ ] Add bookmarks/notes on transcript
- [ ] Add keyboard shortcuts
- [ ] Add offline support

## Usage Example

```typescript
// In your page component
import { AudioDetailContainer } from '@/features/audio-detail/components';

export default function AudioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const audioId = params.audioId as string;

  return (
    <AudioDetailContainer 
      audioId={audioId} 
      onBack={() => router.back()} 
    />
  );
}
```

## Styling

The feature uses Tailwind CSS with custom brand colors:
- `brand-*` - Main brand colors
- `jlt-cream` - Background color
- `jlt-sage` - Secondary background
- `jlt-peach` - Accent color

### Animations
- `animate-fade-in` - Fade in transition
- `animate-slide-up` - Slide up transition
- `animate-spin` - Loading spinner

## Testing Checklist

- [ ] Audio loads correctly from API
- [ ] Play/Pause controls work
- [ ] Quiz modal opens and closes
- [ ] Quiz answers are validated correctly
- [ ] Dictionary popup appears on word click
- [ ] Favorite toggle updates UI optimistically
- [ ] Navigation back works correctly
- [ ] Loading states display properly
- [ ] Error states display properly
- [ ] Responsive on mobile and desktop
- [ ] Redux state syncs correctly

## Dependencies

- `next` - Next.js framework
- `react-redux` - Redux state management
- `lucide-react` - Icons
- `axios` - HTTP client
- `@reduxjs/toolkit` - Redux toolkit

## Performance Considerations

1. **Lazy Loading:** Overview generation only triggers when switching to overview mode
2. **Optimistic Updates:** Favorite toggling updates UI immediately
3. **Memoization:** Consider adding React.memo for frequently re-rendering components
4. **API Caching:** useAudioDetail could benefit from React Query or SWR for caching
