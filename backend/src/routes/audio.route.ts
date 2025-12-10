import { Router } from 'express';
import { getAudioList } from '../controllers/audio.controller';

const router = Router();

router.get('/', getAudioList);

export default router;