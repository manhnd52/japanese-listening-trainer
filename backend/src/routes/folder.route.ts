import { Router } from "express";
import FolderController from "../controllers/folder.controller";

const router = Router();

router.get("/", FolderController.getFolders);

router.get("/:id", FolderController.getFolderById);

router.post("/", FolderController.createFolder);

router.put("/:id", FolderController.updateFolder);

router.delete("/:id", FolderController.deleteFolder);

export default router;
