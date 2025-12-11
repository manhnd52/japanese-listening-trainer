import { Router } from 'express';
import { getAudioList, createAudio } from '../controllers/audio.controller';
import { uploadMiddleware } from '../middlewares/upload';
import { prisma } from '../prisma'; 
const router = Router();

router.get('/', getAudioList);
router.post('/', uploadMiddleware.single('file'), createAudio);
router.get('/folders', async (req, res, next) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }

    const folders = await prisma.folder.findMany({
      where: {
        createdBy: Number(userId),
      },
      select: {
        id: true,
        name: true,
        isPublic: true,
        createdBy: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: folders });
  } catch (error) {
    next(error);
  }
});
export default router;