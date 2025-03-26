import { useCallback, useEffect } from 'react';
import { KeyboardEvent as ReactKeyboardEvent } from 'react';

interface UseKeyboardNavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  isEnabled?: boolean;
}

export const useKeyboardNavigation = ({
  onNext,
  onPrevious,
  isEnabled = true
}: UseKeyboardNavigationProps) => {
  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent) => {
      if (!isEnabled) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;

      if (modifierKey) {
        switch (event.key) {
          case 'ArrowRight':
          case 'Enter':
            event.preventDefault();
            onNext();
            break;
          case 'ArrowLeft':
          case 'Backspace':
            event.preventDefault();
            onPrevious();
            break;
        }
      }
    },
    [onNext, onPrevious, isEnabled]
  );

  useEffect(() => {
    const handleGlobalKeyDown = (event: globalThis.KeyboardEvent) => {
      if (!isEnabled) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;

      if (modifierKey) {
        switch (event.key) {
          case 'ArrowRight':
          case 'Enter':
            event.preventDefault();
            onNext();
            break;
          case 'ArrowLeft':
          case 'Backspace':
            event.preventDefault();
            onPrevious();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onNext, onPrevious, isEnabled]);

  return { handleKeyDown };
}; 