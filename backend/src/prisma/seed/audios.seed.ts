import { PrismaClient, Audio, User, Folder } from '../../generated/prisma/client';

export async function seedAudios(
    prisma: PrismaClient,
    users: User[],
    folders: Folder[]
): Promise<Audio[]> {
    const audios: Audio[] = [];

    // Helper function to find folder by name
    const findFolder = (name: string) =>
        folders.find((f) => f.name.includes(name)) || folders[0];

    const audiosData = [
        // Beginner Level
        {
            title: 'Basic Greetings - あいさつ',
            overview:
                'Learn basic Japanese greetings including おはよう (good morning), こんにちは (hello), and こんばんは (good evening).',
            script:
                'おはようございます。\nこんにちは。\nこんばんは。\nありがとうございます。\nすみません。',
            fileUrl: '/audio/',
            duration: 30,
            folderId: findFolder('Beginner').id,
            createdBy: users[0].id,
        },
        {
            title: 'Self Introduction - 自己紹介',
            overview: 'Practice introducing yourself in Japanese with basic phrases.',
            script:
                'はじめまして。\n私の名前は田中です。\n日本人です。\n東京に住んでいます。\nよろしくお願いします。',
            fileUrl: '/audio/self_introduction.mp3',
            duration: 35,
            folderId: findFolder('Beginner').id,
            createdBy: users[0].id,
        },
        {
            title: 'Numbers and Counting - 数字',
            overview: 'Learn to count from 1 to 10 and basic number usage in Japanese.',
            script:
                '一、二、三、四、五、六、七、八、九、十\nひとつ、ふたつ、みっつ、よっつ、いつつ',
            fileUrl: '/audio/numbers_counting.mp3',
            duration: 40,
            folderId: findFolder('Beginner').id,
            createdBy: users[0].id,
        },

        // Daily Conversation
        {
            title: 'At a Café - カフェで',
            overview:
                'Common phrases used when ordering at a café in Japan. Learn how to order drinks and snacks.',
            script:
                'いらっしゃいませ。\nコーヒーを一つください。\nケーキもお願いします。\n全部でいくらですか。\nありがとうございます。',
            fileUrl: '/audio/daily_conversation_1.mp3',
            duration: 45,
            folderId: findFolder('Daily').id,
            createdBy: users[0].id,
        },
        {
            title: 'Shopping at the Supermarket - スーパーで買い物',
            overview: 'Essential phrases for shopping in Japanese supermarkets.',
            script:
                'これはいくらですか。\n安いですね。\nこれを三つください。\nレジはどこですか。\n袋をください。',
            fileUrl: '/audio/daily_conversation_2.mp3',
            duration: 60,
            folderId: findFolder('Daily').id,
            createdBy: users[0].id,
        },
        {
            title: 'Weather Talk - 天気の話',
            overview: 'Learn how to talk about weather in Japanese.',
            script:
                '今日はいい天気ですね。\n明日は雨が降るそうです。\n寒いですね。\n暑くなりました。\n春が好きです。',
            fileUrl: '/audio/weather_talk.mp3',
            duration: 40,
            folderId: findFolder('Daily').id,
            createdBy: users[1].id,
        },

        // Business Japanese
        {
            title: 'Business Meeting Greetings - 会議の挨拶',
            overview: 'Professional greetings and phrases for business meetings.',
            script:
                'おはようございます。\n本日はお忙しい中、ありがとうございます。\nよろしくお願いいたします。\nでは、始めさせていただきます。\nお疲れ様でした。',
            fileUrl: '/audio/business_greeting.mp3',
            duration: 40,
            folderId: findFolder('Business').id,
            createdBy: users[1].id,
        },
        {
            title: 'Phone Conversation - 電話の会話',
            overview: 'Essential phrases for business phone calls in Japanese.',
            script:
                'もしもし、田中と申します。\n少々お待ちください。\n恐れ入りますが、もう一度お願いします。\nかしこまりました。\n失礼いたします。',
            fileUrl: '/audio/phone_conversation.mp3',
            duration: 45,
            folderId: findFolder('Business').id,
            createdBy: users[1].id,
        },
        {
            title: 'Email Etiquette - メールのマナー',
            overview: 'Learn proper Japanese email writing conventions.',
            script:
                'お世話になっております。\nご連絡ありがとうございます。\n添付ファイルをご確認ください。\nご不明な点がございましたら、お知らせください。\nよろしくお願いいたします。',
            fileUrl: '/audio/email_etiquette.mp3',
            duration: 50,
            folderId: findFolder('Business').id,
            createdBy: users[1].id,
        },

        // Travel & Tourism
        {
            title: 'At the Restaurant - レストランで',
            overview: 'Order food and communicate with restaurant staff.',
            script:
                'すみません、メニューをください。\nこれは何ですか。\nこれをください。\nお水をください。\nお会計お願いします。',
            fileUrl: '/audio/restaurant_order.mp3',
            duration: 50,
            folderId: findFolder('Travel').id,
            createdBy: users[1].id,
        },
        {
            title: 'Asking for Directions - 道を聞く',
            overview: 'Navigate and ask for directions in Japanese cities.',
            script:
                'すみません、駅はどこですか。\nまっすぐ行ってください。\n右に曲がってください。\nここから遠いですか。\nありがとうございます。',
            fileUrl: '/audio/asking_directions.mp3',
            duration: 55,
            folderId: findFolder('Travel').id,
            createdBy: users[2].id,
        },
        {
            title: 'Hotel Check-in - ホテルのチェックイン',
            overview: 'Essential phrases for hotel check-in and check-out.',
            script:
                'チェックインをお願いします。\n予約しています。\n部屋の鍵をください。\nWi-Fiのパスワードは何ですか。\nチェックアウトは何時ですか。',
            fileUrl: '/audio/hotel_checkin.mp3',
            duration: 45,
            folderId: findFolder('Travel').id,
            createdBy: users[2].id,
        },

        // JLPT N5
        {
            title: 'JLPT N5 Listening Practice 1',
            overview: 'Practice listening comprehension for JLPT N5 level.',
            script:
                '私は学生です。\n毎日学校に行きます。\n日本語を勉強しています。\n友達と話します。\n楽しいです。',
            fileUrl: '/audio/jlpt_n5_practice_1.mp3',
            duration: 42,
            folderId: findFolder('N5').id,
            createdBy: users[3].id,
        },
        {
            title: 'JLPT N5 Listening Practice 2',
            overview: 'More listening practice for JLPT N5 with everyday situations.',
            script:
                '今、何時ですか。\n八時です。\n朝ごはんを食べます。\n学校に行きます。\n勉強します。',
            fileUrl: '/audio/jlpt_n5_practice_2.mp3',
            duration: 38,
            folderId: findFolder('N5').id,
            createdBy: users[3].id,
        },

        // JLPT N4
        {
            title: 'JLPT N4 Listening Practice 1',
            overview: 'Intermediate listening practice for JLPT N4 level.',
            script:
                '先週、友達と映画を見に行きました。\nとても面白かったです。\n来週また行くつもりです。\n一緒に行きませんか。',
            fileUrl: '/audio/jlpt_n4_practice_1.mp3',
            duration: 48,
            folderId: findFolder('N4').id,
            createdBy: users[3].id,
        },
        {
            title: 'JLPT N4 Listening Practice 2',
            overview: 'Practice understanding longer conversations for N4.',
            script:
                '来月、日本に行く予定です。\n初めてなので、とても楽しみです。\n東京と京都を観光するつもりです。\nおすすめの場所を教えてください。',
            fileUrl: '/audio/jlpt_n4_practice_2.mp3',
            duration: 52,
            folderId: findFolder('N4').id,
            createdBy: users[3].id,
        },

        // Anime & Culture
        {
            title: 'Discussing Hobbies - 趣味について',
            overview: 'Learn to talk about your hobbies in Japanese.',
            script:
                '趣味は何ですか。\nアニメを見るのが好きです。\nマンガも読みます。\nコスプレもします。\n楽しいですよ。',
            fileUrl: '/audio/hobby_discussion.mp3',
            duration: 50,
            folderId: findFolder('Anime').id,
            createdBy: users[4].id,
        },
        {
            title: 'Anime Vocabulary - アニメの言葉',
            overview: 'Common words and phrases used in anime.',
            script:
                'すごい！\nかわいい！\nかっこいい！\nやった！\nがんばって！\n大丈夫だよ。',
            fileUrl: '/audio/anime_vocabulary.mp3',
            duration: 35,
            folderId: findFolder('Anime').id,
            createdBy: users[4].id,
        },
        {
            title: 'Japanese Festivals - 日本のお祭り',
            overview: 'Learn about traditional Japanese festivals and celebrations.',
            script:
                '夏祭りに行きました。\n花火を見ました。\n浴衣を着ました。\nたこ焼きを食べました。\nとても楽しかったです。',
            fileUrl: '/audio/japanese_festivals.mp3',
            duration: 46,
            folderId: findFolder('Anime').id,
            createdBy: users[4].id,
        },
    ];

    for (const audioData of audiosData) {
        const audio = await prisma.audio.create({
            data: audioData,
        });

        audios.push(audio);
        console.log(`  ✓ Created audio: ${audio.title} (${audio.duration}s)`);
    }

    return audios;
}
