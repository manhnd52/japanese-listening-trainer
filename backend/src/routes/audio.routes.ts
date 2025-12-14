import { Router } from 'express';
import { createAudio, getAudios, getAudio } from '../controllers/audio.controller';

const router = Router();

// GET /api/audios
router.get('/', getAudios);

// GET /api/audios/:id
router.get('/:id', getAudio);

// POST /api/audios
router.post('/', createAudio);

export default router;
