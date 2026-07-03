import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform, Animated, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const hasGoogleAds = !!NativeModules.RNGoogleMobileAdsModule;
import { Colors, Typography, Spacing, BorderRadius } from '../styles';

const TEST_UNIT_ID = 'ca-app-pub-3940256099942544/6300978111';
const PROD_UNIT_ID = Platform.OS === 'android'
  ? 'ca-app-pub-9552392941451192/1220365284'
  : 'ca-app-pub-9552392941451192/6095521087';
const UNIT_ID = __DEV__ ? TEST_UNIT_ID : PROD_UNIT_ID;

const SKIP_KEY = 'adPopup_skipDate';

export default function AdPopup({ visible, onClose }) {
  const [adMod, setAdMod] = React.useState(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!hasGoogleAds || Platform.OS === 'web') return;
    import('react-native-google-mobile-ads')
      .then(mod => setAdMod(mod))
      .catch(() => { onClose?.(); });
  }, []);

  // visible이 false가 되면 opacity 리셋
  React.useEffect(() => {
    if (!visible) fadeAnim.setValue(0);
  }, [visible]);

  if (!hasGoogleAds || Platform.OS === 'web') return null;

  const { BannerAd, BannerAdSize } = adMod || {};

  const handleAdLoaded = () => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  };

  const handleSkipToday = async () => {
    try {
      await AsyncStorage.setItem(SKIP_KEY, new Date().toDateString());
    } catch {}
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* 광고 로드 완료 후 페이드인 */}
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>

          <View style={styles.adArea}>
            {BannerAd && BannerAdSize && (
              <BannerAd
                unitId={UNIT_ID}
                size={BannerAdSize.MEDIUM_RECTANGLE}
                onAdLoaded={handleAdLoaded}
                onAdFailedToLoad={onClose}
              />
            )}
          </View>

          <TouchableOpacity style={styles.skipBtn} onPress={handleSkipToday}>
            <Text style={styles.skipTxt}>오늘 하루 보지 않기</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 14,
  },
  closeIcon: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  adArea: {
    width: 300,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtn: {
    width: 300,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  skipTxt: {
    ...Typography.body2Regular,
    color: Colors.gray500,
  },
});
