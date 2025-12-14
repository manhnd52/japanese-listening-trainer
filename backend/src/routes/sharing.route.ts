import { Router } from "express";
import SharingController from "../controllers/sharing.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { checkFolderOwnerPermission } from "../middlewares/sharringFolder";

const router = Router();

// Protected: Share folder (requires auth)
router.post(
    '/:folderId/share',
    authenticateToken,
    checkFolderOwnerPermission,
    SharingController.shareFolder
);

// Protected: Get folder shares (requires auth)
router.get(
    '/shared',
    authenticateToken,
    SharingController.getSharedFolders
);

// Protected: Unshare folder (requires auth)
router.delete(
    '/:folderId/share/:userId',
    authenticateToken,
    checkFolderOwnerPermission,
    SharingController.removeShare
);

export default router;