# FitTrack

Ứng dụng FitTrack giúp bạn theo dõi buổi tập, lưu dữ liệu vào `localStorage`, và quản lý qua trang admin.

## Phân chia các mục

- `index.html`: Trang chủ hiển thị form thêm buổi tập, thống kê nhanh và danh sách buổi tập.
- `admin.html`: Trang quản trị cho phép sửa, xóa và thêm dữ liệu.
- `css/style.css`: Kiểu dáng cho toàn bộ trang.
- `js/api.js`: Lớp `APIResource` để sử dụng `localStorage` làm API.
- `js/utils.js`: Các hàm hỗ trợ định dạng ngày, thời lượng, calories và tạo id.
- `js/main.js`: Logic trang chủ.
- `js/admin.js`: Logic trang quản trị.

## Cách dùng

1. Mở `index.html` trong trình duyệt.
2. Thêm buổi tập mới.
3. Mở `admin.html` để sửa hoặc xóa buổi tập.

Dữ liệu được lưu trên máy bằng `localStorage`.
'@
}

foreach ($path in $files.Keys) {
  Set-Content -Path $path -Value $files[$path] -Encoding UTF8
}
