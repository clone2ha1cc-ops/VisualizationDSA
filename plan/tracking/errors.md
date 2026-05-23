# ⚠️ Nhật Ký Lỗi Và Sự Cố Thường Gặp - Error Codes & Failover Scenarios

Tài liệu này tổng hợp các mã lỗi, kịch bản sự cố và cách thức hệ thống tự động phục hồi (Failover) của **VisualizationDSA** nhằm bảo toàn trải nghiệm mượt mà cho sinh viên.

---

## 1. Danh Mục Mã Lỗi & Cách Xử Lý (Error Directory)

### 🚨 Lỗi 101: Phụ Thuộc Vòng Tròn Trong Thùng Chứa (Cyclic Dependency Loop)
*   **Mô tả:** Đăng ký các token dịch vụ trong IoC Container bị vòng lặp chu trình chéo (A -> B -> A).
*   **Mã Lỗi:** `ERR_IOC_CYCLIC_DEPENDENCY`
*   **Phản ứng hệ thống:** DFS cycle detector chặn đứng lập tức đệ quy trước khi sập RAM, ném ra ngoại lệ báo lỗi sập đỏ rực màn hình.
*   **Cách khắc phục:** Học viên cần tách nhỏ interface hoặc sử dụng nguyên lý đảo ngược phụ thuộc (DIP) thông qua lớp trừu tượng trung gian.

### 🚨 Lỗi 102: Va Chạm Đè Nút Đồ Thị Canvas (Vertex Overlapping)
*   **Mô tả:** Học viên click tạo các nút đồ thị ở khoảng cách quá sát nhau làm đè nút mất thẩm mỹ đồ họa.
*   **Mã Lỗi:** `ERR_PLAYGROUND_NODE_OVERLAP`
*   **Phản ứng hệ thống:** Thuật toán đo khoảng cách Euclidean chặn đứng sự kiện sinh node mới nếu khoảng cách nhỏ hơn 50px.
*   **Cách khắc phục:** Click tạo nút ở vị trí thoáng đãng hơn trên màn hình.

### 🚨 Lỗi 103: Sai Định Dạng Mảng Tùy Biến (Custom Input Parse Error)
*   **Mô tả:** Nhập ký tự lạ hoặc mảng trống/quá dài vào hộp nạp Custom Input.
*   **Mã Lỗi:** `ERR_PARSER_INVALID_FORMAT`
*   **Phản ứng hệ thống:** Trình phân dịch `CustomInputParser` từ chối nạp, ném thông báo đỏ chỉ rõ phần tử lỗi dưới **5ms**.
*   **Cách khắc phục:** Nhập đúng định dạng mảng số cách nhau bởi dấu phẩy (Ví dụ: `5, 8, 12, 20`).

---

## 2. Kịch Bản Tự Phục Hồi Khi Gặp Sự Cố (Failover Scenarios)

### 🛡️ Kịch bản 1: Sập nguồn Web Server trong System Design Visualizer
*   **Ngữ cảnh:** Học sinh click đánh sập Server Web đang gánh tải HTTP.
*   **Hành động tự phục hồi:** 
    1.  Kích hoạt máy phun khói Canvas 2D bốc khói xám cuồn cuộn 60 FPS tức khắc dưới **5ms** tại tọa độ Server bị sập.
    2.  Bộ cân bằng tải Load Balancer loại bỏ ngay Server sập khỏi danh sách định tuyến healthy.
    3.  Tải HTTP request được chuyển dịch mượt mà sang Server còn sống bên cạnh dưới **5ms** mà không làm gián đoạn hệ thống.
    4.  Thu hồi sạch hạt khói khỏi RAM khi tan biến.

### 🛡️ Kịch bản 2: Trôi dòng code khi ẩn Tab trình duyệt (rAF Spike Clamping)
*   **Ngữ cảnh:** Học viên đang xem hoạt ảnh và chuyển tab trình duyệt khác, rAF bị ngắt tạm thời, khi quay lại `deltaTime` tăng đột biến gây giật lắc xé hình.
*   **Hành động tự phục hồi:** Bộ scheduler giới hạn đè `clampedDelta = Math.min(deltaTime, 32)` chặn đứng mọi hiện tượng nhảy giật ảnh.

### 🚨 Lỗi 104: Vue Reactive Proxy Không Thể Structured-Clone Qua postMessage (Phase 2)
*   **Mô tả:** Khi gửi `inputArray.value` (một Vue reactive Proxy) qua `worker.postMessage()`, trình duyệt ném lỗi `Failed to execute 'postMessage' on 'Worker': [object Array] could not be cloned.` vì structured clone algorithm không hỗ trợ Proxy objects.
*   **Mã Lỗi:** `ERR_WORKER_POSTMESSAGE_PROXY`
*   **Nguyên nhân gốc:** `inputArray` là `ref<number[]>` trong Pinia store. Dù truy cập `.value`, kết quả vẫn là reactive Proxy — không phải plain Array.
*   **Cách khắc phục:** Spread operator `[...inputArray.value]` để tạo bản sao plain Array trước khi truyền vào `postMessage`. File sửa: `useLiveCompilerStore.ts` dòng 103.
