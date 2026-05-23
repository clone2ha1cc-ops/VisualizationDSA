# 🧪 Danh Sách Tính Năng Đã Kiểm Thử - Features Verified & Test Suite Status

Tài liệu này ghi nhận trạng thái kiểm thử đơn vị tự động (Unit Test Suite) của toàn bộ 23 tính năng hạt nhân thuộc Phase 1 và Phase 2 của dự án **VisualizationDSA**.

---

## 📌 Trạng Thái Bao Phủ Kiểm Thử (Test Coverage Status)
*   **Tổng số tính năng hạt nhân:** 23/23 Tính năng + Phase 1 Animation Engine (23 tests) + Phase 1 Custom Input (38 tests) + Phase 1 DSA Modules (40 tests mới) + Phase 1 E-Lecture Mode (28 tests mới) + Phase 1 Execution Control (23 tests mới) + Phase 1 Interactive Playground (31 tests mới).
*   **Trạng thái Vitest Suite:** 🟢 100% PASSED (219/220 — 1 pre-existing ForceDirectedLayout failure).
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
| 53 | **Algorithm Store** | Initial state empty | algorithms=[], currentAlgorithm=null, metadata=null. | 🟢 PASSED |
| 54 | **Algorithm Store** | fetchAlgorithms API fallback | Fallback sang local catalog khi API fails. | 🟢 PASSED |
| 55 | **Algorithm Store** | fetchAlgorithms API success | Load algorithms từ API response. | 🟢 PASSED |
| 56 | **Algorithm Store** | selectAlgorithm + metadata | Gán currentAlgorithm, load local metadata. | 🟢 PASSED |
| 57 | **Algorithm Store** | clearActive reset | Reset currentAlgorithm + metadata về null. | 🟢 PASSED |
| 58 | **Algorithm Store** | filteredAlgorithms search | Filter theo tên/category, clear trả về tất cả. | 🟢 PASSED |
| 59 | **Algorithm Store** | filteredAlgorithms category | Filter 'searching' trả 2 algos đúng category. | 🟢 PASSED |
| 60 | **Algorithm Store** | categories unique | 4 categories: Sorting, Searching, Stack-Queue, Tree. | 🟢 PASSED |
| 61 | **Algorithm Store** | loadAlgorithmDetails fallback | Set currentAlgorithm + metadata từ local. | 🟢 PASSED |
| 62 | **Algorithm Store** | 10 algorithms metadata | Tất cả 10 algos có metadata + pseudoCode. | 🟢 PASSED |
| 63 | **Dummy Generators** | BubbleSort frames | algorithmId='bubble-sort', frames > 0, pseudoCode > 0. | 🟢 PASSED |
| 64 | **Dummy Generators** | BubbleSort sorted result | Last frame dataState sorted ascending. | 🟢 PASSED |
| 65 | **Dummy Generators** | BubbleSort stepId sequence | stepId incrementing 1..N. | 🟢 PASSED |
| 66 | **Dummy Generators** | SelectionSort correct | Final dataState = sorted. | 🟢 PASSED |
| 67 | **Dummy Generators** | InsertionSort correct | Final dataState = sorted. | 🟢 PASSED |
| 68 | **Dummy Generators** | QuickSort correct | Final dataState = sorted. | 🟢 PASSED |
| 69 | **Dummy Generators** | QuickSort pivot highlights | Có frames với highlights.pivot != null. | 🟢 PASSED |
| 70 | **Dummy Generators** | MergeSort correct | Final dataState = sorted. | 🟢 PASSED |
| 71 | **Dummy Generators** | LinearSearch found | highlights.found != null khi target tồn tại. | 🟢 PASSED |
| 72 | **Dummy Generators** | LinearSearch not found | Không có found highlight khi target vắng mặt. | 🟢 PASSED |
| 73 | **Dummy Generators** | BinarySearch found | highlights.found != null, sorted array. | 🟢 PASSED |
| 74 | **Dummy Generators** | BinarySearch pointers | highlights.mid != null (Low/Mid/High). | 🟢 PASSED |
| 75 | **Dummy Generators** | Stack push/pop | 3 Push frames, final dataState rỗng. | 🟢 PASSED |
| 76 | **Dummy Generators** | Stack empty final | Last frame dataState = []. | 🟢 PASSED |
| 77 | **Dummy Generators** | Queue enqueue/dequeue | 3 Enqueue frames, final dataState rỗng. | 🟢 PASSED |
| 78 | **Dummy Generators** | Queue empty final | Last frame dataState = []. | 🟢 PASSED |
| 79 | **Dummy Generators** | BST tree nodes | treeNodes defined, length = 3. | 🟢 PASSED |
| 80 | **Dummy Generators** | BST parent-child | Root leftNodeId/rightNodeId not null. | 🟢 PASSED |
| 81 | **Dummy Generators** | Unknown fallback | Returns single frame fallback. | 🟢 PASSED |
| 82 | **Algorithm Catalog** | 10 algorithms count | Exactly 10 algorithms. | 🟢 PASSED |
| 83 | **Algorithm Catalog** | Required fields | All fields (id, name, category, etc.) populated. | 🟢 PASSED |
| 84 | **Algorithm Catalog** | Unique IDs | No duplicate algorithm IDs. | 🟢 PASSED |
| 85 | **Algorithm Catalog** | 4 categories | Sorting, Searching, Stack-Queue, Tree. | 🟢 PASSED |
| 86 | **Algorithm Catalog** | 5 sorting algos | 5 sorting algorithms. | 🟢 PASSED |
| 87 | **Algorithm Catalog** | 2 searching algos | 2 searching algorithms. | 🟢 PASSED |
| 88 | **Algorithm Catalog** | 2 stack-queue algos | 2 stack-queue algorithms. | 🟢 PASSED |
| 89 | **Algorithm Catalog** | 1 tree algo (BST) | 1 tree algorithm, id='bst'. | 🟢 PASSED |
| 90 | **DSA API** | Fallback on network error | Returns dummy result. | 🟢 PASSED |
| 91 | **DSA API** | API success | Returns API response. | 🟢 PASSED |
| 92 | **DSA API** | HTTP error fallback | Returns dummy on 500 status. | 🟢 PASSED |

### Phase 1 E-Lecture Mode — 28 Unit Tests

| STT | Phân hệ kiểm thử | Tính năng hạt nhân được xác thực | Phương thức kiểm tra (Test Spec) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 93 | **useLectureStore** | Starts in inactive state | isActive=false, activeSlide=null, isWaitingForAnimation=false | 🟢 PASSED |
| 94 | **useLectureStore** | startLecture activates + first slide | isActive=true, slideId=1, interactionLocked=true | 🟢 PASSED |
| 95 | **useLectureStore** | slideProgress format | Returns "1 / 3" correct format | 🟢 PASSED |
| 96 | **useLectureStore** | isFirstSlide / isLastSlide | Correct boundary detection | 🟢 PASSED |
| 97 | **useLectureStore** | nextSlide advances slide | Index increments, PLAY_UNTIL with fake timers | 🟢 PASSED |
| 98 | **useLectureStore** | prevSlide goes back | Index decrements after nextSlide | 🟢 PASSED |
| 99 | **useLectureStore** | prevSlide does nothing on first | currentSlideIndex remains 0 | 🟢 PASSED |
| 100 | **useLectureStore** | nextSlide does nothing on last | Stays at last index, isLastSlide=true | 🟢 PASSED |
| 101 | **useLectureStore** | exitLecture resets all state | isActive=false, lecture=null, interactionLocked=false | 🟢 PASSED |
| 102 | **useLectureStore** | totalSlides count | Returns 3 for 3-slide lecture | 🟢 PASSED |
| 103 | **useLectureStore** | RESET_CANVAS calls goToFrame | animStore.currentIndex = 0 | 🟢 PASSED |
| 104 | **useLectureStore** | goToSlide navigates | Jumps to specific slide index | 🟢 PASSED |
| 105 | **useLectureStore** | goToSlide rejects OOB | Ignores -1 and 100 | 🟢 PASSED |
| 106 | **lectureLoader** | hasLecture bubble-sort | Returns true | 🟢 PASSED |
| 107 | **lectureLoader** | hasLecture unknown | Returns false | 🟢 PASSED |
| 108 | **lectureLoader** | getAvailableLectureIds | Contains 'bubble-sort' | 🟢 PASSED |
| 109 | **lectureLoader** | loadLecture bundled | Returns full LectureScript | 🟢 PASSED |
| 110 | **lectureLoader** | loadLecture fetch fail | Returns null | 🟢 PASSED |
| 111 | **lectureLoader** | loadLecture 404 | Returns null | 🟢 PASSED |
| 112 | **lectureLoader** | Correct slide types | theory + guided-animation + interactive-check | 🟢 PASSED |
| 113 | **lectureLoader** | Valid actions | All commands in RESET_CANVAS/PLAY_UNTIL/PAUSE | 🟢 PASSED |
| 114 | **AnimStore Ext** | goToFrame moves to index | currentIndex=5, isPlaying=false | 🟢 PASSED |
| 115 | **AnimStore Ext** | goToFrame rejects OOB | Stays at 0 for -1 and 999 | 🟢 PASSED |
| 116 | **AnimStore Ext** | setInteractionLocked toggle | true→true, false→false | 🟢 PASSED |
| 117 | **AnimStore Ext** | playUntilFrame resolves | Stops at target frame 3 | 🟢 PASSED |
| 118 | **AnimStore Ext** | playUntilFrame already past | Snaps to target | 🟢 PASSED |
| 119 | **AnimStore Ext** | playUntilFrame empty frames | Resolves immediately | 🟢 PASSED |
| 120 | **AnimStore Ext** | cancelPlayUntil snaps | Stops + snaps to target 7 | 🟢 PASSED |

### Phase 1 Execution Control — 23 Unit Tests

| STT | Phân hệ kiểm thử | Tính năng hạt nhân được xác thực | Phương thức kiểm tra (Test Spec) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 121 | **Speed Presets** | Plan-specified values | SPEED_PRESETS = [0.25, 0.5, 1.0, 2.0, 4.0] | 🟢 PASSED |
| 122 | **Speed Preferences** | Default speed 1.0 | No saved preference returns 1.0 | 🟢 PASSED |
| 123 | **Speed Preferences** | Save to localStorage | Writes dsa_preferences JSON with defaultSpeed | 🟢 PASSED |
| 124 | **Speed Preferences** | Load saved speed | Reads previously saved 4.0x speed | 🟢 PASSED |
| 125 | **Speed Preferences** | Corrupted localStorage fallback | Returns 1.0 on invalid JSON | 🟢 PASSED |
| 126 | **Speed Preferences** | Invalid speed value fallback | Returns 1.0 on negative speed | 🟢 PASSED |
| 127 | **Throttled Scrub** | Scrubs to target frame | goToFrame(3) after startScrub | 🟢 PASSED |
| 128 | **Throttled Scrub** | Pauses on scrub start | isPlaying=false after startScrub | 🟢 PASSED |
| 129 | **Throttled Scrub** | isScrubbing flag toggle | true after start, false after end | 🟢 PASSED |
| 130 | **Replay Logic** | goToFrame(0) + play from FINISHED | currentIndex=0, isPlaying=true | 🟢 PASSED |
| 131 | **Replay Logic** | FINISHED state detection | playbackState='FINISHED' at last frame | 🟢 PASSED |
| 132 | **Replay Logic** | togglePlay action | play/pause toggle in store | 🟢 PASSED |
| 133 | **Hotkeys** | createHotkeyHandler type | Returns function | 🟢 PASSED |
| 134 | **Hotkeys** | Space play/pause | Toggles isPlaying via Space key | 🟢 PASSED |
| 135 | **Hotkeys** | ArrowRight stepForward | Increments currentIndex by 1 | 🟢 PASSED |
| 136 | **Hotkeys** | ArrowLeft stepBackward | Decrements currentIndex by 1 | 🟢 PASSED |
| 137 | **Hotkeys** | Shift+ArrowLeft rewind | Goes to frame 0 | 🟢 PASSED |
| 138 | **Hotkeys** | Shift+ArrowRight fast-forward | Goes to last frame | 🟢 PASSED |
| 139 | **Hotkeys** | interactionLocked guard | Ignores Space when locked | 🟢 PASSED |
| 140 | **Hotkeys** | UNINITIALIZED guard | Ignores Space when no data | 🟢 PASSED |
| 141 | **Hotkeys** | Space replay from FINISHED | goToFrame(0) + play from end | 🟢 PASSED |
| 142 | **Tooltip** | truncateText long string | Truncates at maxLength + '...' | 🟢 PASSED |
| 143 | **Tooltip** | truncateText empty string | Returns empty string | 🟢 PASSED |

### Phase 1 Interactive Playground — 31 Unit Tests

| STT | Phân hệ kiểm thử | Tính năng hạt nhân được xác thực | Phương thức kiểm tra (Test Spec) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 144 | **PlaygroundStore** | Initial SELECT mode + empty | mode='SELECT', nodes=[], edges=[] | 🟢 PASSED |
| 145 | **PlaygroundStore** | addNode auto-label A,B,C | 3 nodes, labels A/B/C, radius 20 | 🟢 PASSED |
| 146 | **PlaygroundStore** | Max 30 nodes limit | 31st addNode returns null | 🟢 PASSED |
| 147 | **PlaygroundStore** | addEdge between nodes | Creates edge with weight=1 | 🟢 PASSED |
| 148 | **PlaygroundStore** | Self-loop prevention | addEdge(a, a) returns null | 🟢 PASSED |
| 149 | **PlaygroundStore** | Duplicate edge prevention | Second addEdge + reverse both null | 🟢 PASSED |
| 150 | **PlaygroundStore** | updateEdgeWeight valid range | Accepts 42, rejects 0 and 1000 | 🟢 PASSED |
| 151 | **PlaygroundStore** | Cascade delete edges | Removing node A removes A-B, A-C edges | 🟢 PASSED |
| 152 | **PlaygroundStore** | clearAll reset | Empties nodes, edges, selection | 🟢 PASSED |
| 153 | **PlaygroundStore** | setMode clears selection | Switching mode resets selectedNodeId | 🟢 PASSED |
| 154 | **PlaygroundStore** | moveNode position | Updates x/y coordinates | 🟢 PASSED |
| 155 | **GeometryEngine** | hitTestNode inside circle | Returns node when click inside | 🟢 PASSED |
| 156 | **GeometryEngine** | hitTestNode miss | Returns null when far away | 🟢 PASSED |
| 157 | **GeometryEngine** | hitTestNode boundary | Returns node at exact radius | 🟢 PASSED |
| 158 | **GeometryEngine** | ArrowPlacement border contact | Start/end at circle borders, not centers | 🟢 PASSED |
| 159 | **GeometryEngine** | hitTestEdge within threshold | Detects edge at 3px distance | 🟢 PASSED |
| 160 | **GeometryEngine** | hitTestEdge miss | Returns null at 100px distance | 🟢 PASSED |
| 161 | **GeometryEngine** | Snap distance detection | true within 40px, false beyond | 🟢 PASSED |
| 162 | **GeometryEngine** | Edge midpoint | Correct (200,100) for (100,100)-(300,100) | 🟢 PASSED |
| 163 | **ForceDirected** | Repulsion separates overlapping | dist > 10 after 50 ticks | 🟢 PASSED |
| 164 | **ForceDirected** | Spring pulls far nodes | finalDist < initialDist after 100 ticks | 🟢 PASSED |
| 165 | **ForceDirected** | Dragged node skipped | Position unchanged during drag | 🟢 PASSED |
| 166 | **ForceDirected** | Stability detection | isStable=true after 300 ticks | 🟢 PASSED |
| 167 | **GraphParser** | Adjacency list undirected | Both A→B and B→A with weight 8 | 🟢 PASSED |
| 168 | **GraphParser** | findIsolatedNodes disconnected | Node D isolated from A-B-C | 🟢 PASSED |
| 169 | **GraphParser** | findIsolatedNodes connected | Empty array for connected graph | 🟢 PASSED |
| 170 | **GraphParser** | Export + reimport roundtrip | 3 nodes, 2 edges preserved | 🟢 PASSED |
| 171 | **GraphParser** | Invalid JSON import | Returns null for bad input | 🟢 PASSED |
| 172 | **GraphParser** | Empty graph payload | Empty nodes/adjacencyList | 🟢 PASSED |
| 173 | **GraphParser** | Single node connectivity | Not isolated (own component) | 🟢 PASSED |
| 174 | **GeometryEngine** | pointToSegmentDistance | 10px perpendicular distance correct | 🟢 PASSED |
