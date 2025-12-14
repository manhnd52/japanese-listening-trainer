// backend/src/routes/notification.route.ts
import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notification.controller';
import { authenticateToken } from '../middlewares/auth.middleware'; // Đảm bảo đường dẫn này đúng với project của bạn

const router = Router();

// Tất cả các route dưới đây đều yêu cầu đăng nhập
router.use(authenticateToken);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);

export default router;