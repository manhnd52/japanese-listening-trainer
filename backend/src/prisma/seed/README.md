# Database Seed Scripts

Seed scripts để tạo dữ liệu mẫu đầy đủ cho database.

## Cấu trúc

- **seed.user.ts** - Tạo 1 user demo
- **seed.folder.ts** - Tạo 5 folder mẫu (N5, N4, N3, Daily Conversations, Business Japanese)
- **seed.audio.ts** - Tạo audio records từ file mp3 trong `public/audio`
- **seed.audioStats.ts** - Tạo thống kê nghe audio cho user
- **seed.userSetting.ts** - Tạo settings cho user
- **seed.gamification.ts** - Tạo dữ liệu gamification (XP, Streak, Leaderboard)
- **seed.achievement.ts** - Tạo achievements và unlock một số achievement cho user
- **seed.quiz.ts** - Tạo quiz questions cho các audio
- **index.ts** - File chính để chạy tất cả seed scripts

## Cách sử dụng

### 1. Chạy seed

```bash
npm run seed
```

Script sẽ:
1. **Xóa tất cả dữ liệu cũ**
2. **Tạo User**: 1 demo user
3. **Tạo Folders**: 5 folders ở các level khác nhau
4. **Tạo Audios**: Từ các file mp3 trong `public/audio`
5. **Tạo Audio Stats**: Thống kê nghe cho một số audio
6. **Tạo User Settings**: Cài đặt notification cho user
7. **Tạo Gamification**: XP, Streak, Leaderboard points
8. **Tạo Achievements**: 8 achievements, user unlock 2 cái
9. **Tạo Quizzes**: 2-3 câu hỏi cho mỗi audio

### 2. Thông tin đăng nhập

Sau khi chạy seed, bạn có thể đăng nhập với:

- **Email**: demo@example.com
- **Password**: password123

## Chi tiết dữ liệu

### 👤 User (1)
- Email: `demo@example.com`
- Password được hash bằng bcrypt
- Có đầy đủ settings và gamification data

### 📁 Folders (5)
- **N5 - Beginner** (public)
- **N4 - Elementary** (public)
- **N3 - Intermediate** (public)
- **Daily Conversations** (public)
- **Business Japanese** (private)

### 🎵 Audios (8)
- Tự động đọc tất cả file `.mp3` trong `backend/public/audio`
- Duration được tạo ngẫu nhiên từ 30-300 giây (0.5-5 phút)
- Mỗi audio được gán vào 1 folder (phân bổ đều)
- Title format: `Lesson {số} - {tên folder}`
- Có overview và script mẫu

### 📊 Audio Stats (5)
- Tạo stats cho 5 audio đầu tiên
- Random favorite status
- Random listen count (1-10)
- First listen đã hoàn thành
- Last listen time trong vòng 7 ngày qua

### ⚙️ User Settings (1)
- Email notification: enabled

### 🎮 Gamification Data
- **XP**: 250 điểm
- **Streak**: 5 ngày (longest: 7 ngày)
- **Leaderboard**: 150 weekly XP

### 🏆 Achievements (8 + 2 unlocked)
Tất cả achievements:
1. **First Steps** - Complete 1 audio (✅ unlocked)
2. **Getting Started** - Complete 5 audios (✅ unlocked)
3. **Dedicated Learner** - Complete 10 audios
4. **Streak Starter** - 3-day streak
5. **Consistency is Key** - 7-day streak
6. **Experience Builder** - Reach 100 XP
7. **Rising Star** - Reach 500 XP
8. **Listening Marathon** - Listen for 1 hour

### ❓ Quizzes (16-24)
- 2-3 câu hỏi cho mỗi audio
- 4 options (A, B, C, D)
- Có explanation cho mỗi câu
- Đáp án đúng được random

## Lưu ý

⚠️ **Warning**: Script sẽ **xóa toàn bộ dữ liệu cũ** trước khi tạo dữ liệu mới!

Nếu bạn muốn giữ lại dữ liệu cũ, comment out các dòng `deleteMany()` trong `index.ts`:

```typescript
// await prisma.audio.deleteMany();
// await prisma.folder.deleteMany();
// ... etc
```

## Thứ tự dependencies

Seed được chạy theo thứ tự:
1. User (phải có trước)
2. Folders
3. Audios
4. Audio Stats (cần userId + audioIds)
5. User Settings
6. Gamification (UserExp, Streak, LeaderboardPoint)
7. Achievements
8. User Achievements (cần userId + achievementIds)
9. Quizzes (cần userId + audioIds)
