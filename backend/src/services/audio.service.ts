import { prisma } from '../prisma/index.js';

class AudioService {
  // Lấy tất cả audios của user
  async getAllAudios(filter: any, userId: number) {
    const audios = await prisma.audio.findMany({
      where: filter,
      include: {
        folder: { select: { id: true, name: true } },
        audioStats: {
          where: { userId },
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

    // Làm phẳng audioStats và thêm status
    return audios.map((audio) => {
      const listenCount = audio.audioStats[0]?.listenCount || 0;
      return {
        ...audio,
        isFavorite: audio.audioStats[0]?.isFavorite || false,
        listenCount,
        lastListenTime: audio.audioStats[0]?.lastListenTime || null,
        firstListenDone: audio.audioStats[0]?.firstListenDone || false,
        status: listenCount === 0 ? "NEW" : "idle",
        audioStats: undefined,
      };
    });
  }

  // Lấy audio theo ID
  async getAudioById(id: number) {
    return await prisma.audio.findUnique({
      where: { id },
      include: {
        folder: { select: { id: true, name: true } },
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
        folder: { select: { id: true, name: true } },
      },
    });
  }

  // Cập nhật audio
  async updateAudio(id: number, data: any) {
    return await prisma.audio.update({
      where: { id },
      data,
      include: {
        folder: { select: { id: true, name: true } },
      },
    });
  }

  // Xóa audio và các phụ thuộc
  async deleteAudio(id: number) {
    // Xóa các quiz liên quan
    const quizzes = await prisma.quiz.findMany({ where: { audioId: id }, select: { id: true } });
    const quizIds = quizzes.map(q => q.id);

    if (quizIds.length > 0) {
      await prisma.mistakeQuiz.deleteMany({ where: { quizId: { in: quizIds } } });
      await prisma.quizStats.deleteMany({ where: { quizId: { in: quizIds } } });
    }
    await prisma.quizAttemptLog.deleteMany({ where: { audioId: id } });
    await prisma.quiz.deleteMany({ where: { audioId: id } });
    await prisma.audioStats.deleteMany({ where: { audioId: id } });

    return await prisma.audio.delete({ where: { id } });
  }

  // Di chuyển audio sang folder khác
  async moveAudio(audioId: number, folderId: number) {
    return await prisma.audio.update({
      where: { id: audioId },
      data: { folderId },
      include: {
        folder: { select: { id: true, name: true } },
      },
    });
  }

  // Đánh dấu yêu thích
  async toggleFavorite(audioId: number, userId: number) {
    const existing = await prisma.audioStats.findUnique({
      where: { userId_audioId: { userId, audioId } },
    });
    const newFavoriteStatus = !existing?.isFavorite;
    return await prisma.audioStats.upsert({
      where: { userId_audioId: { userId, audioId } },
      update: { isFavorite: newFavoriteStatus },
      create: { userId, audioId, isFavorite: newFavoriteStatus },
    });
  }

  // Tăng lượt nghe
  async incrementListenCount(audioId: number, userId: number) {
    return await prisma.audioStats.upsert({
      where: { userId_audioId: { userId, audioId } },
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

  // Cập nhật tổng thời gian nghe cho user trong ngày
  async updateUserDailyListenTime(userId: number, duration: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return prisma.userDailyActivity.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        totalListenTime: { increment: duration },
        didListen: true,
      },
      create: {
        userId,
        date: today,
        totalListenTime: duration,
        didListen: true,
        didQuiz: false,
      },
    });
  }

  // Lấy recently listened audios
  async getRecentlyListened(userId: number, limit: number = 10) {
    const audioStats = await prisma.audioStats.findMany({
      where: {
        userId,
        lastListenTime: { not: null },
      },
      orderBy: { lastListenTime: 'desc' },
      take: limit,
      include: {
        audio: {
          include: { folder: { select: { id: true, name: true } } },
        },
      },
    });

    return audioStats.map((stat) => ({
      ...stat.audio,
      isFavorite: stat.isFavorite,
      listenCount: stat.listenCount,
      lastListenTime: stat.lastListenTime,
      firstListenDone: stat.firstListenDone,
      status: stat.listenCount === 0 ? "NEW" : "idle",
    }));
  }

  // Lấy random audio từ danh sách cá nhân
  async getRandomAudiosFromMyList(userId: number, limit: number = 10) {
    const audios = await prisma.audio.findMany({
      where: { createdBy: userId, isSuspend: false },
      include: {
        folder: { select: { id: true, name: true } },
        user: { select: { id: true, email: true, fullname: true } },
        audioStats: {
          where: { userId },
          select: { isFavorite: true, listenCount: true },
        },
      },
    });

    const shuffled = audios.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, limit);

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

  // Lấy random audio từ cộng đồng
  async getRandomAudiosFromCommunity(userId: number, limit: number = 10) {
    const audios = await prisma.audio.findMany({
      where: {
        isSuspend: false,
        folder: { isPublic: true },
      },
      include: {
        folder: { select: { id: true, name: true, isPublic: true } },
        user: { select: { id: true, email: true, fullname: true } },
        audioStats: {
          where: { userId },
          select: { isFavorite: true, listenCount: true },
        },
      },
    });

    const shuffled = audios.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, limit);

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

  // Xác định trạng thái nghe
  private determineStatus(listenCount?: number): 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'idle' {
    if (!listenCount || listenCount === 0) return 'NEW';
    if (listenCount >= 3) return 'COMPLETED';
    return 'IN_PROGRESS';
  }
}

export const audioService = new AudioService();