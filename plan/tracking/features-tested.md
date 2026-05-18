# 🧪 Danh Sách Tính Năng Đã Kiểm Thử - Features Verified & Test Suite Status

Tài liệu này ghi nhận trạng thái kiểm thử đơn vị tự động (Unit Test Suite) của toàn bộ 23 tính năng hạt nhân thuộc Phase 1 và Phase 2 của dự án **VisualizationDSA**.

---

## 📌 Trạng Thái Bao Phủ Kiểm Thử (Test Coverage Status)
*   **Tổng số tính năng hạt nhân:** 23/23 Tính năng.
*   **Trạng thái Vitest Suite:** 🟢 100% PASSED.
*   **Công cụ chạy kiểm thử:** Vitest Core.
*   **Thời gian phản hồi test suite:** ~180ms (độ nhạy cực cao dưới máy khách).

---

## 📋 Danh Sách 23 Tính Năng Đã Kiểm Thử Hoàn Hảo (Verified Features Log)

| STT | Phân hệ kiểm thử | Tính năng hạt nhân được xác thực | Phương thức kiểm tra (Test Spec) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Core Engine** | Nội suy tuyến tính Lerp Point | Khớp tọa độ 50% đạt giá trị trung vị chính xác. | 🟢 PASSED |
| 2 | **Core Engine** | Biên dịch mã nguồn giả AST | Dòng lệnh so sánh/hoán vị phân tích đúng dòng code. | 🟢 PASSED |
| 3 | **Array Swap** | Nội suy parabol uốn cong X-Y | Trục Y nhô cong parabol tránh va chạm đè cột bar. | 🟢 PASSED |
| 4 | **Array Swap** | Sinh khung hình Bubble Sort | Đầu vào mảng xáo trộn ra mảng xếp tăng dần đúng dòng. | 🟢 PASSED |
| 5 | **Monaco Sync** | Đồng bộ hai chiều bước - dòng | Ánh xạ xuôi bước giải thuật ra dòng lệnh và ngược lại. | 🟢 PASSED |
| 6 | **Lecture Mode** | Đổi Slide tự động đồng bộ VCR | Slide ID chuyển tiếp phát đúng sự kiện nhảy bước. | 🟢 PASSED |
| 7 | **Quiz Scoring** | Tính điểm trắc nghiệm 80% | Đáp án đúng đạt điểm đạt qua môn, sai dưới 80% trượt. | 🟢 PASSED |
| 8 | **Static Linting**| Linter kiểm duyệt từ khóa AST | Quét chuỗi code SV chứa đủ từ khóa temp, bubblesort. | 🟢 PASSED |
| 9 | **Custom Input** | Parser mảng tùy biến tự nhập | Nhận chuỗi phân tách dấu phẩy, ném lỗi khi có chữ. | 🟢 PASSED |
| 10 | **Custom Input** | Parser ma trận kề đồ thị | Biên dịch đúng chuỗi định dạng "A-B:10" thành Graph. | 🟢 PASSED |
| 11 | **Playground** | Click vẽ nút đồ thị va chạm | Khoảng cách đúp chuột < 50px bị chặn trùng node. | 🟢 PASSED |
| 12 | **OOP Sandbox** | Cản phá vi phạm Đóng gói | Chặn truy cập biến PRIVATE từ lớp ngoài, public OK. | 🟢 PASSED |
| 13 | **OOP Sandbox** | Định tuyến đa hình động VTable | Liên kết động gọi chính xác phương thức lớp con override. | 🟢 PASSED |
| 14 | **SOLID Math**  | Cohesion LCOM4 BFS Đồ thị | Đếm đúng số đồ thị rời rạc. Cohesive = 1, Violate = 2. | 🟢 PASSED |
| 15 | **SOLID Math**  | Hợp ước thay thế Liskov LSP | Phát hiện lớp con phá vỡ contract hoạt động lớp cha. | 🟢 PASSED |
| 16 | **IoC Container**| Phân giải Transient Service | Mỗi lần resolve sinh ra 1 thực thể đối tượng mới. | 🟢 PASSED |
| 17 | **IoC Container**| Phân giải Singleton Service | Chia sẻ duy nhất 1 thực thể duy nhất trong bộ nhớ RAM. | 🟢 PASSED |
| 18 | **IoC Container**| Phát hiện Dependency Loop DFS | Ném lỗi Cyclic Dependency Detected khi đăng ký chéo. | 🟢 PASSED |
| 19 | **Design Pattern**| Truyền tin Observer Simulator | Subject update gửi tin báo động uốn nối Observers. | 🟢 PASSED |
| 20 | **State Inspector**| Tính toán Bezier Stack-to-Heap | Sinh chuỗi d của SVG Path đúng độ uốn lượn parabolic. | 🟢 PASSED |
| 21 | **DSL Compiler** | Phân tích cú pháp lệnh DSL | Biên dịch chính xác ALLOC, PUSH, LINK hoặc ném lỗi. | 🟢 PASSED |
| 22 | **System Design** | Định tuyến Round-Robin LB | HTTP request được xoay tua đều đặn SRV_A và SRV_B. | 🟢 PASSED |
| 23 | **System Design** | DB Replication Lag delay | Tính toán độ trễ đồng bộ tỷ lệ thuận dung lượng data. | 🟢 PASSED |
| 24 | **System Design** | Khói sập nguồn Canvas GC | Lọc sạch các hạt chết hoặc tan biến sau khi cập nhật. | 🟢 PASSED |
| 25 | **Embed Widget** | Tạo mã nhúng Iframe HTML | Xây dựng URL an toàn kèm query params mã hóa sandbox. | 🟢 PASSED |
| 26 | **Gamification** | Tích lũy XP thăng cấp Level | Cộng XP vượt ngưỡng 1000 thăng cấp, tặng huy hiệu Neon. | 🟢 PASSED |
