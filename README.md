# Lập Trình Di Động Project

## Tổng Quan
Đây là một dự án full-stack bao gồm 3 phần chính:
- Backend API (Node.js/Express)
- Admin Dashboard (React)
- Mobile App (React Native)

## Cấu Trúc Dự Án
```
├── apps/
│   ├── backend/           # Backend API server
│   ├── admin-dashboard/   # Admin web interface
│   └── mobile-app/        # Mobile application
├── package.json
├── tsconfig.json
└── ...config files
```

## Cấu Trúc Database (ERD)

Dưới đây là sơ đồ quan hệ thực thể (ERD) của hệ thống:

![Database ERD](./docs/assets/prisma-erd.svg)

### Mô Tả Các Bảng Chính

#### Users
- Quản lý thông tin người dùng
- Phân quyền người dùng
- Thông tin xác thực

#### Foods
- Thông tin món ăn
- Giá và mô tả
- Trạng thái món ăn

#### Tables
- Thông tin bàn
- Trạng thái bàn
- Khu vực bàn

#### Orders
- Thông tin đơn hàng
- Trạng thái đơn hàng
- Thông tin thanh toán

#### OrderItems
- Chi tiết các món trong đơn hàng
- Số lượng và giá
- Ghi chú đặc biệt

#### Employees
- Thông tin nhân viên
- Lịch sử làm việc
- Phân quyền

#### Notifications
- Thông báo hệ thống
- Trạng thái thông báo
- Người nhận thông báo

## Công Nghệ Sử Dụng

### Backend
- NestJS v11
- TypeScript
- Prisma ORM
- PostgreSQL Database
- Zod (Schema Validation)
- AWS S3 (File Storage)
- Resend (Email Service)
- Jest (Testing)

### Admin Dashboard
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI Components
- NextAuth.js
- React Hook Form
- Zod (Form Validation)
- Recharts (Data Visualization)
- Prisma Client

### Mobile App
- Expo SDK 53
- React Native 0.79
- TypeScript
- Expo Router
- React Navigation
- Expo Camera
- AsyncStorage
- Axios
- React Native Reanimated
- React Native Gesture Handler

### Development Tools
- ESLint
- Prettier
- TypeScript
- Git
- Prisma Studio

## Cài Đặt và Chạy Dự Án

### Yêu Cầu Hệ Thống
- Node.js (v14 trở lên)
- npm hoặc yarn
- MongoDB
- Android Studio (cho mobile development)
- Xcode (cho iOS development, macOS only)

### Cài Đặt Dependencies
```bash
# Cài đặt dependencies cho toàn bộ dự án
npm install

# Cài đặt dependencies cho từng phần
cd apps/backend && npm install
cd apps/admin-dashboard && npm install
cd apps/mobile-app && npm install
```

### Chạy Dự Án
```bash
# Chạy Backend
cd apps/backend
npm run start

# Chạy Admin Dashboard
cd apps/admin-dashboard
npm run start

# Chạy Mobile App
cd apps/mobile-app
npm run dev
npm run android  # cho Android
npm run ios     # cho iOS
```

## API Documentation
API documentation có sẵn trong file `API.postman_collection.json`. Bạn có thể import file này vào Postman để xem và test các API endpoints.

## Tính Năng Đã Hoàn Thành

### Góc Nhìn ADMIN (Admin Dashboard)

#### Quản Lý Món Ăn
- Thêm, sửa, xóa món ăn
- Xem danh sách món ăn
- Quản lý thông tin chi tiết món ăn (tên, giá, mô tả, hình ảnh)
- Phân loại món ăn
- Quản lý trạng thái món ăn (còn hàng/hết hàng)

#### Quản Lý Bàn
- Thêm, sửa, xóa bàn
- Xem trạng thái bàn (trống/đang sử dụng)
- Quản lý thông tin bàn
- Phân khu vực bàn

#### Quản Lý Đơn Hàng
- Xem danh sách đơn hàng
- Cập nhật trạng thái đơn hàng
- Xem chi tiết đơn hàng
- Xem lịch sử đơn hàng
- Thống kê doanh thu

#### Quản Lý Nhân Viên
- Thêm, sửa, xóa thông tin nhân viên
- Phân quyền nhân viên
- Quản lý thông tin cá nhân nhân viên
- Xem lịch sử làm việc

#### Hệ Thống Thông Báo
- Gửi thông báo cho nhân viên
- Phân công thông báo
- Quản lý trạng thái thông báo
- Tạo thông báo khẩn cấp

#### Tính Năng Khác
- Quản lý khẩu hiệu (slogans)
- Upload và quản lý hình ảnh
- Xem báo cáo doanh thu

### Góc Nhìn CLIENT (Mobile App)

### Check In và Check Out
- Check In ca làm thông qua QR CODE
- Xem thời gian làm việc qua các ngày

### Đặt bàn và quản lý trạng thái bàn
- Xem trạng thái các bàn
- Đổi trạng thái bàn

#### Đặt Món cho Bàn đang phục vụ
- Xem menu món ăn
- Tìm kiếm món ăn
- Lọc món ăn theo danh mục
- Xem chi tiết món ăn
- Thêm món vào giỏ hàng
- Lọc mon

#### Quản Lý Đơn Hàng
- Tạo đơn hàng mới
- Xem giỏ hàng
- Chỉnh sửa số lượng món
- Xóa món khỏi giỏ hàng
- Xem lịch sử đơn hàng

#### Thanh Toán
- Chọn phương thức thanh toán ( đang giả lập qr code thanh toán)

#### Tài Khoản
- Đăng ký tài khoản (OTP code)
- Đăng nhập/Đăng xuất
- Xem thông tin cá nhân


#### Thông Báo
- Nhận thông báo từ ADMIN

#### Tính Năng Khác
- Xem khẩu hiệu của nhà hàng

## Tính Năng Đang Phát Triển

### Xác Thực và Bảo Mật
- Đăng nhập bằng Google (OAuth 2.0)
- Hệ thống chặn thao tác với User không hoạt động (isActive = false)
- Cải thiện bảo mật JWT token
- Thêm xác thực 2 yếu tố (2FA)

### Tương Tác và Phản Hồi
- Hệ thống gửi phản hồi từ Client đến Admin
- Chat nội bộ giữa nhân viên
- Thông báo realtime cho các phản hồi mới
- Đánh giá và phản hồi về chất lượng dịch vụ

### Cải Thiện UX/UI
- Tối ưu hóa giao diện người dùng
- Thêm dark mode
- Cải thiện hiệu suất tải trang
- Responsive design cho tất cả thiết bị

## Tính Năng Dự Kiến

### Tích Hợp Thanh Toán
- Tích hợp VNPay, Momo hoặc Zalopay ( đang giả lập QR scan thanh toán)

- Quản lý ví điện tử

### Báo Cáo và Thống Kê
- Báo cáo doanh thu chi tiết
- Thống kê món ăn bán chạy
- Phân tích xu hướng đặt món
- Báo cáo hiệu suất nhân viên

### Tính Năng Nâng Cao
- Hệ thống đặt bàn trực tuyến
- Tích điểm thành viên
- Chương trình khuyến mãi tự động
- Quản lý kho và nguyên liệu

### Tích Hợp Bên Thứ Ba
- Tích hợp Google Maps
- Tích hợp Facebook Messenger
- Tích hợp Zalo OA
- Tích hợp các nền tảng mạng xã hội

## Liên Hệ

