import { Router } from "express";
import FolderController from "../controllers/folder.controller";
import { authenticateToken, optionalAuth } from "../middlewares/auth.middleware";

const router = Router();

// Public: Get folders (with optional auth to see private folders)
router.get("/", optionalAuth, FolderController.getFolders);

// Public/Private: Get folder by ID (public folders accessible to all)

// Get folder by ID
router.get("/:id", optionalAuth, FolderController.getFolderById);

// Share folder to another user
router.post("/:id/share", authenticateToken, FolderController.shareFolder);

// Get all users shared with this folder
router.get("/:id/shares", authenticateToken, FolderController.getFolderShares);

// Remove share for a user
router.delete("/:id/share/:userId", authenticateToken, FolderController.unshareFolder);

// Protected: Create folder (requires auth)
router.post("/", authenticateToken, FolderController.createFolder);

// Protected: Update folder (requires auth + ownership check in controller)
router.put("/:id", authenticateToken, FolderController.updateFolder);

// Protected: Delete folder (requires auth + ownership check in controller)
router.delete("/:id", authenticateToken, FolderController.deleteFolder);

export default router;
