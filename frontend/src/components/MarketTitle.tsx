import { memo } from 'react';
import { useTranslate } from '../hooks/useTranslate';

interface MarketTitleProps {
  text: string;
}

/**
 * MarketTitle component that translates market titles dynamically.
 * Memoized to prevent unnecessary re-renders since translation is expensive.
 */
function MarketTitle({ text }: MarketTitleProps) {
  const translated = useTranslate(text);
  return <>{translated}</>;
}

export default memo(MarketTitle, (prevProps, nextProps) => {
  return prevProps.text === nextProps.text;
});
