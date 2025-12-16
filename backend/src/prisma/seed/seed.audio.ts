import { prisma } from '../index.js';
import path from 'path';
import fs from 'fs';

// Generate random duration between min and max (in seconds)
function getRandomDuration(min: number = 30, max: number = 300): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface AudioData {
    title: string;
    overview: string;
    script: string | null;
    fileUrl: string;
    duration: number;
    folderId: number;
    createdBy: number;
}

export async function seedAudios(userId: number, folders: any[]) {
    console.log('🌱 Seeding audios...');

    // Get path to backend/public/audio from backend/src/prisma/seed
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    const audioFiles = fs.readdirSync(audioDir).filter(file => file.endsWith('.mp3'));

    if (audioFiles.length === 0) {
        console.log('⚠️  No audio files found in public/audio');
        return [];
    }

    const audioDataList: AudioData[] = [];

    // Distribute audio files across folders
    for (let i = 0; i < audioFiles.length; i++) {
        const fileName = audioFiles[i];
        const fileUrl = `/audio/${fileName}`;

        // Generate random duration between 30-300 seconds (0.5-5 minutes)
        const duration = getRandomDuration(30, 300);

        // Extract number from filename (CDB (57).mp3 -> 57)
        const numberMatch = fileName.match(/\((\d+)\)/);
        const audioNumber = numberMatch ? numberMatch[1] : String(i + 1);

        // Assign to a folder (cycle through folders)
        const folder = folders[i % folders.length];

        const audioData: AudioData = {
            title: `Lesson ${audioNumber} - ${folder.name}`,
            overview: `Practice listening comprehension with this ${folder.name.toLowerCase()} audio lesson.`,
            script: `This is a sample script for audio lesson ${audioNumber}. The actual transcript would be added here.`,
            fileUrl,
            duration,
            folderId: folder.id,
            createdBy: userId,
        };

        audioDataList.push(audioData);
    }

    // Create audio records
    const createdAudios = [];
    for (const audioData of audioDataList) {
        const audio = await prisma.audio.create({
            data: audioData,
        });

        createdAudios.push(audio);
        console.log(`✅ Created audio: ${audio.title} (${audio.duration}s)`);
    }

    return createdAudios;
}
