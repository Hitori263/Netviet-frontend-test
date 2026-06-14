# ShortVideo - Vertical Scroll Video Feed (Next.js & Tailwind CSS)

ShortVideo là một ứng dụng Web xem video dạng cuộn dọc (tương tự TikTok, Instagram Reels, YouTube Shorts) được phát triển bằng **Next.js (App Router)**, **TypeScript** và **Tailwind CSS v3**.

---

## 🚀 Tính năng cốt lõi (Core Features)

1. **Giao diện cuộn dọc mượt mà (Vertical Scroll Layout)**
   - Tối ưu snap-scrolling (`snap-y snap-mandatory`). Video card chiếm trọn màn hình điện thoại hoặc tự động căn giữa khung hình tỷ lệ 9:16 trên PC.
2. **Video Player nâng cao**
   - Click/tap vào video để Play/Pause. Khi video đang tạm dừng (Pause), một nút Play (hình tam giác) sẽ hiển thị cố định ở chính giữa để người dùng dễ dàng bấm tiếp tục (giống TikTok).
   - Nhấn đúp (Double-tap) để thả tim trực tiếp tại tọa độ trỏ chuột/chạm tay, tạo ra các icon tim bay lên cực kỳ trực quan.
3. **Quản lý âm thanh đồng bộ (Global Volume Control)**
   - Mặc định, tất cả video sẽ bắt đầu chạy ở chế độ **Bật tiếng (Unmuted)** để đem lại trải nghiệm âm thanh sống động ngay từ đầu.
   - Có nút Volume bật/tắt âm thanh ở góc phải. Khi người dùng thay đổi trạng thái tắt/bật tiếng ở một video, trạng thái này sẽ được đồng bộ toàn cục cho tất cả các video tiếp theo.
4. **Hệ thống Menu chuyển trang**
   - Sidebar cố định bên trái trên PC.
   - Bottom Navigation bar cố định bên dưới trên Mobile.
   - Hỗ trợ chuyển tabs động: Trang chủ (Video feed), Khám phá (Explore Grid có thanh tìm kiếm và tag lọc), Hồ sơ (Profile người dùng).
5. **Sidebar Tương tác Xã hội**
   - **Thả tim (Like)**: Click tim để đổi sang màu đỏ và tăng/giảm số lượng tim theo thời gian thực.
   - **Bình luận (Comments Panel)**: Slide-in panel hiển thị danh sách comment, hỗ trợ thích bình luận, gửi bình luận mới. Đồng thời hỗ trợ tính năng chỉnh sửa (**Sửa**) và gỡ bỏ (**Xóa**) chính bình luận của mình ngay lập tức (dữ liệu được đồng bộ theo thời gian thực).
   - **Chia sẻ (Share Tooltip)**: Hiển thị tooltip tùy chọn chia sẻ, hỗ trợ **sao chép liên kết trang web đính kèm tham số `?videoId=...` (hỗ trợ liên kết sâu - deep linking)** vào Clipboard và thông báo Toast.
6. **Đồng bộ hóa thông tin người dùng (Unified User Model)**
   - Quản lý thông tin tài khoản đăng nhập thông qua model dữ liệu người dùng động và Mock API thực tế (không sử dụng dữ liệu hardcode).
   - Đồng bộ hóa đồng loạt ảnh đại diện, tên hiển thị, các chỉ số follow/thích và kiểm soát quyền Sửa/Xóa bình luận trên toàn bộ hệ thống Sidebar, trang Profile cá nhân và bảng bình luận.

---

## 🛠️ Giải thích Logic tự động Play/Pause khi cuộn trang (Intersection Observer)

Để đảm bảo hiệu năng và tránh hiện tượng nhiều video phát âm thanh cùng lúc, ứng dụng sử dụng **Intersection Observer API** của trình duyệt thông qua React Hooks.

### Cơ chế hoạt động:
1. **Container quan sát (`VideoFeed.tsx`)**:
   - Component cha giữ trạng thái `activeId` (ID của video đang hiển thị chính trong viewport).
   - Khi component mount, khởi tạo một `IntersectionObserver` với cấu hình:
     ```typescript
     const observerOptions = {
       root: container, // Container cuộn chứa feed (feedRef.current)
       rootMargin: '0px',
       threshold: 0.6, // Kích hoạt khi video chiếm từ 60% diện tích màn hình trở lên
     };
     ```
   - Observer sẽ lắng nghe sự kiện hiển thị của tất cả các phần tử `VideoCard`.
   - Khi một card đạt điều kiện hiển thị trên 60% viewport, hàm callback cập nhật `activeId` sang ID của card đó.

2. **Xử lý Play/Pause cục bộ (`VideoCard.tsx`)**:
   - Mỗi card nhận prop `isActive` (`video.id === activeId`).
   - Sử dụng `useEffect` lắng nghe sự thay đổi của `isActive`:
     ```typescript
     useEffect(() => {
       if (!videoRef.current) return;

       if (isActive) {
         const playPromise = videoRef.current.play();
         if (playPromise !== undefined) {
           playPromise
             .then(() => {
               setIsPlaying(true);
             })
             .catch((error) => {
               console.log("Autoplay prevented:", error);
               setIsPlaying(false);
             });
         }
       } else {
         videoRef.current.pause();
         videoRef.current.currentTime = 0;
         setIsPlaying(false);
         // Đóng các panel bình luận và chia sẻ nếu người dùng cuộn đi nơi khác
         setCommentsOpen(false);
         setShareOpen(false);
       }
     }, [isActive]);
     ```
Cơ chế này giúp tối ưu hóa hiệu năng, giảm tải cho CPU/GPU của thiết bị bằng cách chỉ chạy duy nhất 1 luồng video chính diện và tạm dừng tất cả các video bị cuộn qua.

---

## 📦 Cài đặt và Chạy thử nghiệm (Setup & Run)

1. **Cài đặt các gói phụ thuộc (Dependencies)**:
   ```bash
   npm install
   ```

2. **Chạy ứng dụng ở môi trường Phát triển (Development)**:
   ```bash
   npm run dev
   ```
   Mở trình duyệt truy cập: `http://localhost:3000`

3. **Biên dịch sản phẩm (Production Build)**:
   ```bash
   npm run build
   ```

4. **Chạy sản phẩm sau khi build**:
   ```bash
   npm run start
   ```
