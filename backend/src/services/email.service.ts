import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: false,
    auth: {
        user: config.smtpUser,
        pass: config.smtpPass
    }
});

export const sendStreakReminderEmail = async (to: string, fullname: string) => {
  const subject = "🔥 Đừng để mất chuỗi Streak của bạn!";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #ea580c;">Chào ${fullname},</h2>
      <p>Hôm nay bạn chưa luyện nghe tiếng Nhật bài nào cả.</p>
      <p>Chỉ còn vài tiếng nữa là hết ngày, hãy vào học ngay để duy trì chuỗi <b>Streak</b> của mình nhé!</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${config.corsOrigin}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Vào học ngay
        </a>
      </div>
      
      <p style="color: #666; font-size: 12px;">Bạn nhận được email này vì đã bật thông báo nhắc nhở từ Japanese Listening Trainer.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: config.smtpFrom,
      to,
      subject,
      html,
    });
    console.log(`[Email] Reminder sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}:`, error);
    return false;
  }
};