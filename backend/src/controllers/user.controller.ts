import { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service";
import { User } from "../prisma";
// Controller object
const UserController = {
    createUser: createUserController,
    getUserById: getUserByIdController
};

export default UserController;

// --- Controller functions ---

export async function createUserController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res
                .status(400)
                .json({ message: "Name and email are required" });
        }

        const newUser = await userService.createUser({
            name: name.toString(),
            email: email.toString()
        });
        return res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
}

export async function getUserByIdController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id } = req.params;

        const user = await userService.getUserById(parseInt(id, 10));
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
    return;
}

