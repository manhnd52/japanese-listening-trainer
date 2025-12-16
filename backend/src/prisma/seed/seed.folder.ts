import { prisma } from '../index.js';

export async function seedFolders(userId: number) {
    console.log('🌱 Seeding folders...');

    const folders = [
        {
            name: 'N5 - Beginner',
            isPublic: true,
            createdBy: userId,
        },
        {
            name: 'N4 - Elementary',
            isPublic: true,
            createdBy: userId,
        },
        {
            name: 'N3 - Intermediate',
            isPublic: true,
            createdBy: userId,
        },
        {
            name: 'Daily Conversations',
            isPublic: true,
            createdBy: userId,
        },
        {
            name: 'Business Japanese',
            isPublic: false,
            createdBy: userId,
        },
    ];

    const createdFolders = [];
    for (const folderData of folders) {
        const folder = await prisma.folder.upsert({
            where: {
                // Since we don't have a unique constraint on name+createdBy, we'll use a workaround
                // For now, we'll just create without checking duplicates
                id: 0, // This will force creation
            },
            update: {},
            create: folderData,
        }).catch(async () => {
            // If upsert fails, just create directly
            return await prisma.folder.create({
                data: folderData,
            });
        });

        createdFolders.push(folder);
        console.log(`✅ Created folder: ${folder.name}`);
    }

    return createdFolders;
}
