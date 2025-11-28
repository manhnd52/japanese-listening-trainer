import { Router } from "express";
import UserController from "../controllers/user.controller";

var router = Router();

router.get('/:id', UserController.getUserById);

router.post('/', UserController.createUser);

export default router;