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
        return await prisma.folder.findFirst({
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
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                folderShares: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                fullname: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        audios: true,
                        folderShares: true,
                    },
                },
            },
        });
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
}

export const folderService = new FolderService();
