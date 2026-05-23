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
