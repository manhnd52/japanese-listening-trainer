import { Prisma } from '../generated/prisma/client';
import { prisma } from '../prisma';

export class AudioService {
  async createAudio(data: any) {
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

  // NEW: Update audio
  async updateAudio(id: number, data: { title?: string; script?: string; folderId?: number }) {
    return await prisma.audio.update({
      where: { id },
      data,
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

  // NEW: Delete audio
  async deleteAudio(id: number) {
    return await prisma.audio.delete({
      where: { id },
    });
  }

  // NEW: Move audio to another folder
  async moveAudio(id: number, folderId: number) {
    return await prisma.audio.update({
      where: { id },
      data: { folderId },
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
}

export const audioService = new AudioService();