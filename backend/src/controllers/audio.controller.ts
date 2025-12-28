import { Request, Response, NextFunction } from 'express';
import { audioService } from '../services/audio.service.js';
import path from 'path';
import fs from 'fs';

// Lấy danh sách audio
export const getAudioList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, isSuspend, folderId, userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    const filter: any = { createdBy: Number(userId) };
    if (search) filter.title = { contains: search as string, mode: 'insensitive' };
    if (isSuspend !== undefined) filter.isSuspend = isSuspend === 'true';
    if (folderId !== undefined) filter.folderId = Number(folderId);

    const audios = await audioService.getAllAudios(filter, Number(userId));
    res.json({ success: true, data: audios });
  } catch (error) {
    next(error);
  }
};

// Tạo audio mới
export const createAudio = async (
  req: Request & { file?: any },
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, script, folderId, duration, userId } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });

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
    next(err);
  }
};

// Lấy audio theo id
export const getAudioById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    const audio = await audioService.getAudioById(Number(id));
    if (!audio) return res.status(404).json({ success: false, message: 'Audio not found' });
    if (userId && audio.createdBy !== Number(userId)) return res.status(403).json({ success: false, message: 'Access denied' });
    res.json({ success: true, data: audio });
  } catch (error) {
    next(error);
  }
};

// Cập nhật audio
export const updateAudio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, script, folderId, userId } = req.body;
    const existingAudio = await audioService.getAudioById(Number(id));
    if (!existingAudio) return res.status(404).json({ success: false, message: 'Audio not found' });
    if (existingAudio.createdBy !== Number(userId)) return res.status(403).json({ success: false, message: 'Access denied' });

    const updateData: any = {};
    if (title) updateData.title = title;
    if (script !== undefined) updateData.script = script;
    if (folderId) updateData.folderId = Number(folderId);

    const updatedAudio = await audioService.updateAudio(Number(id), updateData);
    res.json({ success: true, data: updatedAudio, message: 'Audio updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Xóa audio
export const deleteAudio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    const audio = await audioService.getAudioById(Number(id));
    if (!audio) return res.status(404).json({ success: false, message: 'Audio not found' });
    if (audio.createdBy !== Number(userId)) return res.status(403).json({ success: false, message: 'Access denied' });

    // Xóa file vật lý
    const filePath = path.join(__dirname, '../../public', audio.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await audioService.deleteAudio(Number(id));
    res.json({ success: true, data: null, message: 'Audio deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Di chuyển audio sang folder khác
export const moveAudio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { folderId, userId } = req.body;
    if (!folderId) return res.status(400).json({ success: false, message: 'folderId is required' });
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    const audio = await audioService.getAudioById(Number(id));
    if (!audio) return res.status(404).json({ success: false, message: 'Audio not found' });
    if (audio.createdBy !== Number(userId)) return res.status(403).json({ success: false, message: 'Access denied' });

    const movedAudio = await audioService.moveAudio(Number(id), Number(folderId));
    res.json({ success: true, data: movedAudio, message: 'Audio moved successfully' });
  } catch (error) {
    next(error);
  }
};

// Đánh dấu yêu thích
export const toggleFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const updated = await audioService.toggleFavorite(Number(id), Number(userId));
    if (!updated) return res.status(404).json({ success: false, message: 'Audio not found or not owned by user' });
    res.status(200).json({ success: true, message: 'Favorite updated', data: updated });
  } catch (err) {
    next(err);
  }
};

// Lấy danh sách audio vừa nghe
export const getRecentlyListened = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, limit } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    const limitNum = limit ? Math.min(parseInt(limit as string), 50) : 10;
    const audios = await audioService.getRecentlyListened(Number(userId), limitNum);
    res.json({ success: true, data: audios });
  } catch (error) {
    next(error);
  }
};

// Tăng lượt nghe và cập nhật tổng thời gian nghe
export const incrementListenCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId || req.query.userId || (req as any).userId;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    const audio = await audioService.getAudioById(Number(id));
    if (!audio) return res.status(404).json({ success: false, message: 'Audio not found' });

    const audioStats = await audioService.incrementListenCount(Number(id), Number(userId));
    await audioService.updateUserDailyListenTime(Number(userId), audio.duration || 0);

    res.json({
      success: true,
      data: audioStats,
      message: 'Listen count incremented and totalListenTime updated'
    });
  } catch (error) {
    next(error);
  }
};

// Lấy random audio từ danh sách cá nhân
export const getRandomAudiosFromMyList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, limit } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    const limitNum = limit ? Math.min(parseInt(limit as string), 50) : 10;
    const audios = await audioService.getRandomAudiosFromMyList(Number(userId), limitNum);
    res.json({ success: true, data: audios });
  } catch (error) {
    next(error);
  }
};

// Lấy random audio từ cộng đồng
export const getRandomAudiosFromCommunity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, limit } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    const limitNum = limit ? Math.min(parseInt(limit as string), 50) : 10;
    const audios = await audioService.getRandomAudiosFromCommunity(Number(userId), limitNum);
    res.json({ success: true, data: audios });
  } catch (error) {
    next(error);
  }
};