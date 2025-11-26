import type { IPlayerState } from './IPlayerState';
import type { IRuntimeState } from './IRuntimeState';
import type { IMapState } from './IMapState';
import type { ICondition, IEffect } from './INarrative';

/**
 * @interface IGlobalStorage
 * 整合所有主要状态的单一来源。
 */
export interface IGlobalStorage {
  player: IPlayerState;
  runtime: IRuntimeState;
  map: IMapState;
}

export type { IPlayerState, IRuntimeState, IMapState, ICondition, IEffect };
