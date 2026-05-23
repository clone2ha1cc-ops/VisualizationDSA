# 🏛️ Nhật Ký Quyết Định Kiến Trúc - Architectural Decision Records (ADR)

Tài liệu này ghi lại các quyết định kiến trúc kỹ thuật cốt lõi (ADR) định hình toàn bộ hệ thống **VisualizationDSA**.

> ⚠️ **Lưu ý:** Chỉ các ADR có code thực tế đã hiện thực hóa mới được ghi nhận tại đây. Các ADR cho tính năng chưa implement được chuyển về phần spec của từng feature trong `plan/features/deep-decomposition/`.

---

## ADR-01: Kiến Trúc Biên Dịch Tĩnh Client-Side First (AST Compilation under 5ms)

- **Trạng thái:** ✅ IMPLEMENTED — `src/core/CompilerStepExecutor.ts`
- **Ngữ cảnh:** Hệ thống cần phản hồi biên dịch mã nguồn giải thuật tùy biến do sinh viên viết để xuất các khung hình hoạt ảnh. Gửi mã lên Backend gây trễ mạng.
- **Quyết định:** Thực thi mã JavaScript trong một Sandbox an toàn (`new Function(...)`) với hàng phòng ngự thứ hai là Regex fallback, sinh chuỗi `PlaybackFrame[]` 100% tại trình duyệt.
- **Hệ quả:** Loại bỏ hoàn toàn độ trễ mạng. Phản hồi biên dịch tức thì. Bộ bảo vệ chống vòng lặp vô hạn giới hạn 10.000 bước.
- **File liên quan:** `CompilerStepExecutor.ts`, test: `CoreAnimationEngine.spec.ts`

---

## ADR-02: Đồng Bộ Hoạt Ảnh Xung requestAnimationFrame (rAF 60 FPS Engine)

- **Trạng thái:** ✅ IMPLEMENTED — `src/core/CoreAnimationEngine.ts`
- **Ngữ cảnh:** Hoạt ảnh di chuyển các phần tử mảng hoán vị dễ bị giật hình nếu dùng `setInterval` hay `setTimeout`.
- **Quyết định:** Vòng lặp rAF bám tần số quét thực tế màn hình (60Hz–144Hz), áp dụng Lerp tuyến tính cho mọi thuộc tính động (vị trí X, màu RGB, scale). DeltaTime được clamp ở 32ms để chống spike khi ẩn tab.
- **Hệ quả:** Hoạt ảnh 60 FPS mượt mà, tự dừng khi ẩn tab, GC-safe (`cancelAnimationFrame` + `renderCallbacks = []` trong `destroy()`).
- **File liên quan:** `CoreAnimationEngine.ts`, `useAnimatedItems.ts`, `ArrayBarVisualizer.vue`

---

## ADR-03: Kiến Trúc VCR Player — Data-Driven Playback

- **Trạng thái:** ✅ IMPLEMENTED — `src/features/vcr-player/store/useVcrStore.ts`
- **Ngữ cảnh:** Canvas không nên chứa logic so sánh hay kiểm tra thuật toán. Cần tách biệt rõ ràng giữa logic sinh dữ liệu và lớp vẽ.
- **Quyết định:** Backend sinh `SortFrame[]` / `PlaybackFrame[]` trước khi play. Canvas chỉ đọc frame tại `currentFrameIndex` từ Pinia Store và vẽ trạng thái đó. VCR Player điều khiển `currentFrameIndex` qua `stepNext()`, `stepPrev()`, `jumpToFrame()`, `setInterval` auto-advance.
- **Hệ quả:** Canvas không có logic thuật toán nào. Scrubber tức thì không cần re-compute. Tốc độ playback chỉnh được qua `playbackSpeed` ref.
- **File liên quan:** `useVcrStore.ts`, `ArrayBarVisualizer.vue`, `VcrControlPanel.vue`

---

## ADR-04: Modular Feature Architecture — Barrel Exports

- **Trạng thái:** ✅ IMPLEMENTED — `src/features/*/index.ts`
- **Ngữ cảnh:** Cần tổ chức code theo tính năng để tránh import spaghetti giữa các module.
- **Quyết định:** Mỗi feature (`algorithm-sandbox`, `vcr-player`, `code-editor`, `quiz`) có file `index.ts` làm barrel export. `App.vue` chỉ import từ barrel, không import trực tiếp vào nội bộ feature khác.
- **Hệ quả:** Import rõ ràng, đổi tên nội bộ không ảnh hưởng consumer bên ngoài. Store `playback.ts` giữ alias deprecated để backward-compat.
- **File liên quan:** `src/features/*/index.ts`, `src/store/playback.ts`

---

## ADR chờ implement (tham khảo spec)

Các ADR sau đây được ghi trong tài liệu đặc tả nhưng **chưa có code thực tế**:

| ADR         | Tính năng                                     | Sprint    |
| :---------- | :-------------------------------------------- | :-------- |
| ADR-LCOM4   | Tính LCOM4 BFS/DFS đo kết dính SRP            | Sprint 7  |
| ADR-DI-LOOP | Phát hiện Dependency Loop DFS IoC Container   | Sprint 8  |
| ADR-SMOKE   | Hạt khói Canvas GC-Cycle Emitter Server crash | Sprint 11 |
| ADR-VTABLE  | Mô phỏng VTable đa hình OOP client-side       | Sprint 6  |

---

## ADR-BACKEND-DRIVEN: Backend-Driven State Capture cho Phase 1 Animation Engine

- **Trạng thái:** ✅ IMPLEMENTED
- **Ngữ cảnh:** Phase 1 Animation Engine cần kiến trúc mới cho việc trực quan hóa giải thuật, bổ sung bên cạnh kiến trúc Client-Side First hiện tại (ADR-01).
- **Quyết định:** Áp dụng mô hình Backend-Driven State Capture: Backend C# chạy thuật toán, ghi nhận snapshot từng bước vào List FrameDTO, Frontend Vue 3 nhận JSON và phát lại như video player.
- **Hệ quả:**
  - Tính toàn vẹn dữ liệu cao (logic thuật toán C# tường minh).
  - Scrubbing O(1) complexity (thay đổi currentIndex trong Pinia Store).
  - Mở rộng thuật toán mới cực nhanh (chỉ viết C# class kế thừa AlgorithmBase).
  - shallowRef tối ưu RAM Vue 3 (tiết kiệm 95% CPU tracking reactivity).
  - Fallback dummy engine phía Frontend khi Backend chưa sẵn sàng.
- **File liên quan:**
  - Backend: Domain/Engine/AlgorithmBase.cs, BubbleSortExecutor.cs, FrameDTO.cs, AlgorithmsController.cs
  - Frontend: useAnimationStore.ts, CanvasLayer.vue, VisualizationPlayer.vue, algorithmApi.ts
  - Tests: useAnimationStore.spec.ts (16 tests), algorithmApi.spec.ts (7 tests)

---

## ADR-ZERO-TRUST-INPUT: Zero Trust Input Pipeline cho Phase 1 Custom Input Generator

- **Trạng thái:** ✅ IMPLEMENTED
- **Ngữ cảnh:** Tính năng Custom Input cho phép người dùng nhập dữ liệu tự do, tạo rủi ro bảo mật (DDoS qua mảng lớn, injection qua ký tự lạ).
- **Quyết định:** Áp dụng nguyên lý Zero Trust Input Pipeline — xác thực 3 tầng:
  1. Frontend Regex validation (instant UI feedback, khóa nút Execute khi sai).
  2. Backend InputParser (Regex C# quét lại toàn bộ chuỗi thô).
  3. Backend ConstraintResolver (giới hạn phần tử tối đa per-algorithm) + CancellationToken 2s timeout.
- **Hệ quả:**
  - Bảo vệ CPU server khỏi payload mảng khổng lồ.
  - UX phản hồi tức thì (viền đỏ/xanh/cam, đếm phần tử real-time).
  - Sinh mảng ngẫu nhiên thông minh (random/nearly-sorted/reversed) hoàn toàn client-side.
  - Fallback sang dummy engine khi Backend unreachable.
- **File liên quan:**
  - Backend: Domain/Input/InputParser.cs, ConstraintResolver.cs, Application/DTOs/CustomInputRequestDto.cs, AlgorithmsController.cs (custom-execute endpoint)
  - Frontend: custom-input/store/useInputStore.ts, custom-input/components/CustomInputForm.vue
  - Tests: useInputStore.spec.ts (38 tests)
