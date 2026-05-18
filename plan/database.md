# 🗄️ Thiết Kế Cơ Sở Dữ Liệu Quan Hệ - Relational Database Schema

Tài liệu này đặc tả chi tiết lược đồ bảng cơ sở dữ liệu quan hệ (Entity Relationship Schema) trong PostgreSQL phục vụ dự án **VisualizationDSA**.

---

## 1. Sơ Đồ Thực Thể Quan Hệ (ER Diagram Schema)

```
  +---------------+             +---------------------+
  |     USERS     | 1         N |    USER_PROGRESS    |
  | (PK) Id       +------------>| (PK) Id             |
  |      Email    |             | (FK) UserId         |
  |      Password |             |      CurrentXp      |
  +-------+-------+             |      CurrentLevel   |
          | 1                   +---------------------+
          |
          | N
  +-------v---------------------+             +---------------------+
  |      EMBEDDING_WIDGETS      |             |    USER_SUBMISSIONS |
  | (PK) Id                     |             | (PK) Id             |
  | (FK) UserId                 |             | (FK) UserId         |
  |      AlgorithmId            |             |      QuizId         |
  |      Theme                  |             |      Score          |
  |      Width, Height          |             |      Passed         |
  +-----------------------------+             +---------------------+
```

---

## 2. Đặc Tả Chi Tiết Các Bảng Dữ Liệu (Table Schemas)

### 2.1. Bảng `users` (Thông tin người dùng)
*   **Mô tả:** Lưu trữ tài khoản và danh tính học viên.
```sql
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2. Bảng `user_progress` (Tiến trình tích lũy XP)
*   **Mô tả:** Quản lý điểm số kinh nghiệm XP, thăng hạng cấp độ của sinh viên.
```sql
CREATE TABLE user_progress (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    current_xp INT DEFAULT 0 CHECK (current_xp >= 0),
    current_level INT DEFAULT 1 CHECK (current_level >= 1),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3. Bảng `embedding_widgets` (Cấu hình Iframe nhúng)
*   **Mô tả:** Lưu trữ cấu hình Iframe độc lập học viên đã chia sẻ.
```sql
CREATE TABLE embedding_widgets (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    algorithm_id VARCHAR(50) NOT NULL,
    theme VARCHAR(30) DEFAULT 'GLASS_SLATE_DARK',
    width INT NOT NULL CHECK (width > 0),
    height INT NOT NULL CHECK (height > 0),
    allow_interaction BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Chỉ Mục Tăng Tốc Truy Vấn (Performance Database Indexes)
Để đảm bảo tốc độ phản hồi API luôn đạt mức cực nhạy dưới máy khách, chúng ta thiết lập các chỉ mục tối ưu:
*   **Chỉ mục 1 (Bảng `user_progress`):** Đánh Index tìm kiếm tiến trình nhanh theo `user_id`:
```sql
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
```
*   **Chỉ mục 2 (Bảng `embedding_widgets`):** Đánh Index tìm kiếm cấu hình widget nhúng nhanh theo `algorithm_id`:
```sql
CREATE INDEX idx_widgets_algo_id ON embedding_widgets(algorithm_id);
```
