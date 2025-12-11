import { Prisma } from '../generated/prisma/client';
import { prisma } from '../prisma';

export class AudioService {
  async createAudio(data: any) { // Dùng any tạm thời để tránh lỗi type
    return await prisma.audio.create({
      data: {
        title: data.title,
        script: data.script,
        fileUrl: data.fileUrl,
        duration: data.duration,
        folderId: data.folderId,
        createdBy: data.createdBy,
      },
      include: {
        folder: true,
        user: {
          select: {
            id: true,
            email: true,
            fullname: true,
          },
        },
      },
    });
  }

  async getAudioById(id: number) {
    return await prisma.audio.findUnique({
      where: { id },
      include: {
        folder: true,
        user: {
          select: {
            id: true,
            email: true,
            fullname: true,
          },
        },
      },
    });
  }

  async getAllAudios(filter?: Prisma.AudioWhereInput) {
    return await prisma.audio.findMany({
      where: filter,
      include: {
        folder: true,
        user: {
          select: {
            id: true,
            email: true,
            fullname: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });
  }
}

export const audioService = new AudioService();