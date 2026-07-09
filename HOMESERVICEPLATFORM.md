Đề tài 3. HỆ THỐNG ĐẶT LỊCH DỊCH VỤ TẠI NHÀ (HOME SERVICE
BOOKING PLATFORM)
3.1. Tóm tắt dự án
Lấy cảm hứng từ mô hình của Grab, Gojek, dự án này xây dựng một nền tảng kết nối
người dùng có nhu cầu sử dụng các dịch vụ tại nhà (sửa điện nước, dọn dẹp nhà cửa, sửa
máy lạnh...) với các nhà cung cấp dịch vụ (thợ lành nghề, công ty dịch vụ).
3.2. Các Tác nhân (User Roles) & Phân quyền
– Khách hàng (Customer): Người có nhu cầu tìm và đặt dịch vụ.
– Nhà cung cấp dịch vụ (Service Provider / "Thợ"): Cá nhân hoặc công ty cung cấp
dịch vụ.
– Quản trị viên (Admin): Người điều hành và giải quyết các vấn đề của nền tảng.
3.3. Yêu cầu Chức năng chi tiết (Functional Requirements)
a. Module dành cho Khách hàng (Customer)

1. Tìm kiếm & Khám phá:
   • Tìm kiếm dịch vụ theo từ khóa ("sửa điều hòa") và địa điểm (bản đồ hoặc khu
   vực).
   • Bộ lọc nâng cao: Lọc theo đánh giá (rating), khoảng giá, khung giờ rảnh.
2. Xem và Lựa chọn:
   • Xem trang hồ sơ chi tiết của "Thợ": mô tả kinh nghiệm, hình ảnh, danh sách dịch
   vụ kèm giá, và quan trọng nhất là các đánh giá từ khách hàng trước.
3. Đặt lịch & Thanh toán:
   • Chọn một hoặc nhiều dịch vụ, chọn khung giờ mong muốn.
   • Mô tả tình trạng (ví dụ: "điều hòa không lạnh, chỉ ra gió").
   • Thanh toán tiền đặt cọc hoặc toàn bộ qua cổng thanh toán tích hợp.
4. Tương tác & Theo dõi:
   • Nhận thông báo real-time khi "Thợ" chấp nhận/từ chối yêu cầu.
   • Chat trực tiếp với "Thợ" để trao đổi thêm.

NDDuy 2
• Theo dõi trạng thái công việc (Đã chấp nhận -> Đang đến -> Bắt đầu làm -> Hoàn
thành). 5. Đánh giá & Lịch sử:
• Để lại đánh giá (1-5 sao) và bình luận sau khi công việc hoàn tất.
• Xem lại lịch sử tất cả các dịch vụ đã sử dụng.
b. Module dành cho Nhà cung cấp Dịch vụ (Provider)

1. Quản lý Hồ sơ & Dịch vụ:
   • Tạo và quản lý hồ sơ năng lực cá nhân/công ty.
   • Tạo và quản lý các gói dịch vụ mình cung cấp kèm theo bảng giá chi tiết.
2. Quản lý Lịch làm việc:
   • Thiết lập lịch rảnh/bận của mình trên một giao diện lịch trực quan để khách hàng
   biết khi nào có thể đặt.
3. Quản lý Yêu cầu Dịch vụ:
   • Nhận thông báo tức thì về các yêu cầu đặt lịch mới.
   • Xem chi tiết yêu cầu và quyết định Chấp nhận/Từ chối.
   • Chat với khách hàng.
4. Quản lý Thu nhập:
   • Dashboard thống kê doanh thu theo tuần/tháng.
   • Xem lịch sử các giao dịch và số tiền nhận được sau khi trừ phí hoa hồng của sàn.
   c. Module dành cho Quản trị viên (Admin)
5. Kiểm duyệt & Quản lý:
   • Duyệt hồ sơ của các Nhà cung cấp dịch vụ mới đăng ký.
   • Quản lý (khóa/mở) tài khoản của tất cả người dùng.
6. Quản lý Hệ thống:
   • Quản lý các danh mục dịch vụ (Điện lạnh, Điện nước, Dọn dẹp...).
   • Thiết lập mức phí hoa hồng cho các giao dịch.

Đồ án Web

NDDuy 3 3. Báo cáo & Phân tích:
• Xem các báo cáo tổng quan về hoạt động của nền tảng: tổng giao dịch, doanh
thu, các dịch vụ được sử dụng nhiều nhất... 4. Hỗ trợ & Giải quyết tranh chấp:
• Can thiệp khi có khiếu nại, tranh chấp giữa Khách hàng và Nhà cung cấp.
3.4. Các Yếu tố Công nghệ & Kỹ thuật Nổi bật
– Hệ thống Đặt lịch & Xử lý Xung đột: Đảm bảo "Thợ" không bị đặt trùng lịch.
– Hệ thống Thông báo Real-time: Sử dụng SignalR (ASP.NET Core), Laravel Echo,
hoặc Django Channels.
– Hệ thống Đánh giá & Uy tín: Xây dựng thuật toán tính điểm trung bình, sắp xếp
"Thợ" theo uy tín.
– Tích hợp Thanh toán: Tích hợp API của MoMo, VNPay hoặc ZaloPay.
– Tích hợp Bản đồ: Sử dụng Google Maps API để tìm kiếm theo vị trí, hiển thị địa
chỉ, và có thể phát triển thêm tính năng theo dõi lộ trình của "Thợ".
– Kiến trúc API-first: Thiết kế các API backend một cách khoa học để cả web và (trong
tương lai) app mobile đều có thể sử dụng.
3.5. Yêu cầu Phi chức năng & Thách thức
– Hệ thống tin nhắn Real-time: Sử dụng SignalR/Laravel Echo/WebSockets để xây
dựng tính năng chat.
– Hệ thống đánh giá và uy tín: Logic tính điểm trung bình, hiển thị đánh giá là yếu
tố sống còn của nền tảng.
– Thông báo đẩy (Push Notification): Gửi thông báo tức thì đến các bên liên quan.
– Tích hợp bản đồ: Cho phép khách hàng ghim vị trí, giúp thợ tìm đường.

TÊN ĐỀ TÀI:
XÂY DỰNG NỀN TẢNG ĐẶT LỊCH DỊCH VỤ TẠI NHÀ
NỘI DUNG YÊU CẦU CỦA ĐỀ TÀI:

1. Phân tích và Thiết kế hệ thống:
    Khảo sát và phân tích mô hình nền tảng kết nối người dùng có nhu cầu với các
   nhà cung cấp dịch vụ tại nhà.
    Phân quyền chi tiết cho ba nhóm tác nhân chính: Khách hàng, Nhà cung cấp
   dịch vụ (Thợ) và Quản trị viên.
    Thiết kế kiến trúc API-first hiện đại để sẵn sàng mở rộng cho cả Web và Mobile
   App.
2. Xây dựng Nền tảng Ứng dụng/Website với các nhóm chức năng:
    Module Khách hàng (Customer): Xây dựng công cụ tìm kiếm dịch vụ theo từ
   khóa và định vị khu vực trên bản đồ. Phát triển tính năng xem hồ sơ thợ, tra cứu
   đánh giá, đặt lịch theo khung giờ và thanh toán trực tuyến. Tích hợp chức năng
   theo dõi trạng thái công việc thời gian thực và chat trực tiếp với thợ.
    Module Nhà cung cấp dịch vụ (Provider): Xây dựng giao diện quản lý hồ sơ,
   dịch vụ và bảng giá chi tiết. Phát triển công cụ thiết lập lịch làm việc, quản lý
   lịch rảnh/bận trực quan. Cung cấp khả năng nhận thông báo đặt lịch mới tức thì,
   phản hồi yêu cầu và theo dõi thống kê doanh thu.

 Module Quản trị viên (Admin): Xây dựng hệ thống kiểm duyệt hồ sơ đăng ký mới
của thợ và quản lý trạng thái tài khoản người dùng. Cung cấp công cụ quản lý
danh mục dịch vụ, thiết lập phí hoa hồng và can thiệp giải quyết tranh chấp.
Phát triển hệ thống báo cáo, thống kê tổng giao dịch và doanh thu nền tảng.
 Tính năng Kỹ thuật Cốt lõi: Xây dựng thuật toán kiểm tra và xử lý xung đột nhằm
đảm bảo thợ không bị đặt trùng lịch. Áp dụng hệ thống tính điểm trung bình để
xếp hạng mức độ uy tín của thợ. 3. Công nghệ dự kiến sử dụng:
 Frontend: Ứng dụng Single Page Application (SPA) với React.js và Tailwind
CSS mang lại trải nghiệm mượt mà.
 Backend: Framework ASP.NET Core Web API với hiệu năng cao và cấu trúc
bảo mật chặt chẽ.
 Cơ sở dữ liệu: Hệ quản trị cơ sở dữ liệu quan hệ PostgreSQL tối ưu cho các mối
quan hệ phức tạp.
 Thời gian thực: Sử dụng thư viện SignalR tích hợp sâu với ASP.NET Core để xử
lý tin nhắn chat và thông báo hệ thống.
 Tích hợp API (Third-party): Sử dụng Google Maps Platform (Places,
Geocoding) cho bản đồ và định vị. Tích hợp Firebase Cloud Messaging (FCM)
cho thông báo đẩy. Sử dụng cổng thanh toán MoMo/VNPay/ZaloPay. Lưu trữ tệp
tin trên Cloudinary hoặc AWS S3. 4. Sản phẩm dự kiến:
 Nền tảng đặt lịch dịch vụ đa phân quyền hoạt động hoàn chỉnh, được triển khai
lên Internet (Cloud/VPS).
 Quyển báo cáo đồ án, tài liệu thiết kế (ERD, API Docs) và hướng dẫn sử dụng
chi tiết.

Tích hợp Frontend - Backend hoàn chỉnh: Hoàn thành việc kết nối liên thông dòng
dữ liệu giữa Client và Server. Ứng dụng chạy thực tế dưới môi trường Localhost phải
tiếp nhận dữ liệu động thông qua Payload JSON từ API mạng và render trực tiếp lên
giao diện, thay thế hoàn toàn dữ liệu tĩnh (Hardcoded data). 2. Tối ưu hóa Axios/Fetch Interceptors: Bắt buộc đóng gói mã nguồn gọi mạng tập
trung. Thiết lập các hàm chặn dữ liệu (Interceptors) để tự động đính kèm mã xác thực
Token vào tiêu đề (Header Authorization: Bearer <Token>) và thiết lập cơ chế tự
động làm mới mã (Refresh Token logic) khi Access Token hết hạn. 3. Xử lý UX Trải nghiệm mạng nâng cao: Tuyệt đối không để màn hình trống hoặc bị
đơ đóng băng trong thời gian chờ API phản hồi. Sinh viên phải cấu hình các hiệu ứng
chờ trực quan (Loading Spinner hoặc Skeleton Screen) kết hợp hệ thống thông báo
Toast Notification phản hồi tức thì sau mỗi thao tác (Thêm, Xóa, Sửa).

Đề tài 3: Home Service Booking Platform (Ứng dụng gọi thợ sửa chữa tại nhà)
• Công nghệ sử dụng: React.js Web App (dành cho Quản lý), Mobile App di động (dành
cho Khách hàng & Thợ), thư viện bản đồ số ‘@react-google-maps/api’ và thư viện kết nối
‘@microsoft/signalr’.
• Cơ chế tích hợp: Kết nối trực tiếp vào SignalR Hub để truyền phát và tiếp nhận định
kỳ tọa độ của Thợ sửa chữa theo thời gian thực. Phía giao diện của Khách hàng và Quản
lý sẽ duyệt qua mảng danh sách Thợ đang hoạt động và cập nhật vị trí các ghim (Markers)
chuyển động trực tiếp trên nền bản đồ số.
• Xử lý UX đặc thù: Khi Backend đẩy tín hiệu gán đơn hàng khẩn cấp, ứng dụng phía
Thợ sửa chữa phải lập tức kích hoạt âm thanh chuông báo chu kỳ ngắn, bật sáng màn hình
hiển thị hộp thoại Modal đếm ngược 30 giây kèm hai nút bấm tương tác kích thước lớn:
'Chấp nhận đơn' và 'Từ chối đơn' nhằm tối ưu hóa thao tác khi thợ đang di chuyển trên
đường.

I. MỤC TIÊU VÀ YÊU CẦU ĐẠT ĐƯỢC TRONG TUẦN 7
• Tối ưu hóa Hiệu năng (Performance Optimization): Giảm tải cho Cơ sở dữ liệu
thông qua cơ chế đánh chỉ mục (Database Indexing) và triển khai bộ nhớ đệm (Caching)
cho các truy vấn lặp lại nhiều lần.
• Thắt chặt Bảo mật (System Security): Cô lập toàn bộ thông tin nhạy cảm (Chuỗi kết
nối CSDL, API Keys của bên thứ ba, Private Keys) ra khỏi mã nguồn bằng biến môi
trường. Cấu hình chính sách chia sẻ tài nguyên nguồn gốc chéo (CORS) chặt chẽ.
• Triển khai Hệ thống (Cloud Deployment): Đưa toàn bộ mã nguồn Frontend, Backend
và CSDL lên các nền tảng điện toán đám mây công cộng (Vercel, Render, AWS, Azure,
hoặc VPS) và liên kết chúng chạy ổn định trực tuyến.
• Đóng gói & Viết Báo cáo: Hoàn thiện Chương 3 (Cài đặt và Thử nghiệm nghiệm thu)
trong quyển báo cáo đồ án tốt nghiệp.

Đề tài 3: Home Service Booking Platform (Ứng dụng gọi thợ sửa chữa tại nhà)
• Giải pháp Tối ưu & Bảo mật: Đánh chỉ mục (Non-Clustered Index) cho trường
‘Status’ và ‘ScheduledTime’ trên SQL Server giúp lọc đơn hàng siêu tốc. Mã hóa chuỗi
Connection String bằng công nghệ quản lý cấu hình tệp hệ thống (‘appsettings.json’ bảo
mật trên Azure).
• Hạ tầng Triển khai Production: Hệ thống .NET Core Backend triển khai trực tiếp lên
Azure App Service (PaaS). Sử dụng dịch vụ Azure SQL Database để đồng bộ hóa hạ tầng
Microsoft.
