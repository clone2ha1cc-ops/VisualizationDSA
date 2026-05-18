# 🏛️ Kiến Trúc Tổng Thể Hệ Thống - System Architecture Blueprint

Tài liệu này đặc tả chi tiết kiến trúc phân tầng, luồng luân chuyển dữ liệu và cơ cấu phối hợp công nghệ trong dự án **VisualizationDSA**.

---

## 1. Sơ Đồ Kiến Trúc Phân Tầng (Layered Architecture Blueprint)

Hệ thống được thiết kế theo mô hình **Client-First Architecture**, tối đa hóa năng lực xử lý ở máy khách dưới 5ms để loại bỏ độ trễ mạng và giảm tải máy chủ:

```
+-----------------------------------------------------------------------+
|                        Premium Glassmorphic UI                        |
|              (Vue 3 Composition API + Pinia Stores)                   |
+------------------------------------+----------------------------------+
                                     |
                                     v
+------------------------------------+----------------------------------+
|                     Monaco Editor Code Sync Shell                     |
|           (Monaco Editor + MonacoGutterClickInterceptor)              |
+------------------------------------+----------------------------------+
                                     |
                                     v
+------------------------------------+----------------------------------+
|                  Core Anim Engine (rAF 60 FPS)                        |
|          (Vector Lerp Point + CompilerStepExecutor AST)               |
+------------------------------------+----------------------------------+
                                     |
                                     v
+------------------------------------+----------------------------------+
|                Offscreen Double Buffered Render Layer                 |
|     (Canvas 2D: Bars, Nodes, Smoke Particles | SVG: Bezier Pointer)   |
+------------------------------------+----------------------------------+
                                     |  HTTPS JWT
                                     v
+------------------------------------+----------------------------------+
|               RESTful Web API Services (C# Backend)                    |
|             (ASP.NET Core Controllers + EF Core Mapper)               |
+-----------------------------------------------------------------------+
                                     |
                                     v
+------------------------------------+----------------------------------+
|                  Relational Database Storage                          |
|             (PostgreSQL Tables + Supabase Pooler)                     |
+-----------------------------------------------------------------------+
```

---

## 2. Các Thành Phần Hạt Nhân Cốt Lõi (Core Components)

### 2.1. Lớp Trình Bày (Glassmorphic Presentation Layer)
*   **Vue 3 Composition API:** Quản lý vòng đời Component, cô lập mã nguồn.
*   **Pinia Store System:** Lưu trữ trạng thái VCR Playback thời gian thực và tiến trình người học.
*   **HSL Neon CSS Variables:** Định hình bảng Slate tối, viền mờ 8% trắng và bóng đổ Neon lung linh phản ánh đúng trạng thái vật lý.

### 2.2. Lớp Động Cơ Hoạt Ảnh (Core Engine Layer)
*   **requestAnimationFrame (rAF Loop):** Kích hoạt xung nhịp 60 FPS đều đặn bám sát phần cứng màn hình.
*   **Vector Lerp Point:** Phép toán nội suy Vector di chuyển các phần tử mảng và nút cây mượt mà.
*   **Offscreen Canvas Double Buffering:** Tạo luồng vẽ đệm vô hình ở RAM trước khi đẩy ra màn hình giúp chống giật chớp hình hoàn hảo.

### 2.3. Lớp Dịch Vụ Máy Chủ (Web API & Db Storage)
*   **C# ASP.NET Core:** Cung cấp API RESTful gọn nhẹ, xử lý xác thực JWT bảo mật và lưu trữ tiến trình.
*   **PostgreSQL Database:** Lưu trữ thông tin người dùng, điểm số trắc nghiệm và dữ liệu cấu hình Iframe nhúng.
