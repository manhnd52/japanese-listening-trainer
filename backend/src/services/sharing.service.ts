import { prisma } from "../prisma";

interface ShareFolderByEmailDto {
  folderId: number;
  ownerId: number;
  email: string;
}

export class FolderShareService {

  async shareFolderByEmail(data: ShareFolderByEmailDto) {
    const { folderId, ownerId, email } = data;

    const folder = await prisma.folder.findFirst({
      where: { id: folderId, createdBy: ownerId },
    });

    if (!folder) {
      throw new Error("Folder not found or access denied");
    }

    const targetUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      throw new Error("User with this email does not exist");
    }

    if (targetUser.id === ownerId) {
      throw new Error("Cannot share folder with yourself");
    }

    const existingShare = await prisma.folderShare.findFirst({
      where: { folderId, userId: targetUser.id },
    });

    if (existingShare) {
      throw new Error("Folder already shared with this user");
    }

    return prisma.folderShare.create({
      data: {
        folderId,
        userId: targetUser.id,
      },
      include: {
        user: {
          select: { id: true, fullname: true, email: true },
        },
      },
    });
  }

  async getSharedFolders(userId: number) {
    return prisma.folder.findMany({
      where: {
        folderShares: { some: { userId } },
      },
      include: {
        user: {
          select: { id: true, fullname: true, email: true },
        },
        _count: {
          select: { audios: true, folderShares: true },
        },
      },
    });
  }

  async removeShare(folderId: number, ownerId: number, targetUserId: number) {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, createdBy: ownerId },
    });

    if (!folder) {
      throw new Error("Folder not found or access denied");
    }

    const result = await prisma.folderShare.deleteMany({
      where: { folderId, userId: targetUserId },
    });

    if (result.count === 0) {
      throw new Error("Share record not found");
    }

    return { message: "Folder share removed successfully" };
  }
}

export const folderShareService = new FolderShareService();
