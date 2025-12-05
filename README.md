# Quizzy - Nền Tảng Thi Trực Tuyến

Ứng dụng web toàn chức năng để tạo, quản lý và làm bài kiểm tra trực tuyến với các loại câu hỏi đa dạng.

## ✨ Tính Năng Chính

### 1. **Hệ Thống Câu Hỏi Đa Dạng (7 Loại)**
- Single Choice (Một lựa chọn)
- Multiple Choice (Nhiều lựa chọn)
- True/False (Đúng/Sai)
- Fill Blank (Điền vào chỗ trống)
- Numeric Input (Nhập số)
- Ordering (Sắp xếp)
- Matching (Ghép cặp)

### 2. **Quản Lý Bài Thi**
- Tạo bài thi với các chủ đề khác nhau
- Đặt thời gian làm bài
- Định nghĩa điểm cần để qua bài
- Phân loại theo độ khó (Dễ, Trung bình, Khó)

### 3. **Trải Nghiệm Làm Bài**
- Bộ đếm thời gian trực tiếp
- Điều hướng giữa các câu hỏi
- Lưu lại câu trả lời tự động
- Xem lại câu trả lời trước khi gửi

### 4. **Chấm Điểm Tự Động & Kết Quả** ⭐ MỚI
- Chấm điểm ngay lập tức cho tất cả loại câu hỏi
- Hiển thị chi tiết đáp án đúng vs đáp án người dùng
- Tính toán thời gian hoàn thành chính xác
- Xem lại các câu hỏi với so sánh chi tiết

### 5. **Bookmark & Watchlist** ⭐ MỚI
- **Bookmark (⭐ Lưu)**: Lưu các bài thi yêu thích để tham khảo sau
- **Watchlist (👁 Theo dõi)**: Theo dõi các bài thi để chuẩn bị
- Quản lý các bài thi đã lưu từ trang riêng biệt
- Xóa bỏ từ bookmark/watchlist một cách dễ dàng

### 6. **Lịch Sử Làm Bài** ⭐ MỚI
- Xem lại tất cả các bài thi đã làm
- Hiển thị tỷ lệ hoàn thành, điểm số và trạng thái vượt qua
- Xem chi tiết kết quả từng lần làm bài
- Sắp xếp theo thời gian làm bài gần nhất

## 🚀 Công Nghệ Sử Dụng

**Frontend:**
- Next.js 16.0.7
- React 19
- TypeScript 5
- Tailwind CSS 4

**Backend:**
- MongoDB
- Mongoose 8.20.1

## 📁 Cấu Trúc Dự Án

```
app/
├── api/                    # API endpoints
│   ├── bookmarks/route.ts  # ⭐ Bookmark API
│   ├── watchlist/route.ts  # 👁 Watchlist API
│   ├── attempts/           # Quiz submission & results
│   ├── quizzes/           # Quiz management
│   └── ...
├── quiz/[id]/
│   ├── page.tsx           # Quiz detail (với Bookmark/Watchlist)
│   └── attempt/page.tsx   # Quiz taking interface
├── result/[attemptId]/    # Results page
├── history/page.tsx       # 📝 Quiz attempts history page
├── bookmarks/page.tsx     # ⭐ Bookmarks list page
├── watchlist/page.tsx     # 👁 Watchlist page
├── components/            # Reusable components
├── hooks/
│   └── useBookmarkWatchlist.ts  # ⭐ Custom hook for bookmarks/watchlist
└── ...
```

## 🎯 Hướng Dẫn Sử Dụng

### Làm Bài Thi
1. Chọn bài thi từ trang chủ
2. Nhấn "Bắt Đầu Thi" trên trang chi tiết
3. Trả lời các câu hỏi với thời gian giới hạn
4. Gửi bài khi hoàn thành

### Sử Dụng Bookmark
1. Trên trang chi tiết bài thi, nhấn nút "☆ Lưu"
2. Nút sẽ đổi thành "⭐ Đã lưu"
3. Xem danh sách bài thi đã lưu từ menu người dùng → "⭐ Bài thi đã lưu"

### Sử Dụng Watchlist
1. Trên trang chi tiết bài thi, nhấn nút "👁 Theo dõi"
2. Nút sẽ đổi thành "👁 Đang theo dõi"
3. Xem danh sách bài thi đang theo dõi từ menu người dùng → "👁 Đang theo dõi"

## 📊 Kết Quả Bài Thi

Sau khi gửi bài, người dùng sẽ thấy:
- Tỷ lệ % hoàn thành chính xác
- Số điểm đạt được / tổng điểm
- Thời gian hoàn thành
- Chi tiết từng câu hỏi với:
  - Đáp án của bạn
  - Đáp án đúng
  - Điểm nhận được
  - Giải thích (nếu có)

## 🔐 Bảo Mật

- Xác thực người dùng với token JWT
- Bảo vệ API endpoints bằng middleware auth
- Dữ liệu người dùng được mã hóa

## 📝 Commit & Deployment

```bash
git status
git add .
git commit -m "main"
git push
```

---

**Phiên bản hiện tại:** 1.1.0  
**Cập nhật lần cuối:** December 2025