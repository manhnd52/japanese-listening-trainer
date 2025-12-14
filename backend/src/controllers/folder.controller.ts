import { Request, Response, NextFunction } from "express";
import { folderService } from "../services/folder.service";
import { successResponse, errorResponse } from "../utils/response";

// POST /api/folders/:id/share
export async function shareFolder(req: Request, res: Response, next: NextFunction) {
    try {
        const folderId = parseInt(req.params.id, 10);
        const { userId } = req.body;
        const ownerId = req.userId!;
        if (isNaN(folderId) || !userId) {
            return errorResponse(res, "Invalid folder ID or user ID", 400);
        }
        const result = await folderService.shareFolder(folderId, ownerId, userId);
        return successResponse(res, result);
    } catch (error) {
        return next(error);
    }
}

// GET /api/folders/:id/shares
export async function getFolderShares(req: Request, res: Response, next: NextFunction) {
    try {
        const folderId = parseInt(req.params.id, 10);
        const ownerId = req.userId!;
        if (isNaN(folderId)) {
            return errorResponse(res, "Invalid folder ID", 400);
        }
        const shares = await folderService.getFolderShares(folderId, ownerId);
        return successResponse(res, shares);
    } catch (error) {
        return next(error);
    }
}

// DELETE /api/folders/:id/share/:userId
export async function unshareFolder(req: Request, res: Response, next: NextFunction) {
    try {
        const folderId = parseInt(req.params.id, 10);
        const sharedUserId = parseInt(req.params.userId, 10);
        const ownerId = req.userId!;
        if (isNaN(folderId) || isNaN(sharedUserId)) {
            return errorResponse(res, "Invalid folder ID or user ID", 400);
        }
        const result = await folderService.unshareFolder(folderId, ownerId, sharedUserId);
        return successResponse(res, result);
    } catch (error) {
        return next(error);
    }
}

async function createFolder(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, isPublic } = req.body;

        if (!name || typeof name !== "string" || name.trim() === "") {
            return errorResponse(res, "Folder name is required", 400);
        }

        // Get userId from JWT token (set by authenticateToken middleware)
        const userId = req.userId!;

        const isPublicBool = isPublic === true || isPublic === 'true';

        const folder = await folderService.createFolder({
            name: name.trim(),
            isPublic: isPublicBool,
            createdBy: userId,
        });

        return successResponse(res, folder, 201);
    } catch (error) {
        return next(error);
    }
}

/**
 * GET /api/folders
 */
async function getFolders(req: Request, res: Response, next: NextFunction) {
    try {
        // Use userId from token if authenticated, otherwise undefined (public only)
        const userId = req.userId;

        const folders = await folderService.getFoldersByUserId(userId);
        return successResponse(res, folders);
    } catch (error) {
        return next(error);
    }
}

/**
 * GET /api/folders/:id
 */
async function getFolderById(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const folderId = parseInt(id, 10);

        console.log(`[FolderController] getFolderById - id: ${id}, userId: ${req.userId}`);

        if (isNaN(folderId)) {
            return errorResponse(res, "Invalid folder ID", 400);
        }

        // Use userId from token if authenticated
        const userId = req.userId;

        const folder = await folderService.getFolderById(folderId, userId);

        if (!folder) {
            console.log(`[FolderController] Folder ${folderId} not found`);
            return errorResponse(res, "Folder not found", 404);
        }

        console.log(`[FolderController] Returning folder ${folderId} with ${folder.audios?.length || 0} audios`);
        return successResponse(res, folder);
    } catch (error) {
        console.error(`[FolderController] Error:`, error);
        return next(error);
    }
}

/**
 * PUT /api/folders/:id
 */
async function updateFolder(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const folderId = parseInt(id, 10);

        if (isNaN(folderId)) {
            return errorResponse(res, "Invalid folder ID", 400);
        }

        const { name, isPublic } = req.body;

        if (name === undefined && isPublic === undefined) {
            return errorResponse(res, "At least one field (name or isPublic) is required", 400);
        }

        if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
            return errorResponse(res, "Invalid folder name", 400);
        }

        // Get userId from JWT token
        const userId = req.userId!;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name.trim();
        if (isPublic !== undefined) updateData.isPublic = isPublic;

        const updatedFolder = await folderService.updateFolder(folderId, userId, updateData);
        return successResponse(res, updatedFolder);
    } catch (error: any) {
        if (error.message === "Folder not found or access denied") {
            return errorResponse(res, error.message, 404);
        }
        return next(error);
    }
}

/**
 * DELETE /api/folders/:id
 */
async function deleteFolder(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const folderId = parseInt(id, 10);

        if (isNaN(folderId)) {
            return errorResponse(res, "Invalid folder ID", 400);
        }

        // Get userId from JWT token
        const userId = req.userId!;

        const result = await folderService.deleteFolder(folderId, userId);
        return successResponse(res, result);
    } catch (error: any) {
        if (error.message === "Folder not found or access denied") {
            return errorResponse(res, error.message, 404);
        }
        if (error.message?.includes("Cannot delete folder with audios")) {
            return errorResponse(res, error.message, 400);
        }
        return next(error);
    }
}


const FolderController = {
    createFolder,
    getFolders,
    getFolderById,
    updateFolder,
    deleteFolder,
    shareFolder,
    getFolderShares,
    unshareFolder,
};

export default FolderController;
