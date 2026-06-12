import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';

const TEST_ID = 'ca-app-pub-3940256099942544/5662855259';
const PROD_ID = 'ca-app-pub-9552392941451192/1894404277';
const AD_UNIT_ID = __DEV__ ? TEST_ID : PROD_ID;

let admobInitialized = false;

export default function useAppOpenAd(isLoggedIn) {
  const adRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'web' || !isLoggedIn) return;

    let subscription;
    let isMounted = true;

    const run = async () => {
      try {
        const { default: mobileAds, AppOpenAd, AdEventType } = await import('react-native-google-mobile-ads');

        if (!admobInitialized) {
          await mobileAds().initialize();
          admobInitialized = true;
        }

        const loadAd = () => {
          if (!isMounted) return;
          try {
            const ad = AppOpenAd.createForAdRequest(AD_UNIT_ID);
            ad.addAdEventListener(AdEventType.LOADED, () => {
              if (isMounted) isAdLoaded.current = true;
            });
            ad.addAdEventListener(AdEventType.CLOSED, () => {
              if (isMounted) {
                isAdLoaded.current = false;
                loadAd();
              }
            });
            ad.addAdEventListener(AdEventType.ERROR, () => {
              if (isMounted) isAdLoaded.current = false;
            });
            adRef.current = ad;
            ad.load();
          } catch (e) {
          }
        };

        loadAd();

        subscription = AppState.addEventListener('change', (nextState) => {
          if (appState.current.match(/inactive|background/) && nextState === 'active') {
            if (isAdLoaded.current && adRef.current) {
              adRef.current.show().catch(() => {});
            }
          }
          appState.current = nextState;
        });
      } catch (e) {
      }
    };

    run();

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, [isLoggedIn]);
}
