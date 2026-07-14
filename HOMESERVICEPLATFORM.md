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

Tuần Nhiệm vụ & Thực hành Sản phẩm

Tuần 1 Khảo sát mô hình kinh tế chia sẻ
(Grab). Phân tách Customer, Provider
(Thợ), Admin.

[ ] Báo cáo C1: Mô hình On-
demand Home Service.

[ ] Bảng tính năng MoSCoW.

Tuần 2 Đặc tả luồng xử lý đơn: Khách đặt ->
Bắn Noti -> Thợ nhận -> Đang sửa ->
Hoàn thành.

[ ] Sơ đồ Use Case.
[ ] Lưu đồ thuật toán (Flowchart)
chuyển trạng thái đơn.

Tuần 3 Thiết kế CSDL quan hệ lưu ý định dạng
lưu tọa độ (Decimal) và hệ thống
Rating.

[ ] Sơ đồ ERD.
[ ] Data Dictionary.

Tuần 4 Thiết kế UI: App cho thợ (ưu tiên to, rõ),
App/Web cho user (có bản đồ).

[ ] Link Figma 2 phân hệ.
[ ] Repo Git.

Tuần Nhiệm vụ & Thực hành Sản phẩm

Tuần 5 Xây dựng API (.NET/Node) thuật toán
quét tìm thợ trong bán kính X kilomet
(Toán học Haversine).

[ ] API tìm kiếm thợ theo tọa độ.
[ ] Postman Test.

Tuần 6 Tích hợp Google Maps (hiển thị ghim
Thợ). Tích hợp FCM báo rung khi có
đơn mới.

[ ] Giao diện Web/App tích hợp
bản đồ thật.
[ ] Test Push Notification.

Tuần 7 Deploy và tích hợp thanh toán cọc
(VNPay) chống bùng lịch thợ.

[ ] URL chạy trực tuyến.
[ ] Báo cáo đồ án.

2. Đặc tả Use Case cốt lõi: “Đặt lịch hẹn sửa chữa khẩn cấp”
   Luồng chính (Main Flow): Khách hàng chọn loại dịch vụ → Hệ thống lấy tọa độ GPS của
   khách hàng → Quét và hiển thị danh sách Thợ đang rảnh trong bán kính 5km → Khách hàng
   chọn Thợ và gửi yêu cầu → Hệ thống đẩy thông tin (Push Notification) đến app của Thợ → Thợ
   nhấn “Chấp nhận”.
3. Yêu cầu Phi chức năng tối ưu
   Tính khả dụng & Định vị: Chức năng định vị phải hoạt động chính xác dựa trên Google Maps
   API. Thông báo đẩy gửi đến điện thoại của Thợ khi có đơn mới phải đạt tỷ lệ thành công trên
   98% thông qua Firebase Cloud Messaging (FCM).

ĐỀ TÀI 3: HOME SERVICE BOOKING PLATFORM

1. Thiết kế Kiến trúc Hệ thống
   Sử dụng kiến trúc Microservices thu nhỏ hoặc Monolith phân rã tầng (Clean
   Architecture/DDD) chạy trên nền tảng .NET Core. Tách biệt rõ ràng tầng Presentation (Web API),
   Domain (Nghiệp vụ cốt lõi), Infrastructure (Kết nối SQL Server, Firebase, Google Maps API).
2. Cấu trúc Thực thể (ERD) & Mối quan hệ lõi

● Customers (Khách hàng) & Providers (Thợ): Có thể kế thừa từ bảng Users chung hoặc
tách riêng biệt. Bảng Providers bắt buộc lưu tọa độ định vị hiện tại (latitude, longitude) kiểu
DECIMAL(9,6) và trạng thái sẵn sàng (is_available).
● Services (Dịch vụ): Danh mục dịch vụ (Sửa điện, Điện lạnh, Dọn dẹp) kèm biểu giá cơ
sở.
● Bookings (Lịch hẹn): Lưu customer_id, provider_id, service_id, ngày giờ hẹn, trạng thái
(Pending, Accepted, In_Progress, Completed, Cancelled).
● Reviews (Đánh giá): Kết nối trực tiếp với booking_id để đảm bảo chỉ những lịch hẹn đã
hoàn thành mới được phép đánh giá.

Đề tài 3: Home Service Booking Platform (Ứng dụng gọi thợ sửa chữa
tại nhà)
Màn hình Figma bắt buộc:
● Màn hình 1 - Bản đồ quét ghim vị trí Thợ (Customer Booking Journey): Tích hợp bản đồ
nền hiển thị tọa độ khách hàng và các ghim vị trí động của các thợ xung quanh; sử dụng
bảng trượt bottom sheet để xem nhanh thông tin, xếp hạng sao và bảng giá cơ bản của
thợ.
● Màn hình 2 - Phiếu tiếp nhận đơn của Thợ (Provider Job Sheet): Giao diện tinh gọn phục
vụ thợ di chuyển ngoài đường; hiển thị hộp thoại khẩn cấp đếm ngược 30 giây để chấp
nhận/từ chối đơn kèm bản đồ định vị nhà khách.
Khởi tạo Dự án & Git Commit mẫu: Solution ASP.NET Core Web API tổ chức theo kiến trúc
Clean Architecture, tích hợp SignalR Hubs. Commit mẫu trên nhánh feature/booking-hub:
● setup(solution): structure asp.net core solution into clean architecture tiers
● feat(hub): initialize generic signalr hub for driver location streaming

Đề tài 3: Home Service Booking Platform (Ứng dụng gọi thợ sửa chữa
tại nhà)
Thực thể lõi (C# EF Core Entity): ServiceOrder (Id, CustomerId, HandymanId, ServiceId, Lat,
Lng, Status, ScheduledTime, Notes).
Nhiệm vụ API nghiệp vụ đặc thù:
● POST /api/orders: Khởi tạo yêu cầu đặt thợ sửa chữa. Tự động tính toán khoảng cách địa
lý cơ bản từ tọa độ khách hàng đến danh sách các thợ có trạng thái sẵn sàng để gửi tín
hiệu.
● PUT /api/orders/{id}/status: Cập nhật trạng thái đơn dịch vụ (Được nhận, Đang xử lý, Hoàn
thành, Hủy). Ràng buộc logic: Thợ không thể chuyển thẳng trạng thái từ "Chờ nhận" sang
"Hoàn thành" mà không qua bước "Đang xử lý".
Kịch bản Test Postman: Sử dụng phương thức PUT để thay đổi trạng thái đơn hàng, kiểm tra
mã trạng thái trả về và đảm bảo trường cập nhật thời gian (UpdatedAt) được ghi nhận chính xác
trên SQL Server.

I. MỤC TIÊU VÀ YÊU CẦU ĐẠT ĐƯỢC TRONG TUẦN 6

1. Tích hợp Frontend - Backend hoàn chỉnh: Hoàn thành việc kết nối liên thông dòng
   dữ liệu giữa Client và Server. Ứng dụng chạy thực tế dưới môi trường Localhost phải
   tiếp nhận dữ liệu động thông qua Payload JSON từ API mạng và render trực tiếp lên
   giao diện, thay thế hoàn toàn dữ liệu tĩnh (Hardcoded data).
2. Tối ưu hóa Axios/Fetch Interceptors: Bắt buộc đóng gói mã nguồn gọi mạng tập
   trung. Thiết lập các hàm chặn dữ liệu (Interceptors) để tự động đính kèm mã xác thực
   Token vào tiêu đề (Header Authorization: Bearer <Token>) và thiết lập cơ chế tự
   động làm mới mã (Refresh Token logic) khi Access Token hết hạn.
3. Xử lý UX Trải nghiệm mạng nâng cao: Tuyệt đối không để màn hình trống hoặc bị
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

bây giờ bạn hãy đọc toàn bộ thông tin trên và các thông tin hổm giờ chúng đã bàn.


CHỈNH SỬA YÊU CẦU ĐỒ ÁN

Yêu cầu của thầy:
1. Đánh giá Ưu - Khuyết điểm
* Ưu điểm:
• Xử lý dữ liệu không gian (Spatial Data) thông minh: Dựa vào danh mục tài liệu tham khảo, có thể thấy nhóm đã linh hoạt chuyển đổi từ việc phụ thuộc hoàn toàn vào API trả phí của Google Maps (như đăng ký ban đầu) sang sử dụng bộ công cụ mã nguồn mở Leaflet, OpenStreetMap và đặc biệt là PostGIS. Việc dùng PostGIS trong PostgreSQL để truy vấn khoảng cách/vị trí thợ gần nhất là một điểm cộng kỹ thuật cực kỳ lớn.
• Tích hợp Real-time: Nhóm đã ứng dụng SignalR rất chuẩn xác trong hệ sinh thái của ASP.NET Core để giải quyết bài toán cốt lõi là Chat giữa thợ - khách hàng và Thông báo hệ thống theo thời gian thực.
• Kiến trúc API-First: Việc tách biệt hoàn toàn Frontend (SPA) và Backend API giúp hệ thống có khả năng mở rộng tốt (Scale), sẵn sàng cho việc phát triển thêm Mobile App sau này.
• Xử lý nghiệp vụ phức tạp: Thuật toán chống trùng lịch cho thợ và tính toán xếp hạng tín nhiệm là những luồng logic khó nhưng đã được nhóm đưa vào phạm vi giải quyết.
* Khuyết điểm (Những điểm cần lưu ý):
• Thời gian di chuyển của thợ: Thuật toán chống trùng lịch có thể mới chỉ kiểm tra khoảng thời gian (ví dụ: ca 8h-10h và 10h-12h). Tuy nhiên, trên thực tế, thợ cần thời gian di chuyển giữa 2 địa điểm của 2 khách hàng khác nhau. Nếu không tính toán "buffer time" (thời gian đệm di chuyển), thợ sẽ bị trễ giờ.
• Bảo mật SignalR: Cần làm rõ cơ chế phân quyền khi dùng WebSocket/SignalR. Liệu người dùng khác có thể "lắng nghe" (listen) trộm tin nhắn của người khác nếu biết được tên của Hub hoặc Channel không?
• Xử lý thanh toán ngoại lệ: Khi thanh toán qua MoMo/VNPay, nếu khách hàng đã thanh toán nhưng thợ hủy lịch phút chót do sự cố, luồng hoàn tiền (Refund) tự động hoặc chuyển job cho thợ khác chưa được làm rõ sâu sắc.
2. Câu hỏi phản biện (Dành cho buổi bảo vệ)
Để tự tin ra Hội đồng, nhóm (Trí và Thương) cần chuẩn bị kỹ các câu trả lời cho những vấn đề kỹ thuật sau:
1. Về Database & Hệ thông tin địa lý (GIS): Thầy thấy trong tài liệu các em có sử dụng PostGIS. Các em có thể giải thích sự khác biệt về hiệu năng giữa việc dùng hàm của PostGIS (như ST_DWithin hoặc ST_Distance) để tìm thợ gần nhất ở tầng Database so với việc lấy toàn bộ tọa độ thợ về Backend rồi mới dùng code C# (công thức Haversine) để tính khoảng cách không?
2. Về Real-time (SignalR): Khi khách hàng và thợ đang chat với nhau qua SignalR, nếu khách hàng lỡ đi vào vùng mất mạng (tắt 4G khoảng 1 phút), sau khi có mạng lại, hệ thống làm sao để tải lại những tin nhắn mà thợ đã gửi trong lúc khách hàng bị mất kết nối?
3. Về Xử lý đồng thời (Concurrency): Giả sử Thợ A có một slot trống duy nhất vào lúc 14h chiều nay. Có 2 khách hàng cùng lúc vào xem hồ sơ và bấm "Đặt lịch" chính xác tại cùng một mili-giây. Ở tầng Backend ASP.NET Core hoặc ở Entity Framework Core, các em đã dùng cơ chế Locking nào (Pessimistic hay Optimistic concurrency) để đảm bảo không bị double-booking (2 người đều đặt thành công 1 thợ)?
4. Về Nghiệp vụ: Nếu hệ thống cho phép thanh toán trước (MoMo/ZaloPay), cơ chế nào đảm bảo tiền sẽ được giữ lại (Tạm giữ/Escrow) và chỉ chuyển cho thợ khi khách hàng xác nhận "Công việc đã hoàn thành"? 

tối ưu dự án (lấy bao nhiêu và phân trang):
chọn thợ
Đơn trong lịch đặt
dịch vụ trong thợ khẩn cấp
Đợn trong quản lý công việc
ví kết hợp luôn cổng momo/zalopay
đặt lịch khẩn cấp là khách đặt chọn vị trí thông báo cho toàn thợ trong bán kính ai chấp nhận trước là đơn của người đó
thêm nhiều dữ liệu mẫu
vấn đề xác minh thợ đang làm

Yêu cầu của cô:
Chỉnh sửa lại báo cáo
chỉnh sửa lại các yêu cầu trong quá trình phản biện
Xây dựng quy định hoàn tiền khi hủy đơn lịch
Nghiên cứu việc tạo app di động từ web
Đặt lịch:
Thêm mặc định sđt vào thông tin liên hệ
Thiết lập điều kiện hủy hoàn cọc (điều kiện)
Hệ thống:
Chuyển web thành moblie (bằng icon)

