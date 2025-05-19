# React Native Social App

Ứng dụng mạng xã hội di động được xây dựng bằng React Native và Firebase, tập trung vào kết nối người dùng thông qua không gian (spaces) và sở thích chung.

## Tổng quan hệ thống

Đây là một nền tảng mạng xã hội toàn diện cho phép người dùng tương tác và kết nối thông qua các không gian (spaces) dựa trên sở thích và chủ đề chung. Hệ thống được thiết kế để tạo ra một môi trường tương tác đa dạng và phong phú, nơi người dùng có thể:

- **Tạo và tham gia spaces**: Người dùng có thể tạo không gian riêng hoặc tham gia vào các không gian hiện có dựa trên sở thích cá nhân.
- **Tương tác trong spaces**: Trong mỗi space, người dùng có thể tạo bài viết, tổ chức sự kiện, và tham gia thảo luận.
- **Kết nối với người dùng khác**: Hệ thống cho phép người dùng kết nối với nhau, xây dựng mạng lưới cá nhân.
- **Nhắn tin và trò chuyện**: Người dùng có thể nhắn tin trực tiếp hoặc tham gia vào các phòng chat.
- **Đặt câu hỏi và trao đổi**: Nền tảng cung cấp không gian để người dùng đặt câu hỏi và nhận phản hồi từ cộng đồng.
- **Quản lý lịch sự kiện**: Người dùng có thể theo dõi và quản lý các sự kiện sắp tới thông qua lịch tích hợp.

## Tính năng chính

### Quản lý người dùng và hồ sơ
- **Xác thực người dùng**: Đăng ký, đăng nhập, quản lý hồ sơ cá nhân
- **Quên mật khẩu**: Khôi phục mật khẩu thông qua email
- **Hồ sơ người dùng**: Thông tin cá nhân, sở thích, tiểu sử
- **Quản lý sở thích**: Người dùng có thể chọn sở thích để nhận gợi ý phù hợp
- **Kết nối người dùng**: Gửi yêu cầu kết nối, chấp nhận/từ chối kết nối, xem danh sách kết nối
- **Đề xuất kết nối**: Gợi ý người dùng có thể kết nối dựa trên sở thích chung

### Không gian (Spaces)
- **Tạo và quản lý spaces**: Người dùng có thể tạo không gian riêng với các chủ đề khác nhau
- **Phân loại spaces**: Spaces được phân loại theo danh mục (categories) và sở thích (interests)
- **Cài đặt quyền riêng tư**: Không gian có thể được cài đặt là công khai, chỉ cho kết nối, hoặc riêng tư
- **Quản lý thành viên**: Thêm, xóa và phân quyền cho thành viên trong space
- **Tìm kiếm spaces**: Tìm kiếm theo tên, danh mục, sở thích hoặc vị trí
- **Tìm kiếm nâng cao**: Lọc theo vị trí, ngôn ngữ, và các thuộc tính khác
- **Đánh giá và xếp hạng**: Người dùng có thể đánh giá spaces và xem xếp hạng

### Nội dung trong Spaces
- **Bài đăng (Posts)**: Chia sẻ bài viết với hình ảnh và văn bản
- **Sự kiện (Events)**: Tạo và quản lý sự kiện, có thể là trực tuyến hoặc tại địa điểm cụ thể
- **Bình luận và tương tác**: Người dùng có thể bình luận, thích và chia sẻ nội dung
- **Thảo luận nhóm**: Trao đổi ý kiến trong các chủ đề thảo luận
- **Tin nhắn trong space**: Trò chuyện với tất cả thành viên trong space

### Nhắn tin và trò chuyện
- **Chat cá nhân**: Nhắn tin trực tiếp giữa các người dùng
- **Phòng chat**: Tham gia vào các phòng chat theo chủ đề
- **Thông báo tin nhắn**: Nhận thông báo khi có tin nhắn mới
- **Gửi hình ảnh**: Chia sẻ hình ảnh trong cuộc trò chuyện

### Câu hỏi và trao đổi
- **Đặt câu hỏi**: Người dùng có thể đặt câu hỏi cho cộng đồng
- **Trả lời câu hỏi**: Cung cấp câu trả lời và bình luận về câu trả lời
- **Theo dõi câu hỏi**: Nhận thông báo khi có câu trả lời mới
- **Câu hỏi trong space**: Đặt câu hỏi trong không gian cụ thể

### Lịch và sự kiện
- **Lịch sự kiện**: Xem tất cả sự kiện sắp tới trong một giao diện lịch
- **Quản lý sự kiện**: Tạo, chỉnh sửa và xóa sự kiện
- **Tham gia sự kiện**: Đăng ký tham gia và nhận thông báo về sự kiện
- **Nhắc nhở sự kiện**: Nhận thông báo trước khi sự kiện diễn ra

### Giao diện người dùng
- **Chế độ tối (Dark Mode)**: Hỗ trợ giao diện tối để cải thiện trải nghiệm người dùng
- **Đa ngôn ngữ**: Hỗ trợ tiếng Anh và tiếng Việt
- **Giao diện thích ứng**: Tự động điều chỉnh theo cài đặt hệ thống

### Thông báo
- **Thông báo đẩy**: Nhận thông báo về các hoạt động quan trọng
- **Quản lý thông báo**: Tùy chỉnh loại thông báo muốn nhận
- **Thông báo trong ứng dụng**: Xem tất cả thông báo trong một giao diện thống nhất

## Công nghệ sử dụng

### Frontend:
- **React Native**: 0.76.9 - Framework chính để phát triển ứng dụng di động đa nền tảng
- **React**: 18.3.1
- **Expo**: 52.0.44 - Nền tảng hỗ trợ phát triển React Native
- **TypeScript**: Ngôn ngữ lập trình chính
- **NativeWind**: Framework CSS cho React Native (dựa trên TailwindCSS)
- **React Navigation**: Thư viện điều hướng
- **React Query (TanStack Query)**: Quản lý trạng thái và data fetching
- **i18next & react-i18next**: Hỗ trợ đa ngôn ngữ (tiếng Anh và tiếng Việt)

### Backend:
- **Firebase**: 11.4.0 - Nền tảng backend as a service
  - **Firebase Authentication**: Xác thực người dùng
  - **Firestore**: Cơ sở dữ liệu NoSQL
  - **Firebase Storage**: Lưu trữ file và hình ảnh
  - **Firebase Cloud Messaging**: Thông báo đẩy

### Dịch vụ bên thứ ba:
- **ImageKit**: Dịch vụ quản lý và tối ưu hóa hình ảnh
  - Giải quyết vấn đề CORS khi tải lên hình ảnh
  - Tự động tối ưu hóa hình ảnh
  - CDN tích hợp để phân phối hình ảnh nhanh chóng

## Cài đặt và chạy ứng dụng

### Yêu cầu hệ thống
- Node.js (phiên bản 16 trở lên)
- npm, yarn hoặc pnpm
- Expo CLI
- Android Studio (cho Android development)
- Xcode (cho iOS development, chỉ trên macOS)

### Cài đặt
```bash
# Clone repository
git clone <repository-url>
cd react-native-template

# Cài đặt dependencies
npm install
# hoặc
yarn
# hoặc
pnpm install
```

### Chạy ứng dụng
```bash
# Khởi động Expo development server
npm start
# hoặc
yarn start
# hoặc
pnpm start
```

Sau khi khởi động, bạn có thể:
- Chạy trên thiết bị iOS (chỉ trên macOS): Nhấn `i`
- Chạy trên thiết bị Android: Nhấn `a`
- Chạy trên web: Nhấn `w`
- Quét mã QR bằng Expo Go trên thiết bị di động

## Mô hình dữ liệu

Ứng dụng sử dụng Firebase Firestore với các collections chính sau:

- **users**: Thông tin người dùng, hồ sơ cá nhân và sở thích
  - Thông tin cá nhân: tên, email, avatar, tiểu sử
  - Thông tin liên hệ: số điện thoại, địa chỉ
  - Cài đặt: ngôn ngữ, chế độ tối, thông báo
  - Token: FCM token, push token cho thông báo

- **interests**: Danh sách các sở thích để gợi ý và phân loại
  - Tên, mô tả, icon, danh mục
  - Số lượng người dùng có sở thích này

- **categories**: Danh mục phân loại cho spaces
  - Tên, mô tả, icon
  - Số lượng spaces trong danh mục

- **spaces**: Không gian/cộng đồng với thông tin chi tiết
  - Thông tin cơ bản: tên, mô tả, ảnh đại diện, ảnh bìa
  - Thông tin phân loại: danh mục, sở thích liên quan
  - Thông tin vị trí: địa chỉ, tọa độ, thành phố, quốc gia
  - Thông tin thành viên: số lượng thành viên, danh sách admin
  - Thông tin hoạt động: số lượng bài đăng, sự kiện, đánh giá
  - Cài đặt quyền riêng tư: công khai, chỉ cho kết nối, riêng tư

- **posts**: Bài đăng trong spaces
  - Nội dung: tiêu đề, văn bản, hình ảnh
  - Thông tin tác giả: ID người đăng, thời gian đăng
  - Tương tác: số lượt thích, bình luận
  - Liên kết: space ID

- **events**: Sự kiện được tổ chức trong spaces
  - Thông tin cơ bản: tên, mô tả, hình ảnh
  - Thời gian: ngày bắt đầu, ngày kết thúc, múi giờ
  - Địa điểm: trực tuyến hoặc địa chỉ cụ thể
  - Người tham gia: danh sách người tham gia, giới hạn số lượng
  - Liên kết: space ID

- **connections**: Kết nối giữa người dùng
  - ID người dùng gửi yêu cầu
  - ID người dùng nhận yêu cầu
  - Trạng thái: đã gửi, đã chấp nhận, đã từ chối
  - Thời gian kết nối

- **chats**: Tin nhắn và cuộc trò chuyện
  - ID người gửi và người nhận
  - Nội dung tin nhắn, hình ảnh
  - Thời gian gửi
  - Trạng thái: đã gửi, đã nhận, đã đọc

- **notifications**: Thông báo cho người dùng
  - Loại thông báo: kết nối, bài đăng, sự kiện, tin nhắn
  - Nội dung thông báo
  - Thời gian gửi
  - Trạng thái: đã đọc, chưa đọc
  - Dữ liệu liên kết: ID của đối tượng liên quan

- **questions**: Câu hỏi và trả lời từ cộng đồng
  - Nội dung câu hỏi
  - ID người đặt câu hỏi
  - Danh sách câu trả lời
  - Thời gian đặt câu hỏi
  - Space ID (nếu câu hỏi được đặt trong space)

- **searchHistory**: Lịch sử tìm kiếm của người dùng
  - ID người dùng
  - Từ khóa tìm kiếm
  - Thời gian tìm kiếm
  - Loại tìm kiếm: spaces, users, events

- **searchAnalytics**: Phân tích dữ liệu tìm kiếm
  - Từ khóa phổ biến
  - Số lượng tìm kiếm
  - Thời gian tìm kiếm

- **space_messages**: Tin nhắn trong không gian
  - Space ID
  - ID người gửi
  - Nội dung tin nhắn, hình ảnh
  - Thời gian gửi

## Cấu trúc dự án

Dự án sử dụng cách tiếp cận kết hợp giữa Feature-based và Type-based để tổ chức thư mục:

```
src/
├── components/         # Các component dùng chung
│   ├── ui/             # UI components cơ bản
│   └── input/          # Input components
├── config/             # Cấu hình ứng dụng
├── features/           # Các tính năng của ứng dụng
│   ├── auth/           # Xác thực
│   ├── profile/        # Hồ sơ người dùng
│   ├── discover/       # Tìm kiếm và khám phá
│   ├── chat/           # Nhắn tin
│   ├── spaces/         # Không gian/Cộng đồng
│   ├── questions/      # Câu hỏi và trả lời
│   ├── calendar/       # Lịch và sự kiện
│   ├── notifications/  # Thông báo
│   ├── home/           # Màn hình trang chủ
│   ├── theme/          # Quản lý chủ đề (dark mode)
│   └── ...
├── hooks/              # Custom hooks dùng chung
├── i18n/               # Cấu hình đa ngôn ngữ
│   ├── locales/        # Các file ngôn ngữ
│   │   ├── en/         # Tiếng Anh
│   │   └── vi/         # Tiếng Việt
│   ├── index.ts        # Cấu hình i18n
│   └── hooks.ts        # Custom hooks cho i18n
├── navigation/         # Cấu hình điều hướng
├── services/           # Các dịch vụ
│   ├── firebase/       # Firebase services
│   │   ├── authService.ts              # Xác thực người dùng
│   │   ├── userService.ts              # Quản lý thông tin người dùng
│   │   ├── spaceService.ts             # Quản lý không gian/cộng đồng
│   │   ├── postService.ts              # Quản lý bài đăng
│   │   ├── eventService.ts             # Quản lý sự kiện
│   │   ├── chatService.ts              # Quản lý tin nhắn
│   │   ├── connectionService.ts        # Quản lý kết nối
│   │   ├── notificationService.ts      # Quản lý thông báo
│   │   ├── interestService.ts          # Quản lý sở thích
│   │   ├── questionsService.ts         # Quản lý câu hỏi
│   │   ├── spaceMessageService.ts      # Quản lý tin nhắn trong space
│   │   ├── simplePushNotificationService.ts # Thông báo đẩy
│   │   ├── fcmService.ts               # Firebase Cloud Messaging
│   │   ├── messageNotificationService.ts # Thông báo tin nhắn
│   │   ├── eventReminderService.ts     # Nhắc nhở sự kiện
│   │   └── reminderSchedulerService.ts # Lập lịch nhắc nhở
│   ├── pickAndUploadImage2ImageKitService.ts # Dịch vụ tải lên hình ảnh ImageKit
│   └── ...
├── types/              # Định nghĩa kiểu dữ liệu
└── utils/              # Các tiện ích
```

Ngoài ra, dự án còn có các thư mục phụ trợ:

```
view-model/             # Dự án React riêng biệt để trực quan hóa cấu trúc dữ liệu
├── firebase-erd-viewer/ # Công cụ xem ERD của Firebase
│   ├── src/            # Mã nguồn
│   └── ...
docs/                   # Tài liệu
├── 01-tong-quan-he-thong.md
├── 02-huong-dan-phat-trien-giao-dien.md
├── 03-huong-dan-phat-trien-backend.md
├── i18n-implementation.md
├── huong-dan-theme-dark-mode.md
├── imagekit-setup.md
└── ...
```

## Luồng xử lý dữ liệu và kiến trúc hệ thống

### Luồng xử lý dữ liệu cơ bản

1. **UI Components** gọi đến **Hooks** hoặc **Services**
2. **Hooks/Services** tương tác với Firebase thông qua các hàm trong thư mục `services/firebase`
3. Dữ liệu được lưu trữ trong Firestore và được đồng bộ với ứng dụng
4. Dữ liệu được cache trong AsyncStorage để hỗ trợ chế độ offline

### Sơ đồ kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           REACT NATIVE APP                               │
│                                                                          │
│  ┌─────────────┐     ┌─────────────┐      ┌─────────────────────────┐   │
│  │             │     │             │      │                         │   │
│  │  UI Layer   │     │  App Logic  │      │  Data Management        │   │
│  │             │     │             │      │                         │   │
│  │  Components ├────►│   Hooks     ├─────►│  Services               │   │
│  │  Screens    │     │   Context   │      │  Firebase Services      │   │
│  │  Navigation │◄────┤   State     │◄─────┤  Local Storage          │   │
│  │             │     │             │      │                         │   │
│  └─────────────┘     └─────────────┘      └──────────┬──────────────┘   │
│                                                       │                  │
└───────────────────────────────────────────────────────┼──────────────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           FIREBASE                                       │
│                                                                          │
│  ┌─────────────┐                              ┌─────────────┐           │
│  │             │                              │             │           │
│  │ Firestore   │                              │ Auth        │           │
│  │ Database    │                              │             │           │
│  │             │                              │             │           │
│  └──────┬──────┘                              └──────┬──────┘           │
│         │                                            │                   │
│         └────────────────────────────────────────────┘                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       THIRD-PARTY SERVICES                               │
│                                                                          │
│  ┌─────────────┐     ┌─────────────┐      ┌─────────────────────────┐   │
│  │             │     │             │      │                         │   │
│  │ ImageKit    │     │ FCM         │      │ Expo Libraries          │   │
│  │ (Image      │     │ (Push       │      │ - expo-localization     │   │
│  │  Storage)   │     │  Notif.)    │      │ - expo-notifications    │   │
│  │             │     │             │      │ - expo-image-picker     │   │
│  │             │     │             │      │ - expo-location         │   │
│  └─────────────┘     └─────────────┘      └─────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Luồng xử lý chi tiết

1. **Người dùng tương tác với UI**
   - Người dùng thực hiện hành động trên giao diện (nhấn nút, điền form, v.v.)
   - Component UI gọi đến các hàm xử lý sự kiện

2. **Xử lý logic ứng dụng**
   - Custom hooks xử lý logic nghiệp vụ
   - Context API quản lý trạng thái toàn cục (auth, theme, i18n)
   - React Query quản lý trạng thái server và cache

3. **Tương tác với dữ liệu**
   - Services gọi API đến Firebase hoặc các dịch vụ bên thứ ba
   - Dữ liệu được xử lý và chuyển đổi sang định dạng phù hợp
   - Kết quả được trả về cho UI thông qua hooks

4. **Lưu trữ và đồng bộ dữ liệu**
   - Dữ liệu cấu trúc được lưu trữ trong Firestore
   - Hình ảnh được tải lên và quản lý bởi ImageKit thay vì Firebase Storage
   - Dữ liệu được cache trong AsyncStorage để hỗ trợ sử dụng offline
   - Thông báo đẩy được gửi qua Firebase Cloud Messaging (FCM)
   - Các thư viện Expo được sử dụng để tương tác với các tính năng của thiết bị

### Sơ đồ luồng người dùng

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Đăng ký/   │     │  Chọn sở    │     │  Màn hình   │     │  Khám phá   │
│  Đăng nhập  ├────►│  thích      ├────►│  chính      ├────►│  Spaces     │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └──────┬──────┘     └──────┬──────┘
                                               │                   │
                                               │                   │
                                               ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Tham gia   │     │  Tạo bài    │     │  Tạo Space  │     │  Tìm kiếm   │
│  Space      │◄────┤  đăng/sự    │◄────┤  mới        │◄────┤  Spaces     │
│             │     │  kiện       │     │             │     │             │
└──────┬──────┘     └──────┬──────┘     └─────────────┘     └─────────────┘
       │                   │
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Tương tác  │     │  Trò chuyện │     │  Kết nối    │     │  Xem lịch   │
│  nội dung   ├────►│  với thành  ├────►│  với người  ├────►│  sự kiện    │
│             │     │  viên       │     │  dùng khác  │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

Luồng người dùng chính:

1. **Đăng ký/Đăng nhập**: Người dùng đăng ký tài khoản mới hoặc đăng nhập vào tài khoản hiện có
2. **Chọn sở thích**: Người dùng mới chọn ít nhất 3 sở thích để nhận gợi ý phù hợp
3. **Màn hình chính**: Hiển thị nội dung phổ biến, không gian đã tham gia, sự kiện sắp tới
4. **Khám phá Spaces**: Tìm kiếm và khám phá các không gian dựa trên sở thích
5. **Tham gia Space**: Tham gia vào không gian hiện có hoặc tạo không gian mới
6. **Tương tác nội dung**: Xem, thích, bình luận bài đăng và đặt câu hỏi
7. **Trò chuyện**: Nhắn tin với thành viên khác trong không gian hoặc trò chuyện riêng
8. **Kết nối**: Kết nối với người dùng khác có cùng sở thích
9. **Xem lịch sự kiện**: Theo dõi và tham gia các sự kiện sắp tới

## Tài liệu

Tài liệu chi tiết về cách phát triển và sử dụng ứng dụng có thể được tìm thấy trong thư mục `docs`:

### Tài liệu cơ bản
- [Tổng quan hệ thống](./docs/01-tong-quan-he-thong.md)
- [Hướng dẫn phát triển giao diện](./docs/02-huong-dan-phat-trien-giao-dien.md)
- [Hướng dẫn phát triển backend](./docs/03-huong-dan-phat-trien-backend.md)
- [Hướng dẫn tạo màn hình mới](./docs/04-huong-dan-tao-man-hinh-moi.md)
- [Hướng dẫn sử dụng Hooks và Context](./docs/05-huong-dan-su-dung-hooks-va-context.md)
- [Hướng dẫn phát triển và test](./docs/06-huong-dan-phat-trien-va-test.md)

### Tài liệu tính năng mới
- [Hướng dẫn triển khai đa ngôn ngữ (i18n)](./docs/i18n-implementation.md)
- [Hướng dẫn triển khai chế độ tối (Dark Mode)](./docs/huong-dan-theme-dark-mode.md)
- [Hướng dẫn sử dụng ImageKit](./docs/imagekit-setup.md)
- [Tiến độ phát triển chi tiết](./docs/tien-do-phat-trien.md)

### Công cụ phụ trợ
- [Firebase ERD Viewer](./view-model/firebase-erd-viewer/README.md) - Công cụ trực quan hóa cấu trúc dữ liệu Firebase

## Cập nhật gần đây

### Tính năng đã hoàn thành
- ✅ **Đa ngôn ngữ (i18n)**: Hỗ trợ tiếng Anh và tiếng Việt, với khả năng chuyển đổi ngôn ngữ trong ứng dụng
- ✅ **Chế độ tối (Dark Mode)**: Giao diện tối với độ tương phản tốt, tự động theo dõi cài đặt hệ thống
- ✅ **ImageKit**: Tích hợp dịch vụ lưu trữ và tối ưu hóa hình ảnh thay thế cho Firebase Storage
- ✅ **Tái cấu trúc HomeScreen**: Chia thành các thành phần nhỏ hơn (EmptyStateScreen, RegularHomeScreen)
- ✅ **Cải thiện SpaceProfileScreen**: Hiển thị bài đăng, sự kiện, thành viên và thông tin chi tiết
- ✅ **Thông báo đẩy**: Tích hợp Firebase Cloud Messaging và Expo Notifications
- ✅ **Tin nhắn trong space**: Cho phép trò chuyện trong không gian với tất cả thành viên
- ✅ **Quên mật khẩu**: Khôi phục mật khẩu thông qua email
- ✅ **Bình luận bài đăng**: Thêm, xóa và hiển thị bình luận cho bài đăng
- ✅ **Câu hỏi trong space**: Đặt và trả lời câu hỏi trong không gian cụ thể

### Đang phát triển
- 🔄 **Đăng nhập bằng mạng xã hội**: Tích hợp đăng nhập bằng Google và Facebook
- 🔄 **Phòng chat theo chủ đề trong spaces**: Tạo và quản lý các phòng chat theo chủ đề
- 🔄 **Tìm kiếm nâng cao**: Cải thiện tìm kiếm với bộ lọc và gợi ý thông minh
- 🔄 **Cải thiện hiệu suất**: Tối ưu hóa truy vấn Firestore và cache dữ liệu

### Kế hoạch tương lai
- 📅 **Phân tích dữ liệu**: Thống kê và báo cáo về hoạt động của người dùng và spaces
- 📅 **Tích hợp video call**: Cho phép gọi video trong chat và tổ chức sự kiện trực tuyến

https://app.clickup.com/90181030883/v/b/6-901807660274-2?pr=90183688770