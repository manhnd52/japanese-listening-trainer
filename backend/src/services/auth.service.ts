import { prisma } from '../prisma';
import { 
    hashPassword, 
    comparePassword, 
    generateAccessToken, 
    generateRefreshToken 
} from '../utils/auth';

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
            // Lưu ý: Sau này có thể dùng Custom Error để trả về status code 409
        }

        // 2. Mã hóa mật khẩu
        const hashedPassword = await hashPassword(data.password);

        // 3. Tạo user mới
        const newUser = await prisma.user.create({
            data: {
                fullname: data.fullname,
                email: data.email,
                password: hashedPassword,
                // avatarUrl để null mặc định
            },
            // Chỉ chọn các trường cần thiết để trả về, không trả về password
            select: {
                id: true,
                fullname: true,
                email: true,
                avatarUrl: true,
                // createAt không có trong model User hiện tại của bạn, nếu có thì thêm vào
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
        // Tính thời gian hết hạn cho refresh token (ví dụ 7 ngày từ giờ)
        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 7); 

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expireTime: expireDate
            }
        });

        // 5. Trả về thông tin (loại bỏ password khỏi object user)
        const { password, ...userInfo } = user;

        return {
            user: userInfo,
            accessToken,
            refreshToken
        };
    }

    /**
     * Update profile
     */
    async updateProfile(data: UpdateProfileInput) {
        const { userId, fullname, newPassword } = data;
        const updateData: any = {};

        if (fullname) {
            updateData.fullname = fullname;
        }

        if (newPassword && newPassword.trim() !== '') {
            updateData.password = await hashPassword(newPassword);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                fullname: true,
                email: true,
                avatarUrl: true
            }
        });

        return updatedUser;
    }

    /**
     * Lấy thông tin người dùng theo ID
     */
    async getMe(userId: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fullname: true,
                email: true,
                avatarUrl: true
            }
        });

        if (!user) throw new Error('User not found');
        return user;
    }
}

export default new AuthService();