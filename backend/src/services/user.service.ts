import { prisma } from "../prisma";

/*
data format: {
  name: string,
  password: string
}
*/
function createUser(user: { name: string, email: string }) {
    console.log(user);
    return prisma.user.create({ data: user });
}

function getUserById(id: number) {
    return prisma.user.findUnique({ where: { id } });
}

export const userService = {
    createUser,
    getUserById
}