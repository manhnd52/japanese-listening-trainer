import { Request, Response, NextFunction } from "express";
import { folderShareService } from "../services/sharing.service.js";
import { successResponse, errorResponse } from "../utils/response.js";

async function shareFolder(req: Request, res: Response, next: NextFunction) {
  try {
    const folderId = parseInt(req.params.folderId, 10);
    const { email } = req.body;
    const ownerId = req.userId!;

    if (isNaN(folderId)) {
      return errorResponse(res, "Invalid folder ID", 400);
    }

    if (!email || typeof email !== "string") {
      return errorResponse(res, "Email is required", 400);
    }

    const result = await folderShareService.shareFolderByEmail({
      folderId,
      ownerId,
      email,
    });

    return successResponse(res, result, 201);
  } catch (error: any) {
    return errorResponse(res, error.message, 400);
  }
}

async function getSharedFolders(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const folders = await folderShareService.getSharedFolders(userId);
    return successResponse(res, folders);
  } catch (error) {
    return next(error);
  }
}

async function removeShare(req: Request, res: Response, next: NextFunction) {
  try {
    const folderId = parseInt(req.params.folderId, 10);
    const userId = parseInt(req.params.userId, 10);
    const ownerId = req.userId!;

    if (isNaN(folderId) || isNaN(userId)) {
      return errorResponse(res, "Invalid ID", 400);
    }

    const result = await folderShareService.removeShare(
      folderId,
      ownerId,
      userId
    );

    return successResponse(res, result);
  } catch (error: any) {
    return errorResponse(res, error.message, 400);
  }
}

export default {
  shareFolder,
  getSharedFolders,
  removeShare,
};
