import React, { useRef, useState } from 'react';
import {
  View, Text, Image, FlatList, StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Navigator from '../components/Navigator';
import Button from '../components/Button';
import { Colors, Typography, Spacing } from '../styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = Math.min(SCREEN_WIDTH, 400);

const SLIDES = [
  {
    id: '1',
    image: require('../assets/img_onboarding01.png'),
    text: '읽는 중인 책을 바로 기록하거나,\n새로운 독서를 기록할 수 있어요',
  },
  {
    id: '2',
    image: require('../assets/img_onboarding02.png'),
    text: '도토리룸에서 나의 모든\n독서 기록을 확인할 수 있어요',
  },
  {
    id: '3',
    image: require('../assets/img_onboarding03.png'),
    text: '나만의 독서 기록을 하고\n카드를 저장할 수 있어요',
  },
  {
    id: '4',
    image: require('../assets/img_onboarding04.png'),
    text: '도토리에서 다른 사람들과\n독후감을 공유를 시작해볼까요?',
  },
];

export default function OnboardingScreen({ onFinish }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      onFinish();
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} resizeMode="contain" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.contentArea}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          scrollEventThrottle={16}
          style={styles.flatList}
        />

        <View style={styles.textContainer}>
          <Text style={styles.text}>{SLIDES[activeIndex].text}</Text>
        </View>

        <View style={styles.navigatorContainer}>
          <Navigator total={SLIDES.length} active={activeIndex} />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button variant="primary" size="xxlarge" onPress={handleNext}>
          {activeIndex === SLIDES.length - 1 ? '시작하기' : '다음'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
  },
  flatList: {
    height: 400,
    flexGrow: 0,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  textContainer: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xxl,
    alignItems: 'center',
  },
  text: {
    ...Typography.headline3Medium,
    color: Colors.gray900,
    textAlign: 'center',
  },
  navigatorContainer: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
});
