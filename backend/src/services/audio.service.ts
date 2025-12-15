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

  // ✅ THAY ĐỔI: Thêm userId parameter và transform data
  async getAllAudios(filter?: Prisma.AudioWhereInput, userId?: number) {
    const audios = await prisma.audio.findMany({
      where: filter,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            fullname: true,
          },
        },
        // ✅ Include AudioStats của user này (nếu có userId)
        audioStats: userId ? {
          where: { userId },
          select: {
            isFavorite: true,
            listenCount: true,
            // completionPercentage: true, // Tạm bỏ nếu field không tồn tại
          }
        } : false
      },
      orderBy: { id: 'desc' },
    });

    // ✅ Transform data để match với frontend type
    return audios.map(audio => {
      const stats = audio.audioStats?.[0];
      
      return {
        id: audio.id.toString(),
        title: audio.title,
        url: audio.fileUrl, // frontend expect 'url', backend có 'fileUrl'
        duration: audio.duration,
        folderId: audio.folderId.toString(),
        folderName: audio.folder.name,
        script: audio.script,
        createdBy: audio.createdBy,
        // ✅ Determine status based on listenCount (thay vì completionPercentage)
        status: this.determineStatus(stats?.listenCount),
        isFavorite: stats?.isFavorite || false,
        listenCount: stats?.listenCount || 0,
        completionPercentage: 0, // Tạm set 0
      };
    });
  }

  // ✅ Helper function - sửa lại logic
  private determineStatus(listenCount?: number): 'NEW' | 'IN_PROGRESS' | 'COMPLETED' {
    if (!listenCount || listenCount === 0) return 'NEW';
    if (listenCount >= 3) return 'COMPLETED'; // Nghe 3 lần = completed
    return 'IN_PROGRESS';
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

  async toggleFavorite(audioId: number, userId: number) {
    const audio = await prisma.audio.findUnique({
      where: { id: audioId }
    });
    if (!audio) return null;

    const stats = await prisma.audioStats.findUnique({
      where: {
        userId_audioId: { userId, audioId }
      }
    });

    if (!stats) {
      return prisma.audioStats.create({
        data: {
          userId,
          audioId,
          isFavorite: true
        }
      });
    }

    return prisma.audioStats.update({
      where: {
        userId_audioId: { userId, audioId }
      },
      data: {
        isFavorite: !stats.isFavorite
      }
    });
  }


  /**
   * Get recently listened audios for a user
   * Sorted by lastListenTime in descending order
   */
  async getRecentlyListened(userId: number, limit: number = 10) {
    const recentlyListened = await prisma.audioStats.findMany({
      where: {
        userId,
        lastListenTime: { not: null }
      },
      orderBy: {
        lastListenTime: 'desc'
      },
      take: limit,
      include: {
        audio: {
          include: {
            folder: {
              select: { id: true, name: true }
            },
            user: {
              select: { id: true, email: true, fullname: true }
            }
          }
        }
      }
    });

    // nếu frontend cần audio là root
    return recentlyListened.map(s => ({
      ...s.audio,
      audioStats: {
        isFavorite: s.isFavorite,
        listenCount: s.listenCount,
        lastListenTime: s.lastListenTime
      }
    }));
  }

  /**
   * Get random audios from user's own folders for Relax mode
   */
  async getRandomAudiosFromMyList(userId: number, limit: number = 10) {
    // Get all audios from user's folders
    const audios = await prisma.audio.findMany({
      where: {
        createdBy: userId,
        isSuspend: false
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            fullname: true,
          },
        },
        audioStats: {
          where: { userId },
          select: {
            isFavorite: true,
            listenCount: true,
          }
        }
      }
    });

    // Shuffle the array randomly
    const shuffled = audios.sort(() => 0.5 - Math.random());
    
    // Get first N items
    const selected = shuffled.slice(0, limit);

    // Transform to match frontend format
    return selected.map(audio => {
      const stats = audio.audioStats?.[0];
      
      return {
        id: audio.id.toString(),
        title: audio.title,
        url: audio.fileUrl,
        duration: audio.duration,
        folderId: audio.folderId.toString(),
        folderName: audio.folder.name,
        script: audio.script,
        createdBy: audio.createdBy,
        status: this.determineStatus(stats?.listenCount),
        isFavorite: stats?.isFavorite || false,
        listenCount: stats?.listenCount || 0,
        completionPercentage: 0,
      };
    });
  }

  /**
   * Get random audios from all public folders for Relax mode
   */
  async getRandomAudiosFromCommunity(userId: number, limit: number = 10) {
    // Get all audios from public folders
    const audios = await prisma.audio.findMany({
      where: {
        isSuspend: false,
        folder: {
          isPublic: true
        }
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            isPublic: true,
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            fullname: true,
          },
        },
        audioStats: {
          where: { userId },
          select: {
            isFavorite: true,
            listenCount: true,
          }
        }
      }
    });

    // Shuffle the array randomly
    const shuffled = audios.sort(() => 0.5 - Math.random());
    
    // Get first N items
    const selected = shuffled.slice(0, limit);

    // Transform to match frontend format
    return selected.map(audio => {
      const stats = audio.audioStats?.[0];
      
      return {
        id: audio.id.toString(),
        title: audio.title,
        url: audio.fileUrl,
        duration: audio.duration,
        folderId: audio.folderId.toString(),
        folderName: audio.folder.name,
        script: audio.script,
        createdBy: audio.createdBy,
        status: this.determineStatus(stats?.listenCount),
        isFavorite: stats?.isFavorite || false,
        listenCount: stats?.listenCount || 0,
        completionPercentage: 0,
      };
    });
  }

}

export const audioService = new AudioService();