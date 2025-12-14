    import { prisma } from "../prisma";

interface CreateFolderDto {
    name: string;
    isPublic?: boolean;
    createdBy: number;
}

interface UpdateFolderDto {
    name?: string;
    isPublic?: boolean;
}

export class FolderService {
    async createFolder(data: CreateFolderDto) {
        return await prisma.folder.create({
            data: {
                name: data.name,
                isPublic: data.isPublic ?? false,
                createdBy: data.createdBy,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        fullname: true,
                    },
                },
                audios: true,
            },
        });
    }

    async getFoldersByUserId(userId?: number) {
        return await prisma.folder.findMany({
            where: userId ? {
                createdBy: userId,
            } : {
                isPublic: true,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        fullname: true,
                    },
                },
                audios: true,
                _count: {
                    select: {
                        audios: true,
                        folderShares: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getFolderById(id: number, userId?: number) {
        console.log(`[FolderService] getFolderById - id: ${id}, userId: ${userId}`);
        
        const startTime = Date.now();
        const folder = await prisma.folder.findFirst({
            where: {
                id,
                OR: [
                    { createdBy: userId },
                    { isPublic: true }
                ]
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        fullname: true,
                    },
                },
                audios: {
                    select: {
                        id: true,
                        title: true,
                        script: true,
                        fileUrl: true,
                        duration: true,
                        createdAt: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 100, // Limit to 100 audios for performance
                },
                folderShares: {
                    select: {
                        id: true,
                        userId: true,
                        user: {
                            select: {
                                id: true,
                                email: true,
                                fullname: true,
                            },
                        },
                    },
                    take: 10, // Limit folder shares
                },
                _count: {
                    select: {
                        audios: true,
                        folderShares: true,
                    },
                },
            },
        });
        
        const duration = Date.now() - startTime;
        console.log(`[FolderService] Query completed in ${duration}ms. Folder found: ${!!folder}, audios count: ${folder?.audios?.length || 0}`);
        return folder;
    }

    async updateFolder(id: number, userId: number, data: UpdateFolderDto) {
        const existingFolder = await prisma.folder.findFirst({
            where: {
                id,
                createdBy: userId,
            }
        });

        if (!existingFolder) {
            throw new Error("Folder not found or access denied");
        }

        return await prisma.folder.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        fullname: true,
                    },
                },
                audios: true,
                _count: {
                    select: {
                        audios: true,
                        folderShares: true,
                    },
                },
            },
        });
    }

    async deleteFolder(id: number, userId: number) {
        const existingFolder = await prisma.folder.findFirst({
            where: {
                id,
                createdBy: userId,
            },
        });

        if (!existingFolder) {
            throw new Error("Folder not found or access denied");
        }

        const audioCount = await prisma.audio.count({
            where: { folderId: id },
        });

        if (audioCount > 0) {
            throw new Error("Cannot delete folder with audios. Please delete all audios first.");
        }

        return await prisma.folder.delete({
            where: { id }
        });
    }

    // Share folder to another user
    async shareFolder(folderId: number, ownerId: number, userId: number) {
        // Only owner can share
        const folder = await prisma.folder.findUnique({ where: { id: folderId } });
        if (!folder || folder.createdBy !== ownerId) {
            throw new Error("Only owner can share this folder");
        }
        // Prevent sharing to self
        if (ownerId === userId) {
            throw new Error("Cannot share folder to yourself");
        }
        // Prevent duplicate share
        const exists = await prisma.folderShare.findFirst({ where: { folderId, userId } });
        if (exists) {
            throw new Error("Folder already shared to this user");
        }
        const share = await prisma.folderShare.create({
            data: { folderId, userId },
            include: { user: { select: { id: true, email: true, fullname: true } } }
        });
        return share;
    }

    // Get all users shared with this folder
    async getFolderShares(folderId: number, ownerId: number) {
        const folder = await prisma.folder.findUnique({ where: { id: folderId } });
        if (!folder || folder.createdBy !== ownerId) {
            throw new Error("Only owner can view shares");
        }
        return await prisma.folderShare.findMany({
            where: { folderId },
            include: { user: { select: { id: true, email: true, fullname: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Remove share
    async unshareFolder(folderId: number, ownerId: number, userId: number) {
        const folder = await prisma.folder.findUnique({ where: { id: folderId } });
        if (!folder || folder.createdBy !== ownerId) {
            throw new Error("Only owner can unshare");
        }
        const deleted = await prisma.folderShare.deleteMany({ where: { folderId, userId } });
        return { success: true, deleted: deleted.count };
    }
}

export const folderService = new FolderService();
