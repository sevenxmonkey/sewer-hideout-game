/**
 * E. 叙事与事件 (Narrative & Events - 简化版)
 */
export interface ICondition {
  property: string; // keyof IPlayerState | 'dayNumber'
  operator: 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS';
  threshold: number;
}

export interface IEffect {
  property: string; // keyof IPlayerState
  value: number; // 正值或负值
}
