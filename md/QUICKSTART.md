# Quick Start Guide - Quizzy

Hướng dẫn nhanh để bắt đầu sử dụng ứng dụng Quizzy.

## 1. Chuẩn Bị Môi Trường

### Yêu Cầu
- Node.js 18+
- MongoDB (local hoặc cloud)
- npm hoặc yarn

## 2. Cài Đặt Dự Án

```bash
# Vào thư mục project
cd d:\dev\quizzy

# Cài đặt dependencies
npm install
```

## 3. Cấu Hình Biến Môi Trường

Tạo file `.env.local` với nội dung:

```env
MONGODB_URI=mongodb://localhost:27017/quizzy_db
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRATION=7d
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Lưu ý**: Thay đổi `JWT_SECRET` bằng một chuỗi bảo mật thực tế

## 4. Seed Database (Optional)

Thêm dữ liệu mẫu vào database:

```bash
npm run seed
```

Điều này sẽ tạo:
- 3 người dùng (Admin, Teacher, Student)
- 3 danh mục (Mathematics, Science, English)
- 3 câu hỏi mẫu
- 2 bài quiz mẫu

### Tài Khoản Mẫu

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | Admin |
| teacher@example.com | teacher123 | Teacher |
| student@example.com | student123 | Student |

## 5. Chạy Ứng Dụng

### Development Mode
```bash
npm run dev
```

Truy cập: http://localhost:3000

### Production Mode
```bash
npm run build
npm start
```

## 6. Kiểm Tra Ứng Dụng

1. Mở browser: http://localhost:3000
2. Bạn sẽ thấy trang home
3. Click "Get Started" hoặc vào /auth/login
4. Login với tài khoản mẫu hoặc tạo tài khoản mới
5. Xem danh sách quiz và làm quiz

## 7. Cấu Trúc Các Trang Chính

- **`/`** - Trang home
- **`/auth/login`** - Đăng nhập
- **`/auth/register`** - Đăng ký
- **`/quizzes`** - Danh sách quiz
- **`/quiz/[id]`** - Làm quiz
- **`/attempts`** - Lịch sử làm quiz
- **`/profile`** - Thông tin cá nhân

## 8. API Endpoints Chính

### Auth
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin
- `PUT /api/auth/profile` - Cập nhật thông tin

### Quizzes
- `GET /api/quizzes` - Danh sách quiz
- `POST /api/quizzes` - Tạo quiz
- `GET /api/quizzes/[id]` - Chi tiết quiz

### Attempts
- `POST /api/attempts` - Bắt đầu quiz
- `GET /api/attempts` - Lịch sử
- `PUT /api/attempts/[id]` - Lưu câu trả lời
- `POST /api/attempts/[id]/submit` - Nộp quiz

Chi tiết xem: `API_DOCUMENTATION.md`

## 9. Khắc Phục Sự Cố

### MongoDB không kết nối
```
Lỗi: connect ECONNREFUSED 127.0.0.1:27017
Giải pháp: 
- Đảm bảo MongoDB đang chạy
- Kiểm tra MONGODB_URI trong .env.local
```

### Port 3000 đã được sử dụng
```
Giải pháp: Thay đổi port trong development
npm run dev -- -p 3001
```

### Lỗi TypeScript
```
Giải pháp:
rm -r node_modules .next
npm install
npm run build
```

### Mất token khi refresh
```
Giải pháp: Token được lưu trong localStorage
- Xóa cache browser
- Đăng nhập lại
```

## 10. Tính Năng Chính

✅ **Xác Thực**
- Đăng ký/Đăng nhập
- JWT tokens
- Quản lý profile

✅ **Quiz Management**
- Tạo/chỉnh sửa quiz
- 9 loại câu hỏi khác nhau
- Tập hợp các lựa chọn

✅ **Làm Quiz**
- Timer tự động
- Lưu câu trả lời tự động
- Chấm điểm tức thời
- Xem lịch sử

✅ **Quản Lý Danh Mục**
- Phân loại quiz
- Tìm kiếm theo danh mục

## 11. Phát Triển Tiếp Theo

### Thêm Tính Năng
1. Xem file models trong `lib/models/`
2. Tạo API routes mới trong `app/api/`
3. Tạo pages/components trong `app/` hoặc `components/`
4. Sử dụng hooks trong `lib/hooks/`

### Ví Dụ - Thêm Tính Năng Bookmark
```typescript
// API: POST /api/bookmarks
// Model: Bookmark.ts (đã có)
// Frontend: Thêm button bookmark trên quiz card
```

## 12. Deployment

### Deploy lên Vercel (Recommended)
```bash
git push origin main
```

Cấu hình environment variables trên Vercel:
- MONGODB_URI
- JWT_SECRET
- JWT_EXPIRATION

### Deploy lên Railway/Render
Tương tự Vercel, cấu hình environment variables

## 13. Tài Liệu

- `README.md` - Tổng quan project
- `API_DOCUMENTATION.md` - API chi tiết
- `GUIDE.md` - Hướng dẫn chi tiết
- `lib/models/` - Database schemas
- `app/api/` - API routes

## 14. Liên Hệ & Hỗ Trợ

Gặp vấn đề? Hãy:
1. Kiểm tra console browser (F12)
2. Kiểm tra terminal server
3. Xem logs database
4. Đọc API_DOCUMENTATION.md

## 15. Tiếp Theo

1. ✅ Setup xong - Bắt đầu làm quiz
2. Học cách tạo quiz mới (admin/teacher)
3. Khám phá các loại câu hỏi khác nhau
4. Tùy chỉnh và mở rộng ứng dụng

Chúc bạn thành công! 🎓
