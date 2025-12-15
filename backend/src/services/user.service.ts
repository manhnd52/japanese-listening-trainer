import { prisma } from "../prisma";

/*
data format: {
  fullname: string,
  email: string,
  password: string
}
*/
async function createUser(user: { fullname: string, email: string, password: string }) {
    console.log(user);
    try {
        const newUser = await prisma.user.create({ 
            data: { 
                fullname: user.fullname, 
                email: user.email,
                password: user.password
            } 
        });
        return newUser;
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