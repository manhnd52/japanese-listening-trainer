import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma";
import { errorResponse } from "../utils/response";

export async function checkFolderOwnerPermission(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const folderId = parseInt(req.params.folderId, 10);
  const ownerId = req.userId;

  if (!ownerId || isNaN(folderId)) {
    return errorResponse(res, "Unauthorized", 401);
  }

  const folder = await prisma.folder.findFirst({
    where: { id: folderId, createdBy: ownerId },
  });

  if (!folder) {
    return errorResponse(res, "Only folder owner can share", 403);
  }

  next();
}
