// --- Discriminated union payload types for each action ---

export interface InstantiatePayload {
  className: string;
}

export interface CallMethodPayload {
  methodName: string;
  state: 'seeking' | 'resolved';
  targetClass?: string;
}

export interface ViolateAccessPayload {
  className: string;
  memberName: string;
}

export interface ValidateSetterPayload {
  memberName: string;
  value: number;
}

export interface CloneMembersPayload {
  className: string;
}

export interface ShowAbstractErrorPayload {
  className: string;
}

// --- Discriminated union: ScenarioStep ---

interface ScenarioStepBase {
  codeLineIndex: number;
  explanation: string;
}

export interface ResetStep extends ScenarioStepBase {
  actionName: 'RESET';
}

export interface InstantiateStep extends ScenarioStepBase {
  actionName: 'INSTANTIATE';
  actionPayload: InstantiatePayload;
}

export interface CallMethodStep extends ScenarioStepBase {
  actionName: 'CALL_METHOD';
  actionPayload: CallMethodPayload;
}

export interface ViolateAccessStep extends ScenarioStepBase {
  actionName: 'VIOLATE_ACCESS';
  actionPayload: ViolateAccessPayload;
}

export interface ValidateSetterStep extends ScenarioStepBase {
  actionName: 'VALIDATE_SETTER';
  actionPayload: ValidateSetterPayload;
}

export interface CloneMembersStep extends ScenarioStepBase {
  actionName: 'CLONE_MEMBERS';
  actionPayload: CloneMembersPayload;
}

export interface ShowAbstractErrorStep extends ScenarioStepBase {
  actionName: 'SHOW_ABSTRACT_ERROR';
  actionPayload: ShowAbstractErrorPayload;
}

export type ScenarioStep =
  | ResetStep
  | InstantiateStep
  | CallMethodStep
  | ViolateAccessStep
  | ValidateSetterStep
  | CloneMembersStep
  | ShowAbstractErrorStep;

export type ScenarioActionPayload =
  | InstantiatePayload
  | CallMethodPayload
  | ViolateAccessPayload
  | ValidateSetterPayload
  | CloneMembersPayload
  | ShowAbstractErrorPayload;

export interface OOPScenario {
  id: string;
  title: string;
  description: string;
  codeLines: string[];
  steps: ScenarioStep[];
}

export const OOP_SCENARIOS: OOPScenario[] = [
  {
    id: 'encapsulation',
    title: '🔒 Đóng gói (Encapsulation)',
    description: 'Hạn chế truy cập trực tiếp vào thuộc tính nội bộ. Bảo vệ radius bằng private và kiểm soát qua setter.',
    codeLines: [
      '// 1. Tạo đối tượng Circle',
      'Circle circle = new Circle();',
      '',
      '// 2. Cố gắng thay đổi trường private trực tiếp',
      'circle.radius = -10; // ❌ Bị chặn (Access Denied)',
      '',
      '// 3. Sử dụng Setter an toàn để cập nhật',
      'circle.setRadius(10); // ✅ Hợp lệ (Validated)'
    ],
    steps: [
      {
        codeLineIndex: 1,
        explanation: 'Khởi tạo đối tượng `Circle`. Trường `radius` được đánh dấu PRIVATE (khóa đỏ). Không cho phép truy cập trực tiếp từ bên ngoài.',
        actionName: 'INSTANTIATE',
        actionPayload: { className: 'Circle' }
      },
      {
        codeLineIndex: 4,
        explanation: 'Cố ý gán trực tiếp `circle.radius = -10`. Trình kiểm tra đóng gói phát hiện trường radius là PRIVATE $\rightarrow$ Kích hoạt cảnh báo lỗi truy cập và rung thẻ lớp Circle.',
        actionName: 'VIOLATE_ACCESS',
        actionPayload: { className: 'Circle', memberName: 'radius' }
      },
      {
        codeLineIndex: 7,
        explanation: 'Thay vì gán trực tiếp, gọi phương thức `circle.setRadius(10)`. Con trỏ laser bắn từ Heap Object đến phương thức `setRadius()` của Circle trong class card.',
        actionName: 'CALL_METHOD',
        actionPayload: { methodName: 'setRadius', state: 'seeking' }
      },
      {
        codeLineIndex: 7,
        explanation: 'Setter được thực thi. Hệ thống kiểm tra điều kiện `value > 0`. Thỏa mãn! Giá trị radius trên Heap được cập nhật thành 10 với hiệu ứng nhấp nháy xanh lục.',
        actionName: 'VALIDATE_SETTER',
        actionPayload: { memberName: 'radius', value: 10 }
      }
    ]
  },
  {
    id: 'inheritance',
    title: '🧬 Kế thừa (Inheritance)',
    description: 'Lớp con Circle thừa hưởng tất cả thuộc tính và phương thức (draw, area) được định nghĩa từ lớp cha Shape.',
    codeLines: [
      '// 1. Circle kế thừa (extends) Shape',
      '// Shape định nghĩa draw()',
      'Circle circle = new Circle();',
      '',
      '// 2. Gọi draw() được kế thừa',
      'circle.draw(); // Chạy Shape.draw()'
    ],
    steps: [
      {
        codeLineIndex: 2,
        explanation: 'Circle kế thừa Shape. Các phương thức của Shape (`draw()`, `area()`) được tự động sao chép xuống Circle dưới dạng "phương thức kế thừa" (Faded màu).',
        actionName: 'CLONE_MEMBERS',
        actionPayload: { className: 'Circle' }
      },
      {
        codeLineIndex: 2,
        explanation: 'Khởi tạo `Circle` trên Heap. Trong VTable của Circle, do không ghi đè (override) `draw()`, con trỏ hàm sẽ trỏ thẳng tới `Shape.draw()`.',
        actionName: 'INSTANTIATE',
        actionPayload: { className: 'Circle' }
      },
      {
        codeLineIndex: 5,
        explanation: 'Gọi `circle.draw()`. Trình dịch tra cứu VTable của Circle và thấy phương thức trỏ về lớp cha Shape.',
        actionName: 'CALL_METHOD',
        actionPayload: { methodName: 'draw', state: 'seeking' }
      },
      {
        codeLineIndex: 5,
        explanation: 'Quyết định định tuyến thành công! Laser rẽ nhánh và bắn trực tiếp vào ô phương thức `Shape.draw()`. Cuộc gọi được đưa vào Call Stack: `Shape.draw()`.',
        actionName: 'CALL_METHOD',
        actionPayload: { methodName: 'draw', state: 'resolved', targetClass: 'Shape' }
      }
    ]
  },
  {
    id: 'polymorphism',
    title: '🎭 Đa hình (Polymorphism)',
    description: 'Biến Shape trỏ tới Circle. Khi gọi draw(), Runtime tự động định tuyến tới Circle.draw() nhờ bảng ảo VTable.',
    codeLines: [
      '// 1. Biến Shape trỏ vào Circle mới',
      'Shape shape = new Circle();',
      '',
      '// 2. Gọi draw() ghi đè',
      'shape.draw(); // Thực hiện Circle.draw() ở Runtime'
    ],
    steps: [
      {
        codeLineIndex: 1,
        explanation: 'Khai báo biến `shape` kiểu `Shape` nhưng cấp phát đối tượng `Circle` thực tế trên Heap. Kiểu Runtime của shape là `Circle`.',
        actionName: 'INSTANTIATE',
        actionPayload: { className: 'Circle' }
      },
      {
        codeLineIndex: 4,
        explanation: 'Gọi `shape.draw()`. Trình thông dịch tra cứu bảng VTable của đối tượng thực tế `Circle` trên Heap ảo.',
        actionName: 'CALL_METHOD',
        actionPayload: { methodName: 'draw', state: 'seeking' }
      },
      {
        codeLineIndex: 4,
        explanation: 'Dynamic Dispatch thành công! VTable chỉ ra rằng `draw` đã bị ghi đè bởi `Circle`. Laser đổi hướng trỏ thẳng tới `Circle.draw()`. Phương thức cha `Shape.draw()` bị mờ đi.',
        actionName: 'CALL_METHOD',
        actionPayload: { methodName: 'draw', state: 'resolved', targetClass: 'Circle' }
      }
    ]
  },
  {
    id: 'abstraction',
    title: '📐 Trừu tượng (Abstraction)',
    description: 'Shape là lớp abstract chứa phương thức trừu tượng draw(). Cấm khởi tạo Shape trực tiếp; Circle phải implements draw().',
    codeLines: [
      '// 1. Cố gắng tạo instance lớp trừu tượng',
      'Shape shape = new Shape(); // ❌ Lỗi! Không thể khởi tạo',
      '',
      '// 2. Cấp phát qua lớp con cụ thể',
      'shape = new Circle();',
      'shape.draw(); // Gọi draw() cụ thể của Circle'
    ],
    steps: [
      {
        codeLineIndex: 1,
        explanation: 'Lớp `Shape` có nhãn <<abstract>> và phương thức `draw()` không có thân hàm (abstract). Cố ý khởi tạo `new Shape()` sẽ bị trình biên dịch chặn lại ngay lập tức.',
        actionName: 'SHOW_ABSTRACT_ERROR',
        actionPayload: { className: 'Shape' }
      },
      {
        codeLineIndex: 4,
        explanation: 'Khởi tạo đối tượng `Circle` (lớp con cụ thể đã thực thi đầy đủ hợp đồng). Biến `shape` trỏ tới `Circle` thành công trên Heap.',
        actionName: 'INSTANTIATE',
        actionPayload: { className: 'Circle' }
      },
      {
        codeLineIndex: 5,
        explanation: 'Gọi `shape.draw()`. Nhờ tính trừu tượng, hệ thống định tuyến VTable trực tiếp đến cài đặt cụ thể `Circle.draw()`.',
        actionName: 'CALL_METHOD',
        actionPayload: { methodName: 'draw', state: 'resolved', targetClass: 'Circle' }
      }
    ]
  }
];
