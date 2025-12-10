import { Request, Response, NextFunction } from 'express';
import { audioService } from '../services/audio.service';

export const getAudioList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, isSuspend, folderId, createdBy } = req.query;
    const filter: any = {};
    if (search) filter.title = { contains: search as string, mode: 'insensitive' };
    if (isSuspend !== undefined) filter.isSuspend = isSuspend === 'true';
    if (folderId !== undefined) filter.folderId = Number(folderId);
    if (createdBy !== undefined) filter.createdBy = Number(createdBy);

    const audios = await audioService.getAllAudios(filter);

    res.json({ success: true, data: audios });
  } catch (error) {
    next(error);
  }
};