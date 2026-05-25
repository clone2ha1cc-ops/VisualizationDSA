import type { Ref } from 'vue';
import type { UMLNode, UMLLink } from '../types/design-patterns.types';
import { DesignPatternVisualizerEngine } from '../engine/DesignPatternVisualizerEngine';

/**
 * Áp dụng trạng thái DIP bật: thêm interface IDatabase và thay thế links.
 */
export function applyDIPEnabled(
  nodes: Ref<UMLNode[]>,
  links: Ref<UMLLink[]>,
): void {
  nodes.value.push({
    id: 'IDatabase',
    name: 'IDatabase',
    type: 'interface',
    x: 200,
    y: 200,
    width: 180,
    height: 60,
    attributes: [],
    methods: ['+ query(sql): ResultSet'],
  });
  links.value = [
    { id: 'HighToInterface', sourceId: 'HighModule', targetId: 'IDatabase', type: 'dependency' },
    { id: 'LowToInterface',  sourceId: 'LowModule',  targetId: 'IDatabase', type: 'realization' },
  ];
}

/**
 * Áp dụng trạng thái DIP tắt: xóa interface IDatabase và khôi phục direct coupling.
 */
export function applyDIPDisabled(
  nodes: Ref<UMLNode[]>,
  links: Ref<UMLLink[]>,
): void {
  nodes.value = nodes.value.filter(n => n.id !== 'IDatabase');
  links.value = [
    { id: 'DirectCoupling', sourceId: 'HighModule', targetId: 'LowModule', type: 'dependency' },
  ];
}

/**
 * Tái khởi tạo DesignPatternVisualizerEngine sau khi thay đổi nodes/links.
 */
export function rebuildEngine(
  nodes: Ref<UMLNode[]>,
  links: Ref<UMLLink[]>,
): DesignPatternVisualizerEngine {
  return new DesignPatternVisualizerEngine(nodes.value, links.value);
}
