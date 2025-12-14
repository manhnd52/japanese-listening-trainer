import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; 
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20, 
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.json({
      notifications,
        unreadCount,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }

};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const notification = await prisma.notification.findFirst({
        where: { id: Number(id), userId }
    });

    if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await prisma.notification.update({
      where: { id: Number(id) },
      data: { isRead: true },
    });

    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};