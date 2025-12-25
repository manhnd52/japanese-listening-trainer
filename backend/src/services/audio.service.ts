import {prisma} from '../prisma/index.js';

class AudioService {
  // Lấy tất cả audios của user
  async getAllAudios(filter: any, userId: number) {
    const audios = await prisma.audio.findMany({
      where: filter,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
        audioStats: {
          where: {
            userId: userId,
          },
          select: {
            isFavorite: true,
            listenCount: true,
            lastListenTime: true,
            firstListenDone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform để làm phẳng audioStats và thêm status
    return audios.map((audio) => {
      const listenCount = audio.audioStats[0]?.listenCount || 0;
      return {
        ...audio,
        isFavorite: audio.audioStats[0]?.isFavorite || false,
        listenCount,
        lastListenTime: audio.audioStats[0]?.lastListenTime || null,
        firstListenDone: audio.audioStats[0]?.firstListenDone || false,
        status: listenCount === 0 ? "NEW" : "idle", // ✅ Thêm status
        audioStats: undefined, // Remove array
      };
    });
  }

  // Lấy audio theo ID
  async getAudioById(id: number) {
    return await prisma.audio.findUnique({
      where: { id },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // Tạo audio mới
  async createAudio(data: {
    title: string;
    script?: string;
    fileUrl: string;
    duration: number;
    folderId: number;
    createdBy: number;
  }) {
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
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // Cập nhật audio
  async updateAudio(id: number, data: any) {
    return await prisma.audio.update({
      where: { id },
      data,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
  
  // ✅ Helper function - sửa lại logic
  private determineStatus(listenCount?: number): 'NEW' | 'IN_PROGRESS' | 'COMPLETED' {
    if (!listenCount || listenCount === 0) return 'NEW';
    if (listenCount >= 3) return 'COMPLETED'; // Nghe 3 lần = completed
    return 'IN_PROGRESS';
  }

  // ✅ Xóa audio - Xóa thủ công theo đúng thứ tự dependency
  async deleteAudio(id: number) {
    // 1. Lấy danh sách quiz liên quan đến audio
    const quizzes = await prisma.quiz.findMany({
      where: { audioId: id },
      select: { id: true },
    });

    const quizIds = quizzes.map(q => q.id);

    // 2. Xóa MistakeQuiz (phụ thuộc vào Quiz)
    if (quizIds.length > 0) {
      await prisma.mistakeQuiz.deleteMany({
        where: { quizId: { in: quizIds } },
      });
    }

    // 3. Xóa QuizStats (phụ thuộc vào Quiz)
    if (quizIds.length > 0) {
      await prisma.quizStats.deleteMany({
        where: { quizId: { in: quizIds } },
      });
    }

    // 4. Xóa QuizAttemptLog (phụ thuộc vào Quiz và Audio)
    await prisma.quizAttemptLog.deleteMany({
      where: { audioId: id },
    });

    // 5. Xóa Quiz (phụ thuộc vào Audio)
    await prisma.quiz.deleteMany({
      where: { audioId: id },
    });

    // 6. Xóa AudioStats (phụ thuộc vào Audio)
    await prisma.audioStats.deleteMany({
      where: { audioId: id },
    });

    // 7. Cuối cùng xóa Audio
    return await prisma.audio.delete({
      where: { id },
    });
  }

  // Di chuyển audio sang folder khác
  async moveAudio(audioId: number, folderId: number) {
    return await prisma.audio.update({
      where: { id: audioId },
      data: { folderId },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // Toggle favorite
  async toggleFavorite(audioId: number, userId: number) {
    // Tìm audio stats hiện tại
    const existing = await prisma.audioStats.findUnique({
      where: {
        userId_audioId: {
          userId,
          audioId,
        },
      },
    });

    // Toggle isFavorite
    const newFavoriteStatus = !existing?.isFavorite;

    // Upsert audioStats
    const updated = await prisma.audioStats.upsert({
      where: {
        userId_audioId: {
          userId,
          audioId,
        },
      },
      update: {
        isFavorite: newFavoriteStatus,
      },
      create: {
        userId,
        audioId,
        isFavorite: newFavoriteStatus,
      },
    });

    return updated;
  }

  // ✅ Increment listen count
  async incrementListenCount(audioId: number, userId: number) {
    return await prisma.audioStats.upsert({
      where: {
        userId_audioId: {
          userId,
          audioId,
        },
      },
      update: {
        listenCount: { increment: 1 },
        lastListenTime: new Date(),
        firstListenDone: true,
      },
      create: {
        userId,
        audioId,
        listenCount: 1,
        lastListenTime: new Date(),
        firstListenDone: true,
        isFavorite: false,
      },
    });
  }

  // Lấy recently listened audios
  async getRecentlyListened(userId: number, limit: number = 10) {
    const audioStats = await prisma.audioStats.findMany({
      where: {
        userId,
        lastListenTime: {
          not: null,
        },
      },
      orderBy: {
        lastListenTime: 'desc',
      },
      take: limit,
      include: {
        audio: {
          include: {
            folder: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Transform để trả về audio với stats
    return audioStats.map((stat) => ({
      ...stat.audio,
      isFavorite: stat.isFavorite,
      listenCount: stat.listenCount,
      lastListenTime: stat.lastListenTime,
      firstListenDone: stat.firstListenDone,
      status: stat.listenCount === 0 ? "NEW" : "idle", // ✅ Thêm status
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