import { Request, Response, NextFunction } from 'express';
import { audioService } from '../services/audio.service';
import path from 'path';
import fs from 'fs';

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

export const createAudio = async (
  req: Request & { file?: any },
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, script, folderId, duration, createdBy } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const audio = await audioService.createAudio({
      title,
      script,
      fileUrl: `/audio/${file.filename}`,
      duration: Number(duration),
      folderId: Number(folderId),
      createdBy: Number(createdBy),
    });

    return res.status(201).json({ success: true, data: audio });
  } catch (err) {
    next(err);
  }
};

// NEW: Get audio by ID
export const getAudioById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const audio = await audioService.getAudioById(Number(id));

    if (!audio) {
      return res.status(404).json({ success: false, message: 'Audio not found' });
    }

    res.json({ success: true, data: audio });
  } catch (error) {
    next(error);
  }
};

// NEW: Update audio
export const updateAudio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, script, folderId } = req.body;

    // Check if audio exists
    const existingAudio = await audioService.getAudioById(Number(id));
    if (!existingAudio) {
      return res.status(404).json({ success: false, message: 'Audio not found' });
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

// NEW: Delete audio
export const deleteAudio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if audio exists
    const audio = await audioService.getAudioById(Number(id));
    if (!audio) {
      return res.status(404).json({ success: false, message: 'Audio not found' });
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

// NEW: Move audio to another folder
export const moveAudio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { folderId } = req.body;

    if (!folderId) {
      return res.status(400).json({ success: false, message: 'folderId is required' });
    }

    // Check if audio exists
    const audio = await audioService.getAudioById(Number(id));
    if (!audio) {
      return res.status(404).json({ success: false, message: 'Audio not found' });
    }

    const movedAudio = await audioService.moveAudio(Number(id), Number(folderId));
    res.json({ success: true, data: movedAudio, message: 'Audio moved successfully' });
  } catch (error) {
    next(error);
  }
};