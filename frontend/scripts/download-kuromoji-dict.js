import https from 'https';
import fs from 'fs';
import path from 'path';

const DICT_URL = 'https://raw.githubusercontent.com/takuyaa/kuromoji.js/master/dict/';
const DICT_FILES = [
    'base.dat.gz',
    'cc.dat.gz',
    'check.dat.gz',
    'tid.dat.gz',
    'tid_map.dat.gz',
    'tid_pos.dat.gz',
    'unk.dat.gz',
    'unk_char.dat.gz',
    'unk_pos.dat.gz',
    'unk_map.dat.gz',
    'unk_compat.dat.gz',
    'unk_invoke.dat.gz'
];

const OUTPUT_DIR = './public/dict';

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function downloadFile(filename) {
    return new Promise((resolve, reject) => {
        const url = DICT_URL + filename;
        const outputPath = path.join(OUTPUT_DIR, filename);

        console.log(`Downloading ${filename}...`);

        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
                return;
            }

            const fileStream = fs.createWriteStream(outputPath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`✓ Downloaded ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function downloadAll() {
    console.log('Downloading Kuromoji dictionary files...\n');

    try {
        for (const file of DICT_FILES) {
            await downloadFile(file);
        }
        console.log('\n✓ All dictionary files downloaded successfully!');
    } catch (error) {
        console.error('\n✗ Error downloading dictionary files:', error.message);
        process.exit(1);
    }
}

downloadAll();
