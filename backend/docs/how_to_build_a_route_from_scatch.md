# How to build a route from scratch

1. Create a router for this feature:
Router is used for handle routing to different controller functions
- Create a new file in `src/routes` directory with the name `feature.route.ts`
- Add to `src/routes/index.ts` 

2. Create a controller for this feature
Controller is used for handling request and response logic
- Create a new file in `src/controllers` directory with the name `feature.controller.ts`
- Add to `src/controllers/index.ts` 

3. Create a service for this feature
Service is used for business logic
- Create a new file in `src/services` directory with the name `feature.service.ts`
- Add to `src/services/index.ts` 

4. Create a model for this feature (if needed)
- Create a new model in `src/prisma/schema.prisma` 
- Run `npx prisma generate` to regenerate the model
- Push the changes to the database: `npx prisma db push`
- Add to `src/prisma/index.ts` new Model

5. Create a middleware for this feature (if needed)
- Create a new middleware in `src/middlewares` directory with the name `feature.middleware.ts`
- Add to `src/middlewares/index.ts` 

