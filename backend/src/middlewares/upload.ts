import multer from 'multer';
import path from 'path';

const audioDir = path.resolve(process.cwd(), 'public', 'audio');

// Đảm bảo thư mục tồn tại
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, audioDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const uploadMiddleware = multer({ storage });
