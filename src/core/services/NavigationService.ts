import { useGame } from '../../store/GameContext';

export function useNavigationService() {
  const { moveTo, advanceTime } = useGame();

  // delegate to context helpers which centralize time and hunger handling
  function goTo(targetLocationId: string) {
    moveTo(targetLocationId);
  }

  return { moveTo: goTo, advanceTime };
}
