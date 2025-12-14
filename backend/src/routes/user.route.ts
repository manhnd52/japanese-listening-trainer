import { Router } from "express";
import { checkStreak } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import UserController from "../controllers/user.controller";

var router = Router();

router.use(authenticateToken);

router.get('/:id', UserController.getUserById);

router.post('/', UserController.createUser);

router.post('/streak', checkStreak);

export default router;