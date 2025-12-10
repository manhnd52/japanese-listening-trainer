import { prisma } from '../prisma';
import { Prisma } from 'prisma';

export class AudioService {
  async createAudio(data: Prisma.AudioCreateInput) {
    return await prisma.audio.create({
      data,
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
            fullname: true
          }
        }
      }
    });
  }

  async getAllAudios(filter?: Prisma.AudioWhereInput) {
    return await prisma.audio.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      include: {
        folder: true
      }
    });
  }

  async updateAudio(id: number, data: Prisma.AudioUpdateInput) {
    return await prisma.audio.update({
      where: { id },
      data,
    });
  }

  async deleteAudio(id: number) {
    return await prisma.audio.delete({
      where: { id },
    });
  }
}

export const audioService = new AudioService();
