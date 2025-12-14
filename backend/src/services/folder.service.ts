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

async function createFolder(data: CreateFolderDto) {
    try {
        const folder = await prisma.folder.create({
            data: {
                name: data.name,
                isPublic: data.isPublic ?? false,
                createdBy: data.createdBy,
            },
        });
        return folder;
    } catch (error) {
        console.error("Error creating folder:", error);
        throw error;
    }
}

async function getFoldersByUserId(userId: number) {
    try {
        const folders = await prisma.folder.findMany({
            where: {
                createdBy: userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return folders;
    } catch (error) {
        console.error("Error fetching folders:", error);
        throw error;
    }
}

async function getFolderById(id: number, userId?: number) {
    try {
        const folder = await prisma.folder.findFirst({
            where: {
                id,
                OR: [
                    { createdBy: userId },
                    { isPublic: true }
                ]
            },
        });
        return folder;
    } catch (error) {
        console.error("Error fetching folder:", error);
        throw error;
    }
}

async function updateFolder(id: number, userId: number, data: UpdateFolderDto) {
    try {
        const existingFolder = await prisma.folder.findFirst({
            where: {
                id,
                createdBy: userId,
            }
        });

        if (!existingFolder) {
            throw new Error("Folder not found or access denied");
        }

        const updatedFolder = await prisma.folder.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
            },
        });
        return updatedFolder;
    } catch (error) {
        console.error("Error updating folder:", error);
        throw error;
    }
}

async function deleteFolder(id: number, userId: number) {
    try {
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

        await prisma.folder.delete({
            where: { id }
        });

        return { message: "Folder deleted successfully" };
    } catch (error) {
        console.error("Error deleting folder:", error);
        throw error;
    }
}


export const folderService = {
    createFolder,
    getFoldersByUserId,
    getFolderById,
    updateFolder,
    deleteFolder,
};
