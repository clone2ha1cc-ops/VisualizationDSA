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

### 🚨 Lỗi 105: __loopCounter Khai Báo Trùng Lặp Trong Web Worker (Phase 2)
*   **Mô tả:** Khi thực thi code đã tiêm vết bên trong Web Worker, lỗi runtime `Identifier '__loopCounter' has already been declared` xảy ra vì biến `__loopCounter` được khai báo hai lần: một lần bởi `ASTInstrumentationEngine` (prepend `let __loopCounter = 0;`) và một lần bởi `new Function('...', '__loopCounter', code)` (parameter binding).
*   **Mã Lỗi:** `ERR_WORKER_DUPLICATE_DECLARATION`
*   **Nguyên nhân gốc:** `buildWorkerScript()` truyền `__loopCounter` làm tham số thứ 4 của `new Function()`, đồng thời `compileAndInstrument()` đã prepend `let __loopCounter = 0;` vào đầu mã nguồn đã sinh. Khi cả hai tồn tại trong cùng scope, JavaScript ném lỗi khai báo trùng.
*   **Cách khắc phục:** Loại bỏ `__loopCounter` khỏi danh sách tham số `new Function()` trong `WorkerLifecycleCoordinator.ts`, vì biến đã được khai báo nội bộ bởi mã nguồn đã tiêm vết.

### 🚨 Lỗi 106: Hàm FunctionDeclaration Không Được Gọi Trong Web Worker (Phase 2)
*   **Mô tả:** Mã nguồn đã tiêm vết chỉ khai báo hàm `function bubbleSort(arr) { ... }` mà không bao giờ gọi nó. Khi `new Function('arr', 'traceCompare', 'traceAssign', code)` thực thi, thân hàm chỉ khai báo `bubbleSort` rồi kết thúc — không có lời gọi `bubbleSort(arr)`. Kết quả: chỉ 1 frame ACCESS (trạng thái cuối) mà không có COMPARE/SWAP trace nào.
*   **Mã Lỗi:** `ERR_AST_FUNCTION_NOT_INVOKED`
*   **Nguyên nhân gốc:** `compileAndInstrument()` chỉ tiêm tracing vào bên trong hàm mà không thêm lời gọi hàm cuối chương trình. Worker wraps code trong `new Function(...)` nên cần lời gọi tường minh.
*   **Cách khắc phục:** Thêm hàm `appendAutoInvoke()` vào `ASTInstrumentationEngine.ts`. Hàm này tìm `FunctionDeclaration` đầu tiên ở top-level AST body và append `functionName(arr);` vào cuối chương trình. File sửa: `ASTInstrumentationEngine.ts` dòng 60-78.

### 🚨 Lỗi 107: Lực Hút Lò Xo Hooke Tính Sai Hướng Cho Trọng Số Khác Nhau (Edge Weight Physics)
*   **Mô tả:** Lực hút của các cạnh có trọng số nặng lại yếu hơn các cạnh có trọng số nhẹ, dẫn đến việc dàn xếp layout đồ thị bị sai logic vật lý (đáng lẽ cạnh nặng phải kéo 2 node sát nhau hơn).
*   **Mã Lỗi:** `ERR_FD_LAYOUT_WEIGHTED_ATTRACTION`
*   **Nguyên nhân gốc:** `ForceDirectedLayout.ts` nhân hệ số ideal length (chiều dài lý tưởng) của lò xo với `weightFactor`, làm tăng `idealLength` cho cạnh nặng. Điều này làm giảm `displacement = distance - idealLength`, từ đó làm giảm lực hút Hooke `force = kAttraction * displacement`.
*   **Cách khắc phục:** Không tăng `idealLength` của cạnh nặng, mà nhân trực tiếp `weightFactor` vào lực hút Hooke: `const force = this.kAttraction * displacement * weightFactor;`. File sửa: `ForceDirectedLayout.ts` dòng 88-94.



### 🚨 Lỗi 108: Thư Viện Asp.Versioning.Mvc Phiên Bản 10.0.0 Không Tương Thích Với .NET 9
*   **Mô tả:** Lỗi restore project và lỗi biên dịch do mismatch target framework khi cài đặt gói NuGet `Asp.Versioning.Mvc` và `Asp.Versioning.Mvc.ApiExplorer`.
*   **Mã Lỗi:** `ERR_NET_VERSION_MISMATCH`
*   **Nguyên nhân gốc:** NuGet tự động tải phiên bản v10.0.0 mới nhất yêu cầu .NET 10, trong khi dự án hiện tại target .NET 9.0.
*   **Cách khắc phục:** Hạ cấp và định nghĩa rõ ràng phiên bản `8.1.0` (tương thích hoàn hảo với .NET 9) trong [WebApi.csproj](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/WebApi.csproj).

### 🚨 Lỗi 109: Cảnh Báo Obsolete Của UseXminAsConcurrencyToken() Trong EF Core
*   **Mô tả:** Cảnh báo biên dịch CS0618 khi sử dụng phương thức cũ `UseXminAsConcurrencyToken()` cho Optimistic Concurrency Control.
*   **Mã Lỗi:** `ERR_EF_OBSOLETE_CONCURRENCY_TOKEN`
*   **Nguyên nhân gốc:** EF Core và Npgsql đã thay đổi cách đăng ký concurrency token hệ thống (xmin) và đánh dấu phương thức cũ là lỗi thời.
*   **Cách khắc phục:** Chuyển đổi cấu hình thủ công qua shadow property `xmin` dạng `.IsConcurrencyToken()` trong [ApplicationDbContext.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/Infrastructure/Data/ApplicationDbContext.cs).

### 🚨 Lỗi 110: Lỗi Phân Giải Host=localhost Trên Windows (Npgsql Connection Fail)
*   **Mô tả:** Khi khởi động WebApi backend, EF Core ném ngoại lệ `SocketException: No such host is known` tại hàm `databaseFacade.Migrate()`.
*   **Mã Lỗi:** `ERR_DB_LOCALHOST_RESOLVE_FAIL`
*   **Nguyên nhân gốc:** Trình điều khiển cơ sở dữ liệu Npgsql không phân giải được hostname `localhost` sang địa chỉ IP loopback trên một số cấu hình Windows (đặc biệt khi IPv6 được ưu tiên hoặc DNS local bị ngắt).
*   **Cách khắc phục:** Thay thế `Host=localhost` thành địa chỉ IP tĩnh rõ ràng `Host=127.0.0.1` trong [appsettings.json](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/appsettings.json) và [appsettings.Development.json](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/appsettings.Development.json). Lực chọn này bỏ qua việc phân giải DNS và kết nối trực tiếp đến IPv4 loopback của PostgreSQL local.
