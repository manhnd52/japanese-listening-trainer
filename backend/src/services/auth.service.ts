import { prisma } from '../prisma/index.js';
import { 
    hashPassword, 
    comparePassword, 
    generateAccessToken, 
    generateRefreshToken 
} from '../utils/auth.js';

// Định nghĩa kiểu dữ liệu đầu vào (DTO)
export interface RegisterInput {
    fullname: string;
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface UpdateProfileInput {
    userId: number;
    email?: string;
    fullname?: string;
    newPassword?: string;
}

class AuthService {
    /**
     * Đăng ký người dùng mới
     */
    async register(data: RegisterInput) {
        // 1. Kiểm tra email đã tồn tại chưa
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            throw new Error('Email already exists'); 
        }

        // 2. Mã hóa mật khẩu
        const hashedPassword = await hashPassword(data.password);

        // 3. Tạo user mới
        const newUser = await prisma.user.create({
            data: {
                fullname: data.fullname,
                email: data.email,
                password: hashedPassword,
                // ❌ Xóa role vì không tồn tại trong schema
            },
            select: {
                id: true,
                fullname: true,
                email: true,
                avatarUrl: true,
                // ❌ Xóa role vì không tồn tại trong schema
            }
        });

        return newUser;
    }

    /**
     * Đăng nhập
     */
    async login(data: LoginInput) {
        // 1. Tìm user theo email
        const user = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (!user) {
            throw new Error('Invalid email or password');
        }

        // 2. Kiểm tra mật khẩu
        const isPasswordValid = await comparePassword(data.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // 3. Tạo tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // 4. Lưu Refresh Token vào database
        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 7); 

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expireTime: expireDate
            }
        });

        // 5. ✅ Trả về format không có role
        return {
            user: {
                id: user.id,
                email: user.email,
                fullname: user.fullname,
                // ❌ Xóa role vì không tồn tại trong schema
            },
            accessToken,
            refreshToken
        };
    }

    /**
     * Get user by ID
     */
    async getUserById(userId: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fullname: true,
                email: true,
                avatarUrl: true,
            }
        });

        return user;
    }

    async updateProfile(data: UpdateProfileInput) {
        const updateData: any = {};
        if (data.fullname) {
            updateData.fullname = data.fullname;
        }
        if (data.newPassword) {
            updateData.password = await hashPassword(data.newPassword);
        }
        const updatedUser = await prisma.user.update({
            where: { id: data.userId },
            data: updateData,
            select: {
                id: true,
                fullname: true,
                email: true,
                avatarUrl: true,
            }
        });
        return updatedUser;
    }
}

export default new AuthService();