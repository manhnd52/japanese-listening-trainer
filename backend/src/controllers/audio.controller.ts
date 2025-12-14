import { Request, Response, NextFunction } from 'express';
import { audioService } from '../services/audio.service';
import path from 'path';
import fs from 'fs';

export const getAudioList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, isSuspend, folderId, userId } = req.query;
    
    // ✅ BẮT BUỘC phải có userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }
    
    const filter: any = {
      createdBy: Number(userId) // ✅ Luôn filter theo userId
    };
    
    if (search) filter.title = { contains: search as string, mode: 'insensitive' };
    if (isSuspend !== undefined) filter.isSuspend = isSuspend === 'true';
    if (folderId !== undefined) filter.folderId = Number(folderId);

    const audios = await audioService.getAllAudios(filter);

    res.json({ success: true, data: audios });
  } catch (error) {
    next(error);
  }
};

export const createAudio = async (
  req: Request & { file?: any },
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, script, folderId, duration, userId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // ✅ Validate userId
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const audio = await audioService.createAudio({
      title,
      script,
      fileUrl: `/audio/${file.filename}`,
      duration: Number(duration),
      folderId: Number(folderId),
      createdBy: Number(userId),
    });

    return res.status(201).json({ success: true, data: audio });
  } catch (err) {
    next(err);
  }
};

export const getAudioById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const audio = await audioService.getAudioById(Number(id));

    if (!audio) {
      return res.status(404).json({ success: false, message: 'Audio not found' });
    }

    // ✅ Kiểm tra quyền sở hữu
    if (userId && audio.createdBy !== Number(userId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: audio });
  } catch (error) {
    next(error);
  }
};

export const updateAudio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, script, folderId, userId } = req.body;

    // ✅ Validate userId
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const existingAudio = await audioService.getAudioById(Number(id));
    if (!existingAudio) {
      return res.status(404).json({ success: false, message: 'Audio not found' });
    }

    // ✅ Kiểm tra quyền sở hữu
    if (existingAudio.createdBy !== Number(userId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

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

export const deleteAudio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    // ✅ Validate userId
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const audio = await audioService.getAudioById(Number(id));
    if (!audio) {
      return res.status(404).json({ success: false, message: 'Audio not found' });
    }

    // ✅ Kiểm tra quyền sở hữu
    if (audio.createdBy !== Number(userId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '../../public', audio.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await audioService.deleteAudio(Number(id));
    res.json({ success: true, data: null, message: 'Audio deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const moveAudio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { folderId, userId } = req.body;

    if (!folderId) {
      return res.status(400).json({ success: false, message: 'folderId is required' });
    }

    // ✅ Validate userId
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const audio = await audioService.getAudioById(Number(id));
    if (!audio) {
      return res.status(404).json({ success: false, message: 'Audio not found' });
    }

    // ✅ Kiểm tra quyền sở hữu
    if (audio.createdBy !== Number(userId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const movedAudio = await audioService.moveAudio(Number(id), Number(folderId));
    res.json({ success: true, data: movedAudio, message: 'Audio moved successfully' });
  } catch (error) {
    next(error);
  }
};