import { Request, Response, NextFunction } from 'express';
import { audioService } from '../services/audio.service';

export const createAudio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, script, overview, fileUrl, duration, folderId, createdBy } = req.body;
    
    // Basic validation
    if (!title || !fileUrl || !folderId || !createdBy) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const audio = await audioService.createAudio({
      title,
      script,
      overview,
      fileUrl,
      duration: duration || 0,
      folder: { connect: { id: Number(folderId) } },
      user: { connect: { id: Number(createdBy) } }
    });

    res.status(201).json(audio);
  } catch (error) {
    next(error);
  }
};

export const getAudios = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const audios = await audioService.getAllAudios();
    res.json(audios);
  } catch (error) {
    next(error);
  }
};

export const getAudio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const audio = await audioService.getAudioById(Number(id));
    
    if (!audio) {
      return res.status(404).json({ message: 'Audio not found' });
    }
    
    res.json(audio);
  } catch (error) {
    next(error);
  }
};
