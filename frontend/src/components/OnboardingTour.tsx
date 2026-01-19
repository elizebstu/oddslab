import { useState, useEffect, useCallback, useMemo } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import type { CallBackProps, Step } from 'react-joyride';
import { onboardingService } from '../services/onboardingService';
import { getTourConfig } from '../config/onboarding';
import type { PageName } from '../config/onboarding';

interface OnboardingTourProps {
  pageName: PageName;
  run?: boolean;
}

// Hoist static styles object
const JOYRIDE_STYLES = {
  options: {
    zIndex: 10000,
    primaryColor: '#00ffff',
  },
  tooltip: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    fontSize: '14px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
    border: '1px solid rgba(0, 255, 255, 0.2)',
  },
  tooltipTitle: {
    color: '#00ffff',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tooltipContent: {
    color: '#e0e0e0',
    fontSize: '14px',
    lineHeight: '1.6',
    padding: '0',
  },
  buttonBack: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '6px',
    color: '#ffffff',
    marginRight: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  buttonNext: {
    backgroundColor: '#00ffff',
    border: 'none',
    borderRadius: '6px',
    color: '#000000',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  buttonSkip: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '12px',
    padding: '8px',
  },
  buttonClose: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '12px',
    padding: '8px',
    cursor: 'pointer',
  },
  spotlight: {
    borderRadius: '8px',
  },
} as const;

const JOYRIDE_LOCALE = {
  last: '完成',
  next: '下一步',
  skip: '跳过',
  back: '上一步',
  close: '关闭',
} as const;

/**
 * Filter steps to only include those whose targets exist in the DOM
 * Note: 'body' target always exists for centered tooltips
 */
function filterValidSteps(steps: Step[]): Step[] {
  return steps.filter(step => {
    const target = step.target as string;
    if (typeof target !== 'string') return true;
    // 'body' target always exists
    if (target === 'body') return true;
    return document.querySelector(target) !== null;
  });
}

function OnboardingTour({ pageName, run = true }: OnboardingTourProps) {
  const [shouldRun, setShouldRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const fetchStatus = async () => {
      try {
        const status = await onboardingService.getOnboardingStatus();
        if (!isMounted) return;

        const pageCompleted = status[pageName];
        if (!pageCompleted && run) {
          const tourSteps = getTourConfig(pageName);

          // Wait for page to render, then validate targets
          timeoutId = setTimeout(() => {
            if (!isMounted) return;

            const validSteps = filterValidSteps(tourSteps);

            if (validSteps.length > 0) {
              setSteps(validSteps);
              setShouldRun(true);
            } else {
              onboardingService.updateOnboardingStatus(pageName, true).catch(err => {
                console.error('Failed to mark incomplete tour as done:', err);
              });
            }
          }, 800);
        }
      } catch (error) {
        console.error('Failed to fetch onboarding status:', error);
        setShouldRun(false);
      }
    };

    fetchStatus();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pageName, run]);

  const handleJoyrideCallback = useCallback(async (data: CallBackProps) => {
    const { status, action } = data;

    // Handle tour completion or skip
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setShouldRun(false);
      try {
        await onboardingService.updateOnboardingStatus(pageName, true);
      } catch (error) {
        console.error('Failed to update onboarding status:', error);
      }
    }

    // Handle close button click
    if (action === 'close') {
      setShouldRun(false);
      try {
        await onboardingService.updateOnboardingStatus(pageName, true);
      } catch (error) {
        console.error('Failed to update onboarding status:', error);
      }
    }
  }, [pageName]);

  const locale = useMemo(() => JOYRIDE_LOCALE, []);

  if (steps.length === 0) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={shouldRun}
      continuous
      showProgress={false}
      showSkipButton
      callback={handleJoyrideCallback}
      styles={JOYRIDE_STYLES}
      locale={locale}
      disableCloseOnEsc={false}
      disableOverlayClose={false}
      tooltip={{
        ...JOYRIDE_STYLES.tooltip,
      }}
    />
  );
}

export default OnboardingTour;
