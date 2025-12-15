import { Router } from 'express';
import { 
  getAudioList, 
  createAudio,
  getAudioById,
  updateAudio,
  deleteAudio,
  moveAudio,
  toggleFavorite,
  getRecentlyListened,
  getRandomAudiosFromMyList,
  getRandomAudiosFromCommunity
} from '../controllers/audio.controller';
import { uploadMiddleware } from '../middlewares/upload';
import { prisma } from '../prisma'; 

const router = Router();

// GET /api/audios - Get all audios
router.get('/', getAudioList);

// GET /api/audios/recent - Get recently listened audios
router.get('/recent', getRecentlyListened);

// GET /api/audios/random/my-list - Get random audios from user's folders (Relax mode)
router.get('/random/my-list', getRandomAudiosFromMyList);

// GET /api/audios/random/community - Get random audios from public folders (Relax mode)
router.get('/random/community', getRandomAudiosFromCommunity);

// POST /api/audios - Upload new audio
router.post('/', uploadMiddleware.single('file'), createAudio);

// GET /api/audios/folders - Get folders by userId
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
    return res.json({ success: true, data: folders });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/audios/:id/move - Move audio to another folder
router.patch('/:id/move', moveAudio);

// GET /api/audios/:id - Get audio by ID
router.get('/:id', getAudioById);

// PUT /api/audios/:id - Update audio
router.put('/:id', updateAudio);

// DELETE /api/audios/:id - Delete audio
router.delete('/:id', deleteAudio);

router.patch('/:id/favorite', toggleFavorite);


export default router;