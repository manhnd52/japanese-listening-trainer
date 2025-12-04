1. The `src` directory will be organized as follows:

```
src/
├── config/         # Environment variables and configuration
├── controllers/    # Request handlers
├── middlewares/    # Express middlewares (error handling, auth, etc.)
├── prisma/         # Database models (Prisma schema, import client, models from generated/prisma)
├── routes/         # Route definitions
├── services/       # Business logic
├── utils/          # Utility functions (logger, response helpers)
├── types/          # Custom type definitions
├── app.ts          # Express app setup
└── server.ts       # Entry point
```

2. Core dependencies: `express`, `cors`, `dotenv`, `helmet`, `morgan`.
- `express`: Web backend server framework
- `cors`: Middleware for Cross-Origin Resource Sharing
- `dotenv`: Load environment variables from .env file
- `helmet`: Security middleware
- `morgan`: HTTP request logger
