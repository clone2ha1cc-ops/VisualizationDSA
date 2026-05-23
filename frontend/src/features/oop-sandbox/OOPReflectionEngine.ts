/**
 * OOP Reflection Engine - Bộ máy mô phỏng phản xạ OOP & VTable Dynamic Dispatch
 *
 * Sprint 6: OOP Concepts Visualizer & VTable Sandboxing
 * - Class registration với kế thừa
 - Heap object instantiation với địa chỉ giả lập
 - VTable lookup cho đa hình động
 - Access modifier checking (public/protected/private)
 */

export type AccessModifier = 'PUBLIC' | 'PROTECTED' | 'PRIVATE';

export interface ClassMember {
  name: string;
  type: 'FIELD' | 'METHOD';
  accessModifier: AccessModifier;
  isOverridden?: boolean;
  value?: any;
}

export interface ClassDefinition {
  className: string;
  parentClass?: string;
  members: ClassMember[];
}

export interface HeapObjectInstance {
  address: string; // Địa chỉ nhớ giả lập dạng hexa: 0x7FFF00 + offset
  className: string;
  fieldsData: Map<string, any>;
  vTable: Map<string, string>; // Tên phương thức -> Lớp thực thi thực tế
}

export interface MethodDispatchResult {
  methodName: string;
  resolvedClass: string;
  actualImplementation: string;
  dispatchPath: string[]; // Ví dụ: ['Shape', 'Circle']
}

export interface AccessCheckResult {
  allowed: boolean;
  violation: boolean;
  message: string;
  modifier: AccessModifier;
}

export class OOPReflectionEngine {
  private static classesRegistry: Map<string, ClassDefinition> = new Map();
  private static addressOffset = 0;

  /**
   * Đăng ký một class vào hệ thống reflection
   */
  public static registerClass(config: ClassDefinition): void {
    this.classesRegistry.set(config.className, config);
  }

  /**
   * Lấy định nghĩa class
   */
  public static getClass(className: string): ClassDefinition | undefined {
    return this.classesRegistry.get(className);
  }

  /**
   * Khởi tạo đối tượng Heap Instance và tự động xây dựng bảng ảo VTable
   */
  public static instantiateObject(className: string): HeapObjectInstance {
    const classDef = this.classesRegistry.get(className);
    if (!classDef) {
      throw new Error(`Lớp ${className} chưa được đăng ký trong hệ thống.`);
    }

    // Sinh địa chỉ nhớ Hexa ngẫu nhiên giống RAM thật
    const memAddress = `0x${(3211264 + this.addressOffset).toString(16).toUpperCase().padStart(6, '0')}`;
    this.addressOffset += 16; // Nhảy ô địa chỉ tiếp theo

    const fields = new Map<string, any>();
    const vTable = new Map<string, string>();

    // 1. Duyệt chuỗi kế thừa để thu thập toàn bộ các phương thức
    const inheritanceChain: ClassDefinition[] = [];
    let current: ClassDefinition | undefined = classDef;
    while (current) {
      inheritanceChain.unshift(current); // Đẩy lớp cha lên trước để nạp đè sau
      current = current.parentClass
        ? this.classesRegistry.get(current.parentClass)
        : undefined;
    }

    // 2. Xây dựng bảng VTable từ cha xuống con (Dynamic Dispatch Resolution)
    for (const def of inheritanceChain) {
      for (const member of def.members) {
        if (member.type === 'FIELD') {
          // Chỉ thêm field nếu chưa có (shadowing)
          if (!fields.has(member.name)) {
            fields.set(member.name, member.value ?? null);
          }
        } else if (member.type === 'METHOD') {
          // Luôn ghi đè - phương thức cuối cùng trong chuỗi kế thừa wins
          vTable.set(member.name, def.className);
        }
      }
    }

    return {
      address: memAddress,
      className,
      fieldsData: fields,
      vTable,
    };
  }

  /**
   * Tra cứu VTable để tìm lớp thực sự thực thi phương thức (Dynamic Dispatch)
   */
  public static dispatchMethod(
    instance: HeapObjectInstance,
    methodName: string
  ): MethodDispatchResult | null {
    const resolvedClass = instance.vTable.get(methodName);
    if (!resolvedClass) {
      return null;
    }

    // Xây dựng đường đi kế thừa
    const dispatchPath: string[] = [];
    let current: ClassDefinition | undefined = this.getClass(instance.className);
    while (current) {
      dispatchPath.unshift(current.className);
      if (current.className === resolvedClass) break;
      current = current.parentClass
        ? this.getClass(current.parentClass)
        : undefined;
    }

    return {
      methodName,
      resolvedClass,
      actualImplementation: `${resolvedClass}.${methodName}()`,
      dispatchPath,
    };
  }

  /**
   * Kiểm tra quyền truy cập (Encapsulation Access Control)
   */
  public static checkAccess(
    targetClass: string,
    memberName: string,
    accessingClass?: string
  ): AccessCheckResult {
    const classDef = this.getClass(targetClass);
    if (!classDef) {
      return {
        allowed: false,
        violation: true,
        message: `Lớp ${targetClass} không tồn tại`,
        modifier: 'PRIVATE',
      };
    }

    const member = classDef.members.find((m) => m.name === memberName);
    if (!member) {
      // Có thể là inherited member
      if (classDef.parentClass) {
        return this.checkAccess(classDef.parentClass, memberName, accessingClass);
      }
      return {
        allowed: false,
        violation: true,
        message: `Thành viên ${memberName} không tồn tại`,
        modifier: 'PRIVATE',
      };
    }

    const modifier = member.accessModifier;

    // PUBLIC: Ai cũng truy cập được
    if (modifier === 'PUBLIC') {
      return {
        allowed: true,
        violation: false,
        message: 'Truy cập công khai cho phép',
        modifier,
      };
    }

    // PROTECTED: Chỉ class hiện tại và subclass
    if (modifier === 'PROTECTED') {
      if (!accessingClass || accessingClass === targetClass) {
        return {
          allowed: true,
          violation: false,
          message: 'Truy cập protected trong cùng class',
          modifier,
        };
      }

      // Kiểm tra xem accessingClass có phải là subclass không
      const isSubclass = this.isSubclass(accessingClass, targetClass);
      if (isSubclass) {
        return {
          allowed: true,
          violation: false,
          message: 'Truy cập protected từ subclass được cho phép',
          modifier,
        };
      }

      return {
        allowed: false,
        violation: true,
        message: `VI PHẠM: Không thể truy cập protected member ${memberName} từ ngoài class hierarchy`,
        modifier,
      };
    }

    // PRIVATE: Chỉ trong cùng class
    if (modifier === 'PRIVATE') {
      if (accessingClass === targetClass) {
        return {
          allowed: true,
          violation: false,
          message: 'Truy cập private trong cùng class',
          modifier,
        };
      }

      return {
        allowed: false,
        violation: true,
        message: `VI PHẠM ĐÓNG GÓI: Không thể truy cập private member ${memberName} từ bên ngoài!`,
        modifier,
      };
    }

    return {
      allowed: false,
      violation: true,
      message: 'Không xác định modifier',
      modifier: 'PRIVATE',
    };
  }

  /**
   * Kiểm tra xem class A có phải là subclass của class B không
   */
  private static isSubclass(classA: string, classB: string): boolean {
    let current: ClassDefinition | undefined = this.getClass(classA);
    while (current?.parentClass) {
      if (current.parentClass === classB) {
        return true;
      }
      current = this.getClass(current.parentClass);
    }
    return false;
  }

  /**
   * Lấy chuỗi kế thừa từ gốc đến class hiện tại
   */
  public static getInheritanceChain(className: string): string[] {
    const chain: string[] = [];
    let current: ClassDefinition | undefined = this.getClass(className);
    while (current) {
      chain.unshift(current.className);
      current = current.parentClass
        ? this.getClass(current.parentClass)
        : undefined;
    }
    return chain;
  }

  /**
   * Reset registry (dùng cho testing)
   */
  public static reset(): void {
    this.classesRegistry.clear();
    this.addressOffset = 0;
  }
}

export default OOPReflectionEngine;
