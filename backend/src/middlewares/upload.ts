import multer from "multer";
import path from "path";
import fs from "fs";

//  ĐƯỜNG DẪN CHUẨN: backend/public/audio
const AUDIO_DIR = path.join(process.cwd(), "public", "audio");

//  Đảm bảo folder tồn tại
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, AUDIO_DIR);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const uploadMiddleware = multer({
  storage,
});
