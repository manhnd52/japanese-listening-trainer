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
        const { fullname, email, password } = req.body;

        if (!fullname || !email || !password) {
            return res
                .status(400)
                .json({ message: "Fullname, email and password are required" });
        }

        const newUser = await userService.createUser({
            fullname: fullname.toString(),
            email: email.toString(),
            password: password.toString()
        });
        return res.status(201).json(newUser);
    } catch (error) {
        return next(error);
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

        return res.json(user);
    } catch (error) {
        return next(error);
    }
}

