import { prisma } from "../prisma";

/*
  Cập nhật interface cho khớp với Schema:
  1. name -> fullname
  2. Thêm password (vì trong schema field này không có dấu ? nên là bắt buộc)
*/
interface CreateUserParams {
  fullname: string;
  email: string;
  password: string; 
}

async function createUser(user: CreateUserParams) {
    console.log(user);
    try {
        const { fullname, email, password } = user;
        
        // Tạo user mới với đúng tên trường trong database
        const newUser = await prisma.user.create({ 
            data: { 
                fullname, // Khớp với schema
                email,
                password  // Khớp với schema
                // avatarUrl là optional (String?) nên không truyền cũng được
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