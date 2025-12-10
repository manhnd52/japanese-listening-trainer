# Database Seed Scripts

Seed scripts để tạo dữ liệu mẫu cho database.

## Cấu trúc

- **seed.user.ts** - Tạo 1 user demo
- **seed.folder.ts** - Tạo 5 folder mẫu (N5, N4, N3, Daily Conversations, Business Japanese)
- **seed.audio.ts** - Tạo audio records từ file mp3 trong `public/audio`
- **index.ts** - File chính để chạy tất cả seed scripts

## Cách sử dụng

### 1. Chạy seed

```bash
npm run seed
```

Script sẽ:
1. Xóa tất cả dữ liệu cũ (audios, folders, users)
2. Tạo 1 user demo
3. Tạo 5 folders
4. Tạo audio records từ file mp3 trong `public/audio`

### 2. Thông tin đăng nhập

Sau khi chạy seed, bạn có thể đăng nhập với:

- **Email**: demo@example.com
- **Password**: password123

## Chi tiết

### User
- 1 user được tạo với email `demo@example.com`
- Password được hash bằng bcrypt

### Folders
- **N5 - Beginner** (public)
- **N4 - Elementary** (public)
- **N3 - Intermediate** (public)
- **Daily Conversations** (public)
- **Business Japanese** (private)

### Audios
- Tự động đọc tất cả file `.mp3` trong `backend/public/audio`
- Duration được tạo ngẫu nhiên từ 30-300 giây (0.5-5 phút)
- Mỗi audio được gán vào 1 folder (phân bổ đều)
- Title format: `Lesson {số} - {tên folder}`
- Có overview và script mẫu

## Lưu ý

⚠️ **Warning**: Script sẽ xóa toàn bộ dữ liệu cũ trước khi tạo dữ liệu mới!

Nếu bạn muốn giữ lại dữ liệu cũ, comment out các dòng sau trong `index.ts`:

```typescript
await prisma.audio.deleteMany();
await prisma.folder.deleteMany();
await prisma.user.deleteMany();
```
