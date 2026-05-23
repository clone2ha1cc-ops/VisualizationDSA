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

---

## ADR-STRATEGY-DI: Strategy Pattern + Reflection DI cho Phase 1 DSA Modules Library

- **Trạng thái:** ✅ IMPLEMENTED
- **Ngữ cảnh:** Hệ thống cần mở rộng từ 1 thuật toán (Bubble Sort) lên 10+ thuật toán mà không sửa code Controller hoặc logic hiện tại.
- **Quyết định:** Áp dụng Strategy Pattern + Reflection-based DI Auto-Registration:
  1. `IAlgorithmStrategy` interface: mỗi thuật toán là một Plugin class độc lập.
  2. `AlgorithmDIConfiguration.cs`: quét Assembly tự động tìm tất cả class implement IAlgorithmStrategy và đăng ký vào DI Container.
  3. Controller inject `IEnumerable<IAlgorithmStrategy>`: không cần switch-case, không cần sửa code khi thêm thuật toán mới.
  4. Frontend Dynamic Component: `<component :is>` tự chuyển renderer theo category (Sorting→Bars, Searching→Boxes, Tree→Nodes, Stack-Queue→Tube).
- **Hệ quả:**
  - Open/Closed Principle hoàn hảo: thêm thuật toán mới = chỉ tạo 1 file C# class.
  - 10 thuật toán đầy đủ: BubbleSort, SelectionSort, InsertionSort, QuickSort, MergeSort, LinearSearch, BinarySearch, Stack, Queue, BST.
  - 4 Canvas Renderers chuyên biệt: BarChart (sorting bars), BoxArray (search boxes + Low/Mid/High pointers), TreeRenderer (BST node circles + edges), TubeRenderer (Stack vertical LIFO / Queue horizontal FIFO).
  - Binary Search validation gate: từ chối mảng chưa sắp xếp với HTTP 400.
  - Fallback dummy generators cho tất cả 10 thuật toán khi Backend chưa sẵn sàng.
- **File liên quan:**
  - Backend: Domain/Strategies/IAlgorithmStrategy.cs, AlgorithmStrategyBase.cs, 10 Strategy files, Infrastructure/Extensions/AlgorithmDIConfiguration.cs
  - Frontend: dsa-modules/store/useAlgorithmStore.ts, dsa-modules/services/dummyGenerators.ts, dsa-modules/components/DSAPlayer.vue, AlgorithmVisualizer.vue, 4 renderers
  - Tests: useAlgorithmStore.spec.ts (10), dummyGenerators.spec.ts (19), dsaApi.spec.ts (3), algorithmCatalog.spec.ts (8) — 40 tests total

---

## ADR-E-LECTURE: Script-driven E-Lecture Mode (Phase 1 — Cognitive Load Theory)

- **Trạng thái:** ✅ IMPLEMENTED
- **Ngữ cảnh:** Hệ thống cần chế độ bài giảng điện tử dẫn dắt sinh viên qua từng bước giải thuật theo kịch bản sư phạm (Cognitive Load Theory), không hardcode logic UI mà dùng JSON script.
- **Quyết định:** Áp dụng Script-driven Architecture với 3 trụ cột:
  1. `LectureScript` JSON schema: mỗi bài giảng là mảng `Slide[]`, mỗi slide chứa `SlideAction` với 3 lệnh (`RESET_CANVAS`, `PLAY_UNTIL`, `PAUSE`).
  2. `useLectureStore` orchestration: điều phối slide + đồng bộ `useAnimationStore.playUntilFrame()` Promise — tự động minimize panel (opacity 0.15, scale 0.88) khi Canvas chạy hoạt ảnh.
  3. `interactionLocked` state: khóa Timeline/Speed/CustomInput controls khi bài giảng đang hoạt động, mở khóa khi exitLecture.
- **Hệ quả:**
  - Thêm bài giảng mới = chỉ tạo 1 file JSON, không sửa code Vue/Pinia.
  - Glassmorphism overlay panel: backdrop-blur 16px, dimmed backdrop 40% opacity.
  - 3 slide types: theory (static), guided-animation (PLAY_UNTIL auto-play), interactive-check (pause + chờ user).
  - Keyboard shortcuts: Arrow Right/Left (slide nav), Esc (exit lecture).
  - Backend API: `GET /api/v1/lectures/{algorithmId}` với Cache-Control 7 days.
  - Bundled JSON fallback: `bubble-sort-intro.json` tải offline không cần API.
- **File liên quan:**
  - Frontend: e-lecture/store/useLectureStore.ts, e-lecture/components/LectureOverlay.vue, e-lecture/services/lectureLoader.ts, e-lecture/types/lecture.types.ts
  - Backend: Domain/Lectures/Lecture.cs, LectureRepository.cs, WebApi/Controllers/LecturesController.cs
  - Extended: animation-engine/store/useAnimationStore.ts (playUntilFrame, goToFrame, interactionLocked)
  - Tests: useLectureStore.spec.ts (13), lectureLoader.spec.ts (7), animationStoreExtensions.spec.ts (8) — 28 tests total

---

## ADR-EXECUTION-CONTROL: VCR Control Panel Nâng cấp (Phase 1 — Command Issuer Pattern)

- **Trạng thái:** ✅ IMPLEMENTED
- **Ngữ cảnh:** Hệ thống cần bảng điều khiển VCR chuyên nghiệp kiểu YouTube/Netflix player: Replay, Dynamic Tooltip, Throttled Scrubbing 30 FPS, localStorage persistence, enhanced keyboard shortcuts.
- **Quyết định:** Áp dụng Command Issuer Pattern + Composable Architecture:
  1. `AnimControlPanel.vue` chỉ phát lệnh tới `useAnimationStore`, không xử lý logic Canvas — Loose Coupling.
  2. `useThrottledScrub` composable: Throttle 33ms (~30 FPS) khi kéo tua slider, tự động pause khi bắt đầu scrub.
  3. `usePlaybackHotkeys` composable: Global keyboard listener với input focus guard (INPUT/TEXTAREA/SELECT), Shift+Arrow rewind/fast-forward, interactionLocked guard, auto-cleanup onUnmount.
  4. `useSliderTooltip` composable: Dynamic tooltip hiển thị explanation khi hover slider, truncateText 55 chars.
  5. `useSpeedPreferences` composable: localStorage persistence cho `dsa_preferences.defaultSpeed`, init speed on mount.
  6. Replay button: Play→Pause→Replay (↩) auto-switch theo playbackState (PLAYING/PAUSED/FINISHED).
  7. YouTube-style slider: Emerald neon progress track, glow thumb, hover height transition.
  8. E-Lecture lock: opacity 0.5 + pointer-events none khi interactionLocked=true.
- **Hệ quả:**
  - Thanh trượt kéo tua mượt mà 30 FPS, không lag CPU.
  - Phím tắt toàn cục (Space, Arrow, Shift+Arrow, R, Esc) không xung đột với Custom Input textarea.
  - Tốc độ phát yêu thích được lưu qua phiên qua localStorage.
  - togglePlay() action mới trong useAnimationStore.
- **File liên quan:**
  - Frontend: animation-engine/composables/useSpeedPreferences.ts, useThrottledScrub.ts, usePlaybackHotkeys.ts, useSliderTooltip.ts
  - Component: animation-engine/components/AnimControlPanel.vue (rewritten)
  - Store: animation-engine/store/useAnimationStore.ts (added togglePlay)
  - Tests: executionControl.spec.ts (23 tests)
