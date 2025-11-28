import { prisma } from "../prisma";

/*
data format: {
  name: string,
  password: string
}
*/
async function createUser(user: { name: string, email: string }) {
    console.log(user);
    try {
        const id = await prisma.user.create({ data: { name: user.name, email: user.email } });
        return id;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function getUserById(id: number) {
    return await prisma.user.findUnique({ where: { id } });
}

export const userService = {
    createUser,
    getUserById
}