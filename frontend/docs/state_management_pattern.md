# State Management Patterns with Redux

Khi có một action vừa cần:
- ✅ Call API đến backend Express
- ✅ Update Redux state
- ✅ Handle loading & error states

**Có 3 approaches chính:**

### Approach 1: Redux Thunk (Traditional)
```
Component → dispatch(thunk) → API call → update Redux
```

### Approach 2: Custom Hook + Manual Dispatch
```
Component → hook.action() → API call → dispatch Redux action
```

### Approach 3: Custom Hook Only (No Redux)
```
Component → hook.action() → API call → local state
```

## Picked Solution

### 🎯 **Approach 2: Custom Hook + Manual Dispatch**

**Nguyên tắc:**
1. **Redux Store**: Chỉ chứa state + sync reducers
2. **Custom Hooks**: Chứa async logic + API calls
3. **Components**: Chỉ render UI


### Kiến Trúc

```
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                         │
│  POST /api/favorites/:songId/toggle                         │
│  → Returns: { isFavorite: boolean }                         │
└─────────────────────────────────────────────────────────────┘
                           ↑
                           │ HTTP Request
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (Next.js)                              │
│                                                              │
│  Component → Hook → API Service → Backend                   │
│      ↓         ↓                                             │
│      └─────────→ Redux Store (update state)                 │
└─────────────────────────────────────────────────────────────┘
```


### Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      COMPONENT (View)                        │
│  - Render UI only                                            │
│  - Call hook functions                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓ calls
┌─────────────────────────────────────────────────────────────┐
│                 CUSTOM HOOK (Controller)                     │
│  - Async logic                                               │
│  - API calls                                                 │
│  - Dispatch Redux actions                                    │
│  - Error handling                                            │
└────────────┬───────────────────────────┬────────────────────┘
             │                           │
             ↓ calls                     ↓ dispatch
┌────────────────────────┐    ┌─────────────────────────────┐
│   API SERVICE          │    │    REDUX STORE              |
|                        |    |  (Nếu state sử dụng chung)  |        
│  - HTTP requests       │    │  - State only               │
│  - Data transformation │    │  - Sync reducers            │
└────────────────────────┘    └─────────────────────────────┘
```
### Ví dụ flow với toggleFavorite của [MiniPlayer](../src/features/miniplayer)
1. Người dùng click vào nút toggle favorite
2. Component gọi hook `toggleFavorite`
3. Hook optimistic update trạng thái
4. Hook gọi API `toggleFavorite`
5. API trả về kết quả, Hook dựa vào kết quả cập nhật lại trạng thái
6. Hook dispatch action `toggleFavorite`
7. Redux store update state
8. Những component observer state của Redux sẽ re-render

