# Hướng Dẫn Kiến Trúc - MVC Pattern trong Next.js

## 🎯 Tổng Quan

Trong Next.js với kiến trúc Feature-First, chúng ta áp dụng **MVC pattern** nhưng được điều chỉnh phù hợp với React ecosystem.
Mỗi feature được tổ chức thành module riêng biệt có đầy đủ các thành phần View, Business Logic và Data Layer:
- api: chứa các API calls đến backend
- hooks: chứa các hooks để gọi API và xử lý logic, và dispatch các action đến Redux store
- types: quy định Typescript interface cho các dữ liệu
- components: chứa các component UI
- store: chứa các slice của Redux (nếu cần trong trường hợp state chung, còn nếu state cục bộ như input thì hãy đặt state trực tiếp trong component). Lưu ý: các slide đặt trong folder src/store/features

```
┌─────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                      │
│                    (Components - View)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                     │
│                    (Hooks - Controller)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                             │
│                (Redux Store, API Calls)                     │
└─────────────────────────────────────────────────────────────┘
```

### Chú ý:
- Không sử dụng Thunk để call API
- API được gọi thông qua Hooks của từng Feature

### Kiến Trúc Chi Tiết

```
src/
├── app/                          # 🎨 VIEW LAYER (Routing & Pages)
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx         # View: Login Page
│   └── (main)/
│       └── page.tsx             # View: Home Page
│
├── features/                     # FEATURE MODULES
│   └── auth/
│       ├── components/          # Feature-specific UI → View Layer
│       │   └── LoginForm.tsx
│       │
│       ├── hooks/               # Client-side logic → Controller Layer
│       │   └── useLogin.ts
│       │
│       ├── api.ts               # API communication to Express backend
│       └── types.ts             # Data contracts
│
├── components/                   # Shared UI components
│   ├── layout/                   # Layout components:  Header, Sidebar, Footer
│   └── ui/                       # UI components: Button, Input, etc.
│   └── provider/                 # Provider components: StoreProvider,...
│
├── store/                        # Global state mangaged by Redux
│   ├── features/
│   │   ├── authSlice.ts
│   │   └── userSlice.ts
│   └── index.ts
│
├── hooks/                        # Shared hooks like Redux, useDebounce
│   └── redux.ts
│
└── lib/                          # Utilities function
    ├── api.ts                   # API client configuration to add JWT token 
    └── utils.ts                 # Helper functions
```

