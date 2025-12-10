import { prisma } from '../index';
import { seedUsers } from './seed.user';
import { seedFolders } from './seed.folder';
import { seedAudios } from './seed.audio';



async function main() {
    console.log('🚀 Starting database seeding...\n');

    try {
        // Clear existing data (optional - comment out if you want to keep existing data)
        console.log('🗑️  Clearing existing data...');
        await prisma.audio.deleteMany();
        await prisma.folder.deleteMany();
        await prisma.user.deleteMany();
        console.log('✅ Cleared existing data\n');

        // Seed in order of dependencies
        const user = await seedUsers();
        console.log('');

        const folders = await seedFolders(user.id);
        console.log('');

        const audios = await seedAudios(user.id, folders);
        console.log('');

        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Users created: 1`);
        console.log(`   - Folders created: ${folders.length}`);
        console.log(`   - Audios created: ${audios.length}`);
        console.log('\n🔑 Demo credentials:');
        console.log('   Email: demo@example.com');
        console.log('   Password: password123');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
