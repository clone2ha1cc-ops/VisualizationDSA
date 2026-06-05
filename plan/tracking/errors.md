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
*   **Nguyên nhân gốc:** `ForceDirectedLayout.ts` nhân hệ số ideal length (chiều dài lý tưởng) của lò xo với `weightFactor`, làm tăng `idealLength` cho cạnh nặng. Điều này làm giảm `displacement = distance - idealLength`, từ đó làm giảm lực hút Hooke `force = kAttraction * displacement * weightFactor;`. File sửa: `ForceDirectedLayout.ts` dòng 88-94.

### 🚨 Lỗi 115: Lỗi Import Mismatch Các Kiểu Dữ Liệu Gamification (TS2614 Member Export Mismatch)
*   **Mô tả:** Biên dịch lỗi `error TS2614: Module '"./XPEngine"' has no exported member 'UserProgress'` trong `src/features/gamification/index.ts`.
*   **Mã Lỗi:** `ERR_TS2614_XPENDING_EXPORT_MISMATCH`
*   **Nguyên nhân gốc:** `index.ts` xuất khẩu các types `UserProgress`, `Badge`, `LevelConfig`, `XPEvent`, `EmbedConfig` trực tiếp từ `./XPEngine` sau khi các types này đã được chuyển dịch hoàn toàn sang `./xpConfig` nhằm phục vụ việc phân rã/tối giản dòng mã nguồn cho `XPEngine.ts` để đạt giới hạn dưới 100 dòng.
*   **Cách khắc phục:** Cập nhật `index.ts` để xuất khẩu các interfaces đó trực tiếp từ `./xpConfig` thay vì `./XPEngine`.

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

### 🚨 Lỗi 111: Lỗi Thiếu Hàm getStoredToken Khi Chạy Kiểm Thử Cây Lộ Trình (TypeError: getStoredToken is not a function)
*   **Mô tả:** Khi chạy unit test cho store `learning-path` (`useLearningPathStore.spec.ts`), Vitest ném lỗi runtime `TypeError: getStoredToken is not a function` tại computed property `isOnlineMode = computed(() => !!getStoredToken())`.
*   **Mã Lỗi:** `ERR_API_CLIENT_COMPATIBILITY_MISSING_EXPORTS`
*   **Nguyên nhân gốc:** `apiClient.ts` ở nhánh fork export các helper functions như `getStoredToken` và `getStoredRefreshToken` dùng để kiểm tra trực tiếp trạng thái token ngoại tuyến. Khi trộn thủ công và tái cấu trúc bảo mật API Client kết hợp với Pinia store secure token memory-only, chúng ta bỏ sót không khai báo (export) các helper này khiến store import lỗi.
*   **Cách khắc phục:** Cập nhật [apiClient.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/services/apiClient.ts) để khai báo đầy đủ các helper functions. Đồng thời tối ưu hóa `getStoredToken` bằng cách kiểm tra ngữ cảnh Pinia hoạt động `getActivePinia()`, cho phép đọc Access Token từ `useAuthStore` động an toàn mà không gây ra lỗi khởi tạo Pinia ngoài ngữ cảnh trong môi trường kiểm thử unit tests.

### 🚨 Lỗi 112: Lỗi Import Sai Đường Dẫn CustomInputParser Và ForceDirectedLayout (Phase 2 Import Mismatch)
*   **Mô tả:** Khi truy cập vào tab Sorting, hệ thống gặp lỗi runtime và không thể load route: `TypeError: Failed to fetch dynamically imported module: http://localhost:5173/src/views/SortingView.vue`.
*   **Mã Lỗi:** `ERR_IMPORT_RELATIVE_MISMATCH`
*   **Nguyên nhân gốc:** Sau khi trộn code thủ công từ nhánh fork, các file composables `useInputValidation.ts` và `useGraphPlayground.ts` vẫn tham chiếu tới `../CustomInputParser` và `../ForceDirectedLayout` thay vì đi vào thư mục con `../engine/CustomInputParser` và `../engine/ForceDirectedLayout` do sự thay đổi về cấu trúc thư mục FSD (Feature-Sliced Design) trong dự án chính.
*   **Cách khắc phục:** Sửa đổi đường dẫn import trong `useInputValidation.ts` thành `../engine/CustomInputParser`, và trong `useGraphPlayground.ts` thành `../engine/CustomInputParser` và `../engine/ForceDirectedLayout`.

### 🚨 Lỗi 113: Trùng Khớp Kiểu showToast Trình Báo Lỗi Cho Component Vue (TS2322 Toast Type Mismatch)
*   **Mô tả:** Biên dịch lỗi `error TS2322: Type 'string' is not assignable to type '"error" | "success" | "info"'` trong `InteractivePlayground.vue`.
*   **Mã Lỗi:** `ERR_TS2322_TOAST_TYPE_MISMATCH`
*   **Nguyên nhân gốc:** Biến `type` trong `showToast` gán giá trị mặc định là `'info'` không ép kiểu cụ thể nên TypeScript tự nhận diện kiểu dữ liệu rộng hơn là `string`, gây xung đột với Union type nghiêm ngặt của component.
*   **Cách khắc phục:** Định nghĩa rõ ràng kiểu dữ liệu cho tham số đầu vào trong chữ ký hàm: `type: 'info' | 'error' | 'success' = 'info'`.

### 🚨 Lỗi 114: Thuộc Tính Tham Số Constructor Bị Cấm (TS1294 Parameter Property Restriction)
*   **Mô tả:** Biên dịch lỗi `error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled` trong `UnifiedPlaybackCoordinator.ts`.
*   **Mã Lỗi:** `ERR_TS1294_ERASABLE_SYNTAX_ONLY`
*   **Nguyên nhân gốc:** Trình cấu dịch dự án bật tùy chọn `erasableSyntaxOnly` (chỉ cho phép các cú pháp TS dễ dàng xóa bỏ khi chuyển sang JS sạch). Constructor parameter properties (`constructor(private leftStore...)`) phát sinh mã runtime bổ sung ở JS nên bị chặn.
*   **Cách khắc phục:** Đổi sang khai báo các trường dữ liệu riêng biệt và gán giá trị tường minh trong thân hàm constructor.

### 🚨 Lỗi 116: Lỗi Test Timeout Do Fetch Không Được Mock Trong useInputStore Test
*   **Mô tả:** Chạy kiểm thử cho `useInputStore.spec.ts` bị timeout sau 5000ms ở test case "uses dummy fallback when API is unreachable".
*   **Mã Lỗi:** `ERR_TEST_FETCH_TIMEOUT`
*   **Nguyên nhân gốc:** Hàm `submitCustomInput` trong store `useInputStore.ts` gọi fetch thực tế đến URL `API_BASE` when không được mock trong môi trường kiểm thử. Không có máy chủ local phản hồi trong test runner khiến fetch bị treo và test case bị timeout quá giới hạn 5000ms của Vitest.
*   **Cách khắc phục:** Import `vi` từ `vitest` và gọi `vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'))` trong test case tương ứng để giả lập lỗi kết nối mạng ngay lập tức, đồng thời thêm `vi.restoreAllMocks()` trong `beforeEach` để tránh ảnh hưởng đến các test case khác.

### 🚨 Lỗi 117: Thiếu VCR Control Panel Trên Giao Diện Sorting (Sorting Animation Stuck)
*   **Mô tả:** Giao diện Sorting khi mở lên chỉ hiển thị cột mảng tĩnh, không thể phát animation, không chạy phím tắt Space/Arrow, cũng không phản hồi khi bấm nút đổi thuật toán (đồ thị không chạy).
*   **Mã Lỗi:** `ERR_SORTING_ANIMATION_STUCK`
*   **Nguyên nhân gốc:** Giao diện `SortingView.vue` chỉ mount component hiển thị `ArrayBarVisualizer.vue` mà bỏ sót component điều khiển `VcrControlPanel.vue` của module `vcr-player`. Do đó, trạng thái hoạt cảnh trong `useVcrStore.ts` luôn ở frame 0 (`isPlaying = false`) và không có nút bấm nào để kích hoạt luồng phát hoặc đăng ký trình lắng nghe bàn phím.
*   **Cách khắc phục:** Import và mount `VcrControlPanel` từ `@/features/vcr-player` trực tiếp vào bên dưới `ArrayBarVisualizer` trong `SortingView.vue` với layout `flex-col` và căn chỉnh lề hợp lý.

### 🚨 Lỗi 118: Cột Giao Diện Sorting Cũ Quá Hẹp Và Trống Trải (Sorting Widescreen Layout Waste)
*   **Mô tả:** Giao diện Sorting bị giới hạn bởi `max-w-3xl`, để lại khoảng trống lớn ở hai bên trên màn hình rộng của PC/Tablet, đồng thời cách bố trí xếp thẳng đứng không tối ưu không gian chiều ngang.
*   **Mã Lỗi:** `ERR_SORTING_LAYOUT_COMPACT_WASTE`
*   **Nguyên nhân gốc:** Class `max-w-3xl mx-auto flex-col` trong `SortingView.vue` là tàn dư của thiết kế di động ban đầu, chưa được nâng cấp thành layout đa cột responsive.
*   **Cách khắc phục:** Chuyển đổi `SortingView.vue` sang layout hai cột responsive sử dụng `flex-col lg:flex-row gap-4 p-4 max-w-[1600px] mx-auto w-full h-full`, phân bổ tỉ lệ 65% độ rộng cho Canvas hiển thị (`ArrayBarVisualizer`) và 35% độ rộng cho bảng điều khiển (`VcrControlPanel`), giúp đồng bộ thiết kế trực quan giống các màn hình IDE khác.

### 🚨 Lỗi 119: Cột Biểu Diễn Bubble Sort Quá Nhỏ Do Sập Chiều Cao (Bubble Sort Bar Height Collapse)
*   **Mô tả:** Các cột biểu diễn trong Bubble Sort Visualizer bị co lại thành các viên thuốc dẹt sát đáy thay vì chiếm toàn bộ chiều cao của container.
*   **Mã Lỗi:** `ERR_BUBBLE_SORT_BAR_COLLAPSE`
*   **Nguyên nhân gốc:** Container `div` của từng phần tử mảng (được tạo bởi `v-for` trong `<transition-group>`) không khai báo thuộc tính chiều cao (`h-full`). Do đó, chiều cao của container này là `auto` (chỉ bao gồm chiều cao chữ), dẫn đến việc chiều cao phần trăm của thanh cột con (`height: X%`) không thể phân giải được và bị sập về `minHeight: 32px`.
*   **Cách khắc phục:** Thêm class `h-full` vào container `div` của `v-for` trong `BubbleSortVisualizer.vue` để thiết lập chiều cao 100% theo `<transition-group>`, giúp phần trăm chiều cao của thanh cột con được hiển thị chính xác dựa trên giá trị của phần tử.

### 🚨 Lỗi 120: VcrControlPanel Bị Kéo Giãn Dài Tạo Khoảng Trắng Lớn Bên Phải (VcrControlPanel Empty Space Stretch)
*   **Mô tả:** Trong giao diện Sorting View, VcrControlPanel bị kéo giãn dài xuống sát đáy màn hình tạo ra một vùng đen trống trải lớn bên dưới các nút điều khiển.
*   **Mã Lỗi:** `ERR_VCR_CONTROL_PANEL_STRETCH`
*   **Nguyên nhân gốc:** Thùng chứa cha `<section>` sử dụng bố cục flex-row nhưng không định nghĩa thuộc tính `align-items`, dẫn đến mặc định là `items-stretch`. Khi đó, `VcrControlPanel` (mặc dù có class `h-fit`) bị ép buộc kéo giãn chiều cao theo `ArrayBarVisualizer` vốn chiếm toàn bộ chiều cao màn hình.
*   **Cách khắc phục:** Thêm class `lg:self-start` vào `VcrControlPanel` trong `SortingView.vue`. Điều này cấu hình cho panel tự căn chỉnh theo vị trí bắt đầu (top) trên màn hình lớn thay vì co giãn, giữ nguyên chiều cao tự nhiên của panel và loại bỏ hoàn toàn khoảng trắng dư thừa.

### 🚨 Lỗi 121: Phông Chữ Trực Quan Hóa Mảng Không Đồng Bộ Với Hệ Thống (Outfit Font Mismatch)
*   **Mô tả:** Chữ số trên các cột mảng trực quan và tên các con trỏ vòng lặp hiển thị sai phông chữ (sử dụng phông 'Outfit') so với phông chữ 'Inter' chuẩn hệ thống.
*   **Mã Lỗi:** `ERR_SORTING_FONT_MISMATCH`
*   **Nguyên nhân gốc:** Hàm vẽ canvas `renderArrayBar` và `renderLoopPointer` thiết lập font vẽ cứng có chứa phông chữ '"Outfit"', trong khi hệ thống không nạp phông chữ này làm phông chữ chính.
*   **Cách khắc phục:** Thay thế chuỗi định nghĩa font `'bold 18px "Outfit", "Inter", sans-serif'` và `'bold 11px "Outfit", "Inter", sans-serif'` thành phông chữ chuẩn hệ thống `'Inter', sans-serif` trong `renderArrayBar.ts` và `renderLoopPointer.ts`.

### 🚨 Lỗi 122: Thanh Cột Trực Quan Hóa Mảng Quá Hẹp Trên Màn Hình Rộng (Array Bar Width Narrow Waste)
*   **Mô tả:** Các thanh cột biểu diễn giá trị phần tử mảng và các nút trong các giải thuật Heap/Radix/Merge/Quick Sort có kích thước quá nhỏ, tạo khoảng trống lớn vô ích trên màn hình rộng của máy tính.
*   **Mã Lỗi:** `ERR_SORTING_BAR_NARROW_WASTE`
*   **Nguyên nhân gốc:** Các biến chiều rộng `barWidth`, `itemSize` và khoảng cách `itemGap` được tính toán với giá trị cứng quá nhỏ (ví dụ `48px`, `52px`) vốn tối ưu cho màn hình di động nhưng quá hẹp trên màn hình máy tính lớn.
*   **Cách khắc phục:** Tăng kích thước rộng và chiều cao động của các cột biểu diễn trong 5 visualizers (`BubbleSortVisualizer`, `QuickSortVisualizer`, `MergeSortVisualizer`, `HeapSortVisualizer`, `RadixSortVisualizer`) (ví dụ từ `52px` lên `88px`, từ `48px` lên `80px` cho mảng nhỏ) để lấp đầy không gian hiển thị và tăng tính thẩm mỹ trực quan.

### 🚨 Lỗi 123: Khoảng Trống Lớn Trong Tab Quick Sort (Quick Sort Tab Empty Space Waste)
*   **Mô tả:** Tab Quick Sort chứa quá nhiều khoảng trống màu đen không sử dụng ở phần dưới của Canvas Viewport trên các màn hình máy tính lớn.
*   **Mã Lỗi:** `ERR_QUICK_SORT_EMPTY_WASTE`
*   **Nguyên nhân gốc:** Bố cục ban đầu của Quick Sort chỉ hiển thị hàng mảng chính và hàng các phân đoạn con xếp theo chiều ngang, có tổng chiều cao thấp (~200px) trong khi khung chứa Viewport có chiều cao co giãn lớn (~500px+), tạo ra khoảng trống thừa thãi lớn.
*   **Cách khắc phục:**
    1. Thiết kế lại phần dưới của `QuickSortVisualizer.vue` thành một Dashboard chia làm 2 cột: **Lomuto Partition Inspector** và **Partition Stack**.
    2. Áp dụng cơ chế Flexbox `flex-1 min-h-0` cho thùng chứa Dashboard và các danh sách bên trong (`LomutoInspector` và `PartitionStack`) để chúng tự động co giãn kéo dài lấp đầy 100% chiều cao thừa còn lại của viewport.
    3. Tách nhỏ `QuickSortVisualizer.vue` thành 2 sub-components con `LomutoInspector.vue` và `PartitionStack.vue` để tối ưu hóa cấu trúc code, tăng khả năng bảo trì.

### 🚨 Lỗi 124: Thiếu Minh Họa Chia Để Trị Trực Quan Trong Merge Sort (Merge Sort UX Recursion Deficiency)
*   **Mô tả:** Trực quan hóa Merge Sort trước đây chỉ hiển thị mảng chính và một danh sách stack phẳng mờ nhạt, khiến người dùng không thể thấy cấu trúc cây đệ quy chia đôi mảng hoặc sự khác biệt rõ rệt giữa hai pha chia (Split) và gộp (Merge).
*   **Mã Lỗi:** `ERR_MERGE_SORT_UX_DEFICIENCY`
*   **Nguyên nhân gốc:** Thuật toán đệ quy Merge Sort có bản chất là phân rã mảng thành cây nhị phân (Recursion Tree), nhưng thiết kế cũ chỉ hiển thị các phân đoạn theo dạng stack dọc phẳng, không căn chỉnh vị trí ngang (`left`, `width`) tương ứng với vị trí thực tế của mảng cha, gây mất phương hướng dòng chảy thuật toán.
*   **Cách khắc phục:**
    1. Thiết kế lại `MergeSortVisualizer.vue` để hiển thị cây đệ quy hoàn chỉnh (Recursion Tree). Các node con ở cấp độ sâu hơn được căn chỉnh vị trí ngang chính xác theo tỷ lệ phần trăm (`left`, `width`) của phân đoạn cha mà chúng được chia ra.
    2. Tạo sub-component mới `MergeInspector.vue` gắn ở góc phải/dưới để theo dõi chi tiết pha so sánh từng phần tử `L[i]` và `R[j]` và quá trình ghi đè mảng chính tại con trỏ `k`.
    3. Thêm banner kể chuyện (storytelling subtitle) chỉ rõ trạng thái đệ quy (Split hay Merge), đồng thời đánh dấu nhãn mức độ đệ quy (Level 0, 1, 2...) ở cạnh trái để tăng tính trực quan.

### 🚨 Lỗi 125: Hoạt Ảnh Trộn Merge Sort Bị Khựng Và Bỏ Sót Tầng Cơ Sở (Merge Sort Stuttering & Leaf Base Case Skip)
*   **Mô tả:** 
    1. Hoạt ảnh chuyển đổi giá trị (swap/overwrite) trong cây đệ quy của Merge Sort bị khựng, xé hình và nhảy loạn xạ khi ghi đè phần tử.
    2. Tiến trình đệ quy không thể hiện việc đi xuống tầng cơ sở (tầng chứa các mảng con 1 phần tử - Tầng 3), mà nhảy trực tiếp từ việc chia đoạn ở tầng 2 sang trộn các phần tử.
*   **Mã Lỗi:** `ERR_MERGE_SORT_STUTTER_AND_SKIP`
*   **Nguyên nhân gốc:**
    1. Trong component `MergeSortVisualizer.vue`, thẻ `<transition-group>` sử dụng khóa động `:key="getItemAt(sub.start + idx - 1)?.id"`. Khi giá trị mảng bị ghi đè, `enrichFramesWithIds` thay đổi ID của phần tử theo giá trị mới, khiến Vue hiểu sai thứ tự phần tử bị hủy/tạo mới và sinh hoạt ảnh dịch chuyển lỗi.
    2. Trong `mergeSort.ts`, điều kiện dừng đệ quy `if (left >= right) return` lập tức trả về mà không phát (`emit`) bất kỳ frame trạng thái nào cho các mảng con kích thước 1, làm biến mất bước trực quan tại tầng cơ sở.
*   **Cách khắc phục:**
    1. Thay thế khóa `:key` của các phần tử trong cây thành chỉ số mảng ổn định `sub.start + idx - 1`. Điều này giúp Vue tái sử dụng DOM node cũ khi giá trị thay đổi, đồng thời áp dụng hiệu ứng chuyển đổi mượt mà.
    2. Thêm lớp hoạt ảnh tùy biến `@keyframes pop-flash` và lớp CSS `.animate-pop-flash` để tạo hiệu ứng phình to (`scale(1.12)`) và phát sáng khi ghi đè.
    3. Cập nhật hàm `mergeSort` trong `mergeSort.ts` phát một frame trạng thái khi đạt `left >= right` để làm nổi bật (active) mảng con đơn tử ở tầng dưới cùng.
    4. Cải thiện lớp phủ subarray (`getSubarrayClass` và `getItemClass`) để highlight nổi bật màu hổ phách (Amber) cho các phần tử so sánh thuộc mảng con đang trộn (`isChildOfActive`).

### 🚨 Lỗi 126: Các Tầng Của Cây Đệ Quy Merge Sort Bị Co Rút Và Đè Lên Nhau (Merge Sort Recursion Tree Height Collapse)
*   **Mô tả:** Các tầng của cây đệ quy trong `MergeSortVisualizer.vue` (Tầng 0, Tầng 1, Tầng 2, Tầng 3) bị co rút chiều cao đột ngột và đè lên nhau, làm các hộp phần tử mảng và đường kẻ phân chia cắt chéo lung tung.
*   **Mã Lỗi:** `ERR_MERGE_SORT_TREE_COLLAPSE`
*   **Nguyên nhân gốc:** Mỗi tầng mảng được bọc trong một container `div` có chiều cao cố định `h-[96px]`. Tuy nhiên, vì container cha có thuộc tính `flex flex-col` và không gian dọc hạn chế, các phần tử con mặc định có `flex-shrink: 1` sẽ tự động bị co rút kích thước xuống dưới 96px để ép vừa khung hiển thị, gây ra tràn nội dung và đè chồng lên nhau.
*   **Cách khắc phục:** Thêm class `shrink-0` (thiết lập `flex-shrink: 0`) vào container của từng tầng đệ quy trong `MergeSortVisualizer.vue` để đảm bảo chúng luôn duy trì chiều cao thiết kế `96px` và kích hoạt thanh cuộn dọc `overflow-y-auto` của container cha khi cần thiết.

### 🚨 Lỗi 127: Các Tầng Của Cây Đệ Quy Merge Sort Vẫn Bị Đè Lên Nhau Do Container Tree View Bị Flex Co Rút (Merge Sort Recursion Tree Parent Flex Collapse)
*   **Mô tả:** Mặc dù đã thêm `shrink-0` vào từng tầng, các tầng của cây đệ quy trong `MergeSortVisualizer.vue` vẫn tiếp tục bị đè lên nhau theo chiều dọc trên trình duyệt, không hiển thị thanh cuộn dọc riêng biệt.
*   **Mã Lỗi:** `ERR_MERGE_SORT_TREE_FLEX_COLLAPSE`
*   **Nguyên nhân gốc:** Container cha bọc cây đệ quy (`Tree View`) sử dụng class `flex-[60] min-h-0` và không có `shrink-0`. Khi chiều cao toàn cục của `MergeSortVisualizer` bị giới hạn (do Canvas container bên ngoài), và component `MergeInspector` ở dưới có `shrink-0` chiếm hết không gian dọc (khoảng 350px+), flex engine buộc phải co rút chiều cao của `Tree View` về `0px`. Vì các tầng con có chiều cao cố định `96px` và không có `overflow-hidden` ở tầng, chúng tràn ra ngoài container 0px đó và hiển thị chồng chéo lên nhau tại cùng một tọa độ hiển thị.
*   **Cách khắc phục:** Loại bỏ phân phối tỷ lệ `flex-[60] min-h-0` của `Tree View` và `flex-[40] min-h-0` của `Merge Inspector`, đồng thời gỡ bỏ `overflow-y-auto` trên `Tree View`. Thiết lập class `shrink-0` cho cả hai container này để chúng hiển thị theo chiều cao tự nhiên. Nhờ vậy, container gốc của `MergeSortVisualizer` (đã có class `overflow-y-auto`) sẽ tự động quản lý thanh cuộn dọc duy nhất mượt mà cho toàn bộ giao diện, tránh hiện tượng co rút và chồng lấn.










### 🚨 Lỗi 128: Lệch Mũi Tên Chỉ Hộp Và Giật Hoạt Ảnh Thu Hoạch Radix Sort (Radix Sort Arrow Misalignment & Collect Animation Stutter)
*   **Mô tả:** Mũi tên SVG bị lệch nhẹ so với tâm ô/bucket do chênh lệch CSS grid gap/flexbox padding. Hoạt ảnh thu hoạch từ bucket về mảng bị giật ngang và xé hình.
*   **Mã Lỗi:** `ERR_RADIX_ARROW_MISALIGN_STUTTER`
*   **Nguyên nhân gốc:**
    1. Việc tính tọa độ theo công thức tỷ lệ `(idx + 0.5) / n` bỏ qua kích thước của các khoảng trống gap khác nhau trong Grid và Flexbox.
    2. Việc trượt các phần tử mảng chưa thu hoạch ở cuối mảng tạo ra hiệu ứng chuyển động ngang không mong muốn của `transition-group`.
*   **Cách khắc phục:**
    1. Đo tọa độ pixel thực tế của các ô đang active bằng `getBoundingClientRect()` rồi map ngược lại scale `0..1000`.
    2. Che mặt nạ các phần tử chưa thu hoạch dưới dạng các ô trống nét đứt (placeholder) để cố định cột và chỉ tiết lộ giá trị dần dần khi thu hồi từ bucket.

### 🚨 Lỗi 129: Lỗi Hardcode Bubble Sort Cho Counting/Bucket Sort (Sorting detail HUD title bug)
*   **Mô tả:** Khi chọn giải thuật Counting Sort hoặc Bucket Sort trong tab Sandbox, giao diện HUD Info bên phải luôn hiển thị cứng tên "Sắp xếp nổi bọt (Bubble Sort)" thay vì hiển thị tên và mô tả đúng giải thuật.
*   **Mã Lỗi:** `ERR_HUD_HARDCODED_ALGORITHM_METADATA`
*   **Nguyên nhân gốc:** `SortingDetailPanel.vue` chỉ định nghĩa metadata độ phức tạp cho 5 thuật toán cơ bản (`bubble`, `quick`, `merge`, `heap`, `radix`). Khi gặp giá trị `counting` hoặc `bucket`, hàm fallback `algoMetadata[algo] || algoMetadata.bubble` tự động trả về metadata của Bubble Sort.
*   **Cách khắc phục:** Cập nhật `algoMetadata` trong `SortingDetailPanel.vue` bổ sung đầy đủ metadata học thuật chi tiết cho cả `counting` và `bucket`, đồng thời xây dựng các live variable template hiển thị riêng biệt thông tin chi tiết từng pha cho 2 thuật toán này.


### 🚨 Lỗi 130: Lỗi Mismatch Catalog Khi Chạy So Sánh Thuật Toán (Compare Algorithms Store Test Failure)
*   **Mô tả:** Bộ kiểm thử `useCompareAlgorithmsStore.spec.ts` bị lỗi fail 6 test cases do không thể phân giải tên thuật toán `bubble-sort` / `selection-sort` và không sinh được frame nào (chỉ có 1 frame fallback).
*   **Mã Lỗi:** `ERR_COMPARE_STORE_CATALOG_MISMATCH`
*   **Nguyên nhân gốc:** `useCompareAlgorithmsStore.ts` sử dụng `ALGORITHM_CATALOG` của `dsa-modules` vốn chỉ giới hạn 10 thuật toán searching/tree/stack-queue để tuân thủ kiểm thử nghiêm ngặt. Khi chạy so sánh thuật toán sắp xếp (sorting), hệ thống không phân giải được tên và độ phức tạp, đồng thời `dummyGenerators.ts` không đăng ký các máy phát hoạt ảnh sorting.
*   **Cách khắc phục:** 
    1. Trả lại `ALGORITHM_CATALOG` về đúng 10 phần tử gốc để bảo toàn 100% kết quả cho `dsa-modules` test suite.
    2. Đăng ký đầy đủ 5 thuật toán sắp xếp (`bubble-sort`, `selection-sort`, `insertion-sort`, `quick-sort`, `merge-sort`) vào `GENERATORS` của [dummyGenerators.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/dsa-modules/services/dummyGenerators.ts).
    3. Định nghĩa một bảng tra cứu cục bộ `SORTING_ALGS` ngay trong [useCompareAlgorithmsStore.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/compare-algorithms/store/useCompareAlgorithmsStore.ts) để phân giải thông tin sorting một cách độc lập và an sau.

### 🚨 Lỗi 131: Lệch Bố Cục Và Render Mảng Sai Trên Giao Diện Graph Sandbox (Graph Sandbox Array Render Bug)
*   **Mô tả:** Trong giao diện Graph Sandbox, khung Viewport bên trái hiển thị thanh biểu đồ mảng (Array Bar) của thuật toán sắp xếp thay vì hiển thị đồ thị tương tác, đồng thời bảng nhập dữ liệu tùy biến ở bên phải hiển thị dư thừa tab vẽ đồ thị nhỏ.
*   **Mã Lỗi:** `ERR_GRAPH_SANDBOX_ARRAY_RENDER_MISMATCH`
*   **Nguyên nhân gốc:** `GraphView.vue` trước đó sử dụng component `AlgorithmCanvas` (vốn được thiết kế cứng để vẽ các cột mảng sắp xếp dựa trên `vcrStore`) và `CustomInputPanel` (có chứa tab vẽ đồ thị mini `GraphPlayground`). Điều này tạo ra sự lệch pha nghiêm trọng giữa viewport chính và bảng điều khiển dữ liệu.
*   **Cách khắc phục:**
    1. Thay thế `AlgorithmCanvas` trên viewport trái bằng component đồ thị tương tác cao cấp `InteractivePlayground` lấy từ `features/interactive-playground`.
    2. Loại bỏ hoàn toàn tab switcher và canvas vẽ mini trong `CustomInputPanel.vue` để chỉ giữ lại giao diện nạp văn bản `TextDataInput` tinh gọn ở cột bên phải.
    3. Xây dựng cơ chế đồng bộ hóa 2 chiều (Bidirectional Watchers) trong `CustomInputPanel.vue` giữa chuỗi adjacency list (`graphInputText`) và Pinia store `usePlaygroundStore` (quản lý tọa độ đỉnh và liên kết lò xo vật lý), giúp việc vẽ trên canvas trái lập tức cập nhật văn bản ở cột phải và ngược lại.
    4. Gỡ bỏ Sandbox độc lập khỏi sidebar trong [appTabs.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/appTabs.ts) và [routes.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/router/routes.ts) để hợp nhất hoàn toàn vào trang Graph.

### 🚨 Lỗi 132: Gói Tin Mạng Lướt Qua Màn Hình Trong 2 Frame (~32ms) — System Design Viz (BUG-SD-4)
*   **Mô tả:** Trong `SystemDesignWorkspace.vue`, vòng lặp mô phỏng rAF tính `delta = time - lastTime` trả về giá trị tính bằng mili-giây (~16ms/frame). Giá trị này được truyền thẳng vào `store.tickEngine(delta)` rồi nhân với `PACKET_SPEED = 0.05`, khiến `progress += 16 * 0.05 = 0.8` mỗi frame. Kết quả: gói tin đạt `progress >= 1.0` sau chỉ 2 frame (~32ms), di chuyển quá nhanh để mắt người quan sát kịp nhìn thấy.
*   **Mã Lỗi:** `ERR_SYSDESIGN_DELTA_UNIT_MISMATCH`
*   **Nguyên nhân gốc:** `performance.now()` trả về mili-giây nhưng công thức `p.progress += deltaTime * PACKET_SPEED` giả định `deltaTime` tính bằng giây.
*   **Cách khắc phục:** Chuẩn hóa `deltaTime` sang giây bằng cách chia cho 1000 trước khi truyền vào engine: `const delta = (time - lastTime) / 1000;`. File sửa: `SystemDesignWorkspace.vue` dòng 25.

### 🚨 Lỗi 133: Bước INSTANTIATE Trong Kịch Bản OOP Xóa Sạch Heap Mỗi Lần Tạo Đối Tượng (BUG-OOP-3)
*   **Mô tả:** Trong `useOOPVisualizerStore.ts`, handler cho `step.actionName === 'INSTANTIATE'` chứa lệnh `heapObjects.value = []` xóa toàn bộ Heap trước khi tạo đối tượng mới. Điều này khiến mọi kịch bản đa đối tượng bị hỏng — khi bước INSTANTIATE thứ hai được thực thi, đối tượng đầu tiên bị xóa mất.
*   **Mã Lỗi:** `ERR_OOP_INSTANTIATE_HEAP_WIPE`
*   **Nguyên nhân gốc:** Logic scenario step handler gộp chung việc reset heap vào mỗi bước INSTANTIATE thay vì chỉ thực hiện ở bước RESET/CLONE_MEMBERS.
*   **Cách khắc phục:** Xóa dòng `heapObjects.value = [];` khỏi nhánh `INSTANTIATE`, chỉ giữ lại việc tạo đối tượng mới qua `instantiateNewObject()`. Heap chỉ được xóa ở các bước RESET và CLONE_MEMBERS. File sửa: `useOOPVisualizerStore.ts` dòng 374.

### 🚨 Lỗi 134: Động Cơ Khói Sự Cố Server Không Được Render — System Design Viz (BUG-SD-1)
*   **Mô tả:** `FailureSmokeEmitterEngine.ts` được triển khai đầy đủ nhưng không có Vue component nào render canvas cho nó. Store dispatch `CustomEvent('SERVER_FAILED_SMOKE_BURST')` đến `window` khi server fail, nhưng không có listener xử lý — hiệu ứng khói hoàn toàn chết.
*   **Mã Lỗi:** `ERR_SYSDESIGN_SMOKE_NOT_WIRED`
*   **Nguyên nhân gốc:** Thiếu component Vue overlay kết nối engine particle với canvas rendering. Ngoài ra, engine không có giới hạn số lượng particle → nguy cơ tràn bộ nhớ (MEM-SD-1).
*   **Cách khắc phục:** Tạo component `FailureSmokeOverlay.vue` với canvas overlay `pointer-events: none` trên `.architecture-canvas`. Component lắng nghe `SERVER_FAILED_SMOKE_BURST`, tạo instance `FailureSmokeEmitterEngine` cho mỗi node bị lỗi, render particle lên canvas chung. Áp dụng `MAX_PARTICLES = 200` cap để tránh tràn bộ nhớ. Mount vào `SystemDesignWorkspace.vue`. File tạo mới: `FailureSmokeOverlay.vue`. File sửa: `SystemDesignWorkspace.vue`.

### 🚨 Lỗi 135: Kiểu `any` Trong actionPayload Scenario OOP — OOP Viz (BUG-OOP-1)
*   **Mô tả:** `ScenarioStep.actionPayload` được khai báo là `any`, vi phạm quy tắc sắt "nói không với `any`". Trình biên dịch TypeScript không thể kiểm tra tính đúng đắn của các thuộc tính payload (`className`, `memberName`, `methodName`, v.v.) tại thời điểm biên dịch.
*   **Mã Lỗi:** `ERR_OOP_SCENARIO_ANY_TYPE`
*   **Nguyên nhân gốc:** `ScenarioStep` là interface đơn với `actionPayload?: any` thay vì discriminated union dựa trên `actionName`.
*   **Cách khắc phục:** Thay thế hoàn toàn bằng discriminated union type `ScenarioStep` với 7 variant (`ResetStep`, `InstantiateStep`, `CallMethodStep`, `ViolateAccessStep`, `ValidateSetterStep`, `CloneMembersStep`, `ShowAbstractErrorStep`). Mỗi variant có `actionPayload` được định kiểu chặt chẽ. Export thêm `ScenarioActionPayload` union type. File sửa: `oopScenarios.ts`.

### 🚨 Lỗi 136: requestCount Chỉ Tăng Không Giảm — System Design Viz (BUG-SD-3)
*   **Mô tả:** `requestCount` trên node đích được tăng (`++`) khi packet được gửi từ Load Balancer, nhưng không bao giờ giảm khi packet đến đích (`ARRIVED`) hoặc bị drop (`DROPPED`). Kết quả: counter tăng vô hạn, không phản ánh số request đang hoạt động thực tế.
*   **Mã Lỗi:** `ERR_SYSDESIGN_REQUESTCOUNT_NO_DECREMENT`
*   **Nguyên nhân gốc:** Thiếu logic decrement trong `updatePacketsProgress()` tại cả hai nhánh xử lý ARRIVED và DROPPED.
*   **Cách khắc phục:** Thêm `target.requestCount = Math.max(0, target.requestCount - 1)` tại cả hai nhánh: khi packet status chuyển sang `DROPPED` (server FAILED) và khi `progress >= 1.0` (ARRIVED). Dùng `Math.max(0, ...)` để tránh giá trị âm. File sửa: `SystemDesignEngine.ts`.

### 🚨 Lỗi 137: SVG stroke-dasharray Sai Cú Pháp — OOP Viz (BUG-SVG-1)
*   **Mô tả:** Thuộc tính `stroke-dasharray="4_4"` trong SVG connector giữa Shape và Circle sử dụng dấu gạch dưới (`_`) thay vì dấu cách (` `) — cú pháp không hợp lệ theo SVG spec. Trình duyệt bỏ qua giá trị này, đường kẻ hiển thị liền thay vì đứt đoạn.
*   **Mã Lỗi:** `ERR_OOP_SVG_DASHARRAY_SYNTAX`
*   **Nguyên nhân gốc:** Lỗi đánh máy trong template Vue.
*   **Cách khắc phục:** Đổi `stroke-dasharray="4_4"` thành `stroke-dasharray="4 4"`. File sửa: `OOPConceptsVisualizerWorkspace.vue` dòng 63.

### 🚨 Lỗi 138: requestCount Không Cập Nhật UI — System Design Viz (BUG-SD-REACTIVITY)
*   **Mô tả:** Trường `requestCount` trên thẻ `SystemNodeCard` (`"X req"`) không cập nhật trong giao diện Vue khi engine thay đổi giá trị. Engine mutate trực tiếp các raw JavaScript objects, bypass hoàn toàn hệ thống Proxy reactivity của Vue 3. Hàm `syncPackets()` chỉ đồng bộ mảng packets, không đồng bộ trạng thái nodes.
*   **Mã Lỗi:** `ERR_SYSDESIGN_NODE_REACTIVITY_GAP`
*   **Nguyên nhân gốc:** Engine lưu trữ raw object references qua `registerNode()`. Khi engine gọi `targetServer.requestCount++` hoặc `requestCount--`, nó mutate object gốc trực tiếp — Vue 3 Proxy chỉ phát hiện thay đổi khi setter được gọi qua Proxy, không phải qua raw object.
*   **Cách khắc phục:** Thêm hàm `syncNodes()` sử dụng `triggerRef(nodes)` từ Vue 3 để ép Vue re-render khi node data thay đổi. Gọi `syncNodes()` song song với `syncPackets()` tại tất cả các điểm mutation: `injectHttpRequest()`, `injectTrafficBurst()`, và `tickEngine()`. File sửa: `useSystemDesignStore.ts`.

### 🚀 Mục 139: Phase 3 — Full-Stack Integration (System Design Frontend ↔ Backend API)
*   **Mô tả:** Refactor `useSystemDesignStore.ts` để kết nối frontend với backend API thay vì dùng topology hardcode và simulation thuần client-side. Thêm chế độ VCR playback cho kịch bản backend.
*   **Mã Mục:** `FEAT_SYSDESIGN_FULLSTACK_INTEGRATION`
*   **Thay đổi:**
    - Tạo `systemDesignApi.ts`: service layer gọi `GET /topology`, `GET /scenarios`, `POST /execute`
    - Thêm `SystemDesignFrame` type map 1:1 với `SystemDesignFrameDto` (C#)
    - `initializeDemoTopology()` → async, fetch topology từ `GET /api/v1/concepts/system-design/topology` với fallback hardcoded
    - Thêm `loadScenario(scenarioId)` → `POST /execute` lấy mảng frames, áp dụng VCR playback
    - Thêm VCR controls: `nextFrame()`, `prevFrame()`, `resetFrames()`, `toggleAutoplay()`, `setPlaybackSpeed()`
    - `tickEngine()` bỏ qua engine ticks trong VCR mode — state driven hoàn toàn bởi frame data backend
    - `SystemDesignWorkspace.vue`: thêm Scenario Picker, VCR Playback Panel, Explanation Banner
    - Interactive sandbox mode vẫn hoạt động khi không ở VCR mode
*   **Files sửa:** `useSystemDesignStore.ts`, `SystemDesignWorkspace.vue`, `system-design-viz.types.ts`, `systemDesignApi.ts` (mới), `useSystemDesignStore.spec.ts`

### 140. Phase 3 OOP Full-Stack Integration — Backend API Frames with VCR Playback
*   **ID:** FEAT-OOP-PHASE3
*   **Mô tả:** Kết nối OOP Visualization frontend với backend API. Store `useOOPVisualizerStore.ts` giờ fetch frames từ `POST /api/v1/concepts/oop/execute` thay vì dùng kịch bản hardcoded.
*   **Kiến trúc:**
    - Dual-mode: API mode (backend frames) với fallback sang local scenarios khi backend không khả dụng
    - `oopApi.ts`: service layer mới cho OOP backend calls
    - `OOPFrame` + `HeapObjectSnapshot` types tương ứng C# `OOPFrameDto`
    - `loadScenario()` async — try API first, fallback local
    - `applyApiFrame()` áp dụng state snapshot backend → reactive refs (convert JSON objects → Maps)
    - `snapshotToInstance()` chuyển đổi `Record<string, unknown>` → `Map<string, unknown>` cho fieldsData/vTable
    - `totalSteps`, `currentExplanation`, `currentActionName` computed properties phục vụ cả 2 mode
    - `OOPConceptsVisualizerWorkspace.vue`: thêm action name badge, API loading/error indicators
    - Tests: mock oopApi, async loadScenario/setPillar
*   **Files sửa:** `useOOPVisualizerStore.ts`, `OOPConceptsVisualizerWorkspace.vue`, `oop-visualization.types.ts`, `oopApi.ts` (mới), `useOOPVisualizerStore.spec.ts`

### 141. P1 — 7 Backend Sorting Strategies (IAlgorithmStrategy)
*   **ID:** FEAT-SORTING-STRATEGIES
*   **Mô tả:** Tạo 7 backend sorting strategy classes kế thừa `AlgorithmStrategyBase` và implement `IAlgorithmStrategy`. Refactor legacy `BubbleSortExecutor` thành `BubbleSortStrategy`. Tất cả tự động đăng ký qua DI reflection.
*   **Strategies:** BubbleSortStrategy, QuickSortStrategy, MergeSortStrategy, HeapSortStrategy, RadixSortStrategy, CountingSortStrategy, BucketSortStrategy
*   **Files tạo:** `BubbleSortStrategy.cs`, `QuickSortStrategy.cs`, `MergeSortStrategy.cs`, `HeapSortStrategy.cs`, `RadixSortStrategy.cs`, `CountingSortStrategy.cs`, `BucketSortStrategy.cs`

### 142. P2 — Frontend Type Safety: Eliminate 13+ non-test `any` usages
*   **ID:** FIX-TYPE-SAFETY
*   **Mô tả:** Loại bỏ tất cả `any` type trong non-test frontend code. Thay thế bằng strict TypeScript interfaces, type guards, discriminated unions.
*   **Thay đổi:**
    - `MonacoGutterClickInterceptor.ts`: `any` → `MonacoMouseEvent` + `MonacoEditorInstance`
    - `PseudocodeSyncer.ts`: `any` → `MonacoEditorForHighlight` interface
    - `MonacoLineSyncerCoordinator.ts`: `any` → `VcrBaseFrame` + `VcrStoreForSync`
    - `useGraphInteraction.ts`: `any` → `InteractivePlaygroundEngine | null`
    - `useInputValidation.ts`: `catch (err: any)` → `catch (err: unknown)` + type guard
    - `useSortingAnimation.ts`: `as any` cast removed — `VcrBaseFrame` base type
    - `SortingDetailPanel.vue`: `as any` → `isSortFrame()` type guard
    - `useVcrStore.ts`: `err: any` → `err: unknown`, `PlaybackFrame[]` → `VcrBaseFrame[]`
    - `CompilerStepExecutor.ts`: `err: any` → `err: unknown`
*   **Files sửa:** 9 files across features/vcr-player, features/algorithm-sandbox, core/

### 143. P3 — Standardize VITE_API_BASE_URL + Algorithm Dashboard Integration
*   **ID:** FIX-API-URL
*   **Mô tả:** Chuẩn hóa `VITE_API_BASE_URL` across all DSA module files. Default port 5050 (matching backend).
*   **Thay đổi:**
    - `useAlgorithmStore.ts`: Thêm `API_BASE` constant, sửa `fetchAlgorithms()` và `loadAlgorithmDetails()` dùng absolute URL
    - `dsaApi.ts`: Sửa default port từ 5000 → 5050
    - `algorithmCatalog.ts`: Thêm 7 sorting algorithms vào catalog (17 total)
    - `algorithmLocalMetadata.ts`: Thêm metadata cho 7 sorting algorithms
    - `sortingGenerators.ts`: Thêm 4 dummy generators (HeapSort, RadixSort, CountingSort, BucketSort)
    - `dummyGenerators.ts`: Đăng ký 4 generators mới
    - Tests: Cập nhật catalog (10→17) và store specs
*   **Files sửa:** `useAlgorithmStore.ts`, `dsaApi.ts`, `algorithmCatalog.ts`, `algorithmLocalMetadata.ts`, `sortingGenerators.ts`, `dummyGenerators.ts`, `algorithmCatalog.spec.ts`, `useAlgorithmStore.spec.ts`

### 144. Phase 4 — Backend Architecture Modules (SOLID, Design Patterns, DI/IoC)
*   **ID:** FEAT-PHASE4-ARCH
*   **Mô tả:** Implemented full-stack integration for 3 architecture modules: SOLID Principles, Design Patterns, DI/IoC Container.
*   **Backend thay đổi:**
    - `SOLIDPrinciplesStrategy.cs`: 3 scenarios (SRP, OCP, LSP) with 4 frames each
    - `DesignPatternsStrategy.cs`: 3 scenarios (Strategy, Observer, Singleton) with 4 frames each
    - `DIContainerStrategy.cs`: 2 scenarios (lifetime-demo: 5 frames, cycle-detection: 4 frames)
    - DTOs: `SOLIDFrameDto.cs`, `DesignPatternFrameDto.cs`, `DIContainerFrameDto.cs`
    - Controllers: `SOLIDController.cs`, `DesignPatternsController.cs`, `DIContainerController.cs`
    - DI: Registered 3 new strategies in `AlgorithmDIConfiguration.cs`
*   **Frontend thay đổi:**
    - `solidApi.ts`: Service layer for SOLID API
    - `designPatternsApi.ts`: Service layer for Design Patterns API
    - `diContainerApi.ts`: Service layer for DI Container API
    - `useSOLIDVisualizerStore.ts`: Added VCR state + actions (loadVcrScenario, vcrNext, vcrPrev, vcrReset, exitVcrMode)
    - `useDesignPatternsStore.ts`: Added VCR state + actions
    - `useDIContainerStore.ts`: New Pinia store with VCR integration
*   **Build:** `dotnet build` 0 errors, `vue-tsc --noEmit` 0 errors
*   **Files:** 16 new/modified files across backend/src/ and frontend/src/features/
