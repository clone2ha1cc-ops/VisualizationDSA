# 🔌 Đặc Tả Giao Diện Lập Trình Ứng Dụng - Web API Specifications

Tài liệu này đặc tả chi tiết giao diện lập trình ứng dụng RESTful API kết nối giữa Frontend Vue 3 máy khách và Backend C# ASP.NET Core máy chủ trong dự án **VisualizationDSA**.

---

## 1. Kiến Trúc Giao Tiếp (Communication Architecture)
*   **Giao thức:** HTTPS RESTful API.
*   **Định dạng dữ liệu:** JSON (UTF-8).
*   **Ngưỡng phản hồi cam kết:** < 50ms cho các API lưu tiến trình và tải dữ liệu.
*   **Bảo mật:** JWT Bearer Token xác thực người dùng.

---

## 2. Danh Sách Các Cổng API (API Endpoints Directory)

### 2.1. Quản lý Tiến trình & Tích lũy XP (User Progress & XP Tracking)

#### 📥 API 1: Cộng điểm XP và thăng hạng học viên
*   **Đường dẫn:** `POST /api/v1/progress/xp`
*   **Mô tả:** Đồng bộ điểm XP kiếm được từ Canvas trắc nghiệm lên máy chủ.
*   **Đầu vào (Request Body):**
```json
{
  "userId": "STD_99",
  "earnedXp": 200,
  "actionToken": "UUID-7fdb06f8-facb-4949-bb0e-ff4214c4b6d8" // Token idempotency chống spam
}
```
*   **Đầu ra (Response - 200 OK):**
```json
{
  "userId": "STD_99",
  "totalXp": 1050,
  "currentLevel": 2,
  "leveledUp": true,
  "unlockedAchievements": ["LEVEL_2_ACHIEVER"]
}
```

---

### 2.2. Nộp Bài Chấm Điểm Trắc Nghiệm (Quizzes Evaluation)

#### 📥 API 2: Chấm điểm bài trắc nghiệm tương tác
*   **Đường dẫn:** `POST /api/v1/quizzes/submit`
*   **Mô tả:** Chấm điểm các câu trả lời trắc nghiệm và kiểm tra compliance.
*   **Request Body:**
```json
{
  "quizId": "QZ_BUBBLE_SORT",
  "answers": {
    "q1": "temp = arr[i]",
    "q2": "O(N^2)"
  },
  "studentCode": "function bubble() { let temp = arr[0]; }"
}
```
*   **Response (200 OK):**
```json
{
  "quizId": "QZ_BUBBLE_SORT",
  "score": 10,
  "maxScore": 10,
  "passed": true,
  "xpReward": 150,
  "codeCompliant": true
}
```

---

### 2.3. Khởi Tạo Mã Nhúng Widget (Embedding Widgets)

#### 📥 API 3: Lưu cấu hình Iframe Standalone Widget
*   **Đường dẫn:** `POST /api/v1/widgets`
*   **Mô tả:** Lưu trữ cấu hình nhúng của học viên và sinh URL nhúng.
*   **Request Body:**
```json
{
  "algorithmId": "dijkstra",
  "theme": "GLASS_SLATE_DARK",
  "width": 800,
  "height": 600,
  "allowInteraction": true
}
```
*   **Response (201 Created):**
```json
{
  "widgetId": "WDG_882912",
  "embedUrl": "https://dsa.edu.vn/embed/WDG_882912",
  "iframeHtml": "<iframe src=\"https://dsa.edu.vn/embed/WDG_882912\" width=\"800\" height=\"600\" sandbox=\"allow-scripts allow-same-origin\"></iframe>"
}
```
