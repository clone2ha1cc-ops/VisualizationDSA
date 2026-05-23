# 🧪 Danh Sách Tính Năng Đã Kiểm Thử - Features Verified & Test Suite Status

Tài liệu này ghi nhận trạng thái kiểm thử đơn vị tự động (Unit Test Suite) của toàn bộ 23 tính năng hạt nhân thuộc Phase 1 và Phase 2 của dự án **VisualizationDSA**.

---

## 📌 Trạng Thái Bao Phủ Kiểm Thử (Test Coverage Status)
*   **Tổng số tính năng hạt nhân:** 23/23 Tính năng + Phase 1 Animation Engine (23 tests) + Phase 1 Custom Input (38 tests mới).
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
| 27 | **Animation Store** | FSM UNINITIALIZED → LOADED | loadResult chuyển trạng thái, gán currentIndex=0, frames > 0. | 🟢 PASSED |
| 28 | **Animation Store** | stepForward/stepBackward | Tăng/giảm currentIndex, kẹp biên [0, totalSteps-1]. | 🟢 PASSED |
| 29 | **Animation Store** | scrubTo out-of-bounds guard | Từ chối index âm hoặc vượt kích thước mảng frames. | 🟢 PASSED |
| 30 | **Animation Store** | play/pause cascade setTimeout | Tick tự động tăng currentIndex, pause dừng hẳn timer. | 🟢 PASSED |
| 31 | **Animation Store** | isFinished + FINISHED state | Chạm bước cuối → isFinished=true, play bị chặn. | 🟢 PASSED |
| 32 | **Animation Store** | progressPercent computation | 0% ở step đầu, 100% ở step cuối. | 🟢 PASSED |
| 33 | **Dummy Engine** | BubbleSort algorithmId/pseudoCode | Trả đúng 'bubble-sort' và 4 dòng pseudoCode. | 🟢 PASSED |
| 34 | **Dummy Engine** | First frame = unsorted array | stepId=1, dataState khớp input, highlights rỗng. | 🟢 PASSED |
| 35 | **Dummy Engine** | Last frame = sorted array | dataState sắp xếp tăng dần, sorted indices = N. | 🟢 PASSED |
| 36 | **Dummy Engine** | Sequential stepIds | Tất cả frames có stepId liên tục từ 1 đến N. | 🟢 PASSED |
| 37 | **Dummy Engine** | Single-element array | Trả ít nhất 1 frame, dataState giữ nguyên. | 🟢 PASSED |
| 38 | **Dummy Engine** | Compare highlights validation | Compare frames luôn chứa đúng 2 index liền kề. | 🟢 PASSED |
| 39 | **Input Store** | Initial state defaults | rawText='', maxLimit=50, isLoading=false. | 🟢 PASSED |
| 40 | **Input Store** | parsedArray Regex parsing | Phân tách chuỗi thô thành int[], từ chối ký tự lạ. | 🟢 PASSED |
| 41 | **Input Store** | Negative/single number parsing | Hỗ trợ -5, +3, số đơn lẻ '42'. | 🟢 PASSED |
| 42 | **Input Store** | isValidFormat Regex check | true cho '12, 5, 8', false cho '12, a', '5,,3', '12.5'. | 🟢 PASSED |
| 43 | **Input Store** | isWithinLimit guard | true khi N <= maxLimit, false khi vượt. | 🟢 PASSED |
| 44 | **Input Store** | canExecute composite gate | false khi rỗng/sai format/vượt limit/loading, true khi hợp lệ. | 🟢 PASSED |
| 45 | **Input Store** | setLimit action | Cập nhật maxLimit thành giá trị mới. | 🟢 PASSED |
| 46 | **Input Store** | generateRandomInput random | Sinh mảng ngẫu nhiên [10,99], đếm đúng size. | 🟢 PASSED |
| 47 | **Input Store** | generateRandomInput nearly-sorted | Mảng gần sắp xếp, tối đa 2 cặp đảo. | 🟢 PASSED |
| 48 | **Input Store** | generateRandomInput reversed | Mảng giảm dần hoàn toàn. | 🟢 PASSED |
| 49 | **Input Store** | generateRandomInput clamp | Kẹp size không vượt maxLimit. | 🟢 PASSED |
| 50 | **Input Store** | clear action | Reset rawText, apiErrorMessage, isLoading. | 🟢 PASSED |
| 51 | **Input Store** | submitCustomInput guard | Không gọi API khi canExecute=false. | 🟢 PASSED |
| 52 | **Input Store** | submitCustomInput fallback | Fallback sang dummy engine khi API unreachable. | 🟢 PASSED |
