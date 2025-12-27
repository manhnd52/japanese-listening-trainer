import { Request, Response, NextFunction } from 'express';
import { audioService } from '../services/audio.service.js';
import path from 'path';
import fs from 'fs';
import {prisma} from '../prisma/index.js'; // Thêm dòng này để dùng prisma trực tiếp

export const getAudioList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, isSuspend, folderId, userId } = req.query;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'userId is required'
      });
      return;
    }

    const filter: any = {
      createdBy: Number(userId)
    };

    if (search) filter.title = { contains: search as string, mode: 'insensitive' };
    if (isSuspend !== undefined) filter.isSuspend = isSuspend === 'true';
    if (folderId !== undefined) filter.folderId = Number(folderId);

    const audios = await audioService.getAllAudios(filter, Number(userId));

    res.json({ success: true, data: audios });
  } catch (error) {
    next(error);
  }
};

export const createAudio = async (
  req: Request & { file?: any },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, script, folderId, duration, userId } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const audio = await audioService.createAudio({
      title,
      script,
      fileUrl: `/audio/${file.filename}`,
      duration: Number(duration),
      folderId: Number(folderId),
      createdBy: Number(userId),
    });

    res.status(201).json({ success: true, data: audio });
  } catch (err) {
    return next(err);
  }
};

export const getAudioById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const audio = await audioService.getAudioById(Number(id));

    if (!audio) {
      res.status(404).json({ success: false, message: 'Audio not found' });
      return;
    }

    if (userId && audio.createdBy !== Number(userId)) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    res.json({ success: true, data: audio });
  } catch (error) {
    return next(error);
  }
};

export const updateAudio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, script, folderId, userId } = req.body;

    const existingAudio = await audioService.getAudioById(Number(id));
    if (!existingAudio) {
      res.status(404).json({ success: false, message: 'Audio not found' });
      return;
    }

    if (existingAudio.createdBy !== Number(userId)) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (script !== undefined) updateData.script = script;
    if (folderId) updateData.folderId = Number(folderId);

    const updatedAudio = await audioService.updateAudio(Number(id), updateData);
    res.json({ success: true, data: updatedAudio, message: 'Audio updated successfully' });
  } catch (error) {
    return next(error);
  }
};

export const deleteAudio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      res.status(400).json({ success: false, message: 'userId is required' });
      return;
    }

    const audio = await audioService.getAudioById(Number(id));
    if (!audio) {
      res.status(404).json({ success: false, message: 'Audio not found' });
      return;
    }

    if (audio.createdBy !== Number(userId)) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '../../public', audio.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // ✅ Cascade delete sẽ tự động xóa audioStats, quizzes, quizAttemptLogs
    await audioService.deleteAudio(Number(id));
    res.json({ success: true, data: null, message: 'Audio deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

export const moveAudio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { folderId, userId } = req.body;
    if (!folderId) {
      res.status(400).json({ success: false, message: 'folderId is required' });
      return;
    }

    if (!userId) {
      res.status(400).json({ success: false, message: 'userId is required' });
      return;
    }

    const audio = await audioService.getAudioById(Number(id));
    if (!audio) {
      res.status(404).json({ success: false, message: 'Audio not found' });
      return;
    }

    if (audio.createdBy !== Number(userId)) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const movedAudio = await audioService.moveAudio(Number(id), Number(folderId));
    res.json({ success: true, data: movedAudio, message: 'Audio moved successfully' });
  } catch (error) {
    return next(error);
  }
};

export const toggleFavorite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const updated = await audioService.toggleFavorite(Number(id), Number(userId));

    if (!updated) {
      res.status(404).json({ success: false, message: 'Audio not found or not owned by user' });
      return;
    }

    res.status(200).json({ success: true, message: 'Favorite updated', data: updated });
  } catch (err) {
    return next(err);
  }
};

export const getRecentlyListened = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, limit } = req.query;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'userId is required'
      });
      return;
    }

    const limitNum = limit ? Math.min(parseInt(limit as string), 50) : 10;
    const audios = await audioService.getRecentlyListened(Number(userId), limitNum);

    res.json({ success: true, data: audios });
  } catch (error) {
    next(error);
  }
};

// ✅ Sửa lại controller này để cập nhật totalListenTime khi nghe xong
export const incrementListenCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    // Ưu tiên lấy userId từ body, sau đó query, sau đó req.userId (nếu có middleware auth)
    const userId =
      req.body.userId ||
      req.query.userId ||
      (req as any).userId;
    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'userId is required'
      });
      return;
    }

    // Lấy audio để lấy duration
    const audio = await audioService.getAudioById(Number(id));
    if (!audio) {
      res.status(404).json({ success: false, message: 'Audio not found' });
      return;
    }

    // Tăng listenCount
    const audioStats = await audioService.incrementListenCount(Number(id), Number(userId));

    // Cập nhật UserDailyActivity: cộng thêm duration vào totalListenTime
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.userDailyActivity.upsert({
      where: {
        userId_date: {
          userId: Number(userId),
          date: today,
        },
      },
      update: {
        totalListenTime: {
          increment: audio.duration || 0,
        },
        didListen: true,
      },
      create: {
        userId: Number(userId),
        date: today,
        totalListenTime: audio.duration || 0,
        didListen: true,
        didQuiz: false,
      },
    });

    res.json({
      success: true,
      data: audioStats,
      message: 'Listen count incremented and totalListenTime updated'
    });
  } catch (error) {
    next(error);
  }
};

export const getRandomAudiosFromMyList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, limit } = req.query;
    // Validate userId
    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'userId is required'
      });
      return;
    }

    const limitNum = limit ? Math.min(parseInt(limit as string), 50) : 10;
    const audios = await audioService.getRandomAudiosFromMyList(Number(userId), limitNum);

    res.json({ success: true, data: audios });
  } catch (error) {
    next(error);
  }

};

export const getRandomAudiosFromCommunity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, limit } = req.query;

    // Validate userId
    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'userId is required'
      });
      return;
    }

    const limitNum = limit ? Math.min(parseInt(limit as string), 50) : 10;
    const audios = await audioService.getRandomAudiosFromCommunity(Number(userId), limitNum);

    res.json({ success: true, data: audios });
  } catch (error) {
    next(error);
  }
};

