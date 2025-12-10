import { prisma } from '../index';
import bcrypt from 'bcrypt';

export async function seedUsers() {
    console.log('🌱 Seeding users...');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create sample user
    const user = await prisma.user.upsert({
        where: { email: 'demo@example.com' },
        update: {},
        create: {
            email: 'demo@example.com',
            fullname: 'Demo User',
            password: hashedPassword,
            avatarUrl: null,
        },
    });

    console.log('✅ Created user:', user.email);
    return user;
}
