import { ItemCategory } from '@/data/items';
import { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface UseShopBottomSheetOptions {
  initialState?: 'expanded' | 'minimized';
}

export function useShopBottomSheet(options: UseShopBottomSheetOptions = {}) {
  const { initialState = 'expanded' } = options;
  const { height: screenHeight } = useWindowDimensions();
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);
  const [isHandleTouched, setIsHandleTouched] = useState(false);

  const sheetHeight = screenHeight * 0.45;
  const partialVisibleHeight = 89;
  const minimizedPosition = sheetHeight - partialVisibleHeight;

  const translateY = useSharedValue(initialState === 'minimized' ? minimizedPosition : 0);
  const [isSheetMinimized, setIsSheetMinimized] = useState(initialState === 'minimized');

  // 제스처 컨텍스트를 저장하기 위한 공유 값
  const context = useSharedValue({ y: 0 });

  // 드래그 제스처 정의
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      runOnJS(setIsHandleTouched)(true);
    })
    .onStart(() => {
      context.value = { y: translateY.value }; // 제스처 시작 시 현재 위치 저장
    })
    .onUpdate((event) => {
      translateY.value = Math.max(context.value.y + event.translationY, 0);
    })
    .onEnd((event) => {
      if (event.translationY > sheetHeight / 3 || event.velocityY > 500) {
        translateY.value = withSpring(minimizedPosition, { damping: 90 });
        runOnJS(setIsSheetMinimized)(true);
        runOnJS(setSelectedCategory)(null); 
      } else {
        translateY.value = withSpring(0, { damping: 100 });
        runOnJS(setIsSheetMinimized)(false);
        if (!selectedCategory) {
          runOnJS(setSelectedCategory)('모자'); 
        }
      }
    })
    .onFinalize(() => {
      runOnJS(setIsHandleTouched)(false);
    });

  const handleTabPress = (category: ItemCategory) => {
    translateY.value = withSpring(0, { damping: 50 });
    setIsSheetMinimized(false);
    setSelectedCategory(category);
  };

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedRabbitStyle = useAnimatedStyle(() => {
    const headerHeight = 60; 
    const rabbitImageHeight = 220; 
    const sheetTopY = screenHeight - sheetHeight;
    const availableSpace = sheetTopY - headerHeight;
    const expandedRabbitY = headerHeight + (availableSpace - rabbitImageHeight) / 2 - 30;
    const minimizedRabbitY = screenHeight / 2 - 150;

    const rabbitTranslateY = interpolate(translateY.value, [0, minimizedPosition], [expandedRabbitY, minimizedRabbitY]);
    const rabbitScale = interpolate(translateY.value, [0, minimizedPosition], [1, 1.25]);
    return {
      transform: [{ translateY: rabbitTranslateY }, { scale: rabbitScale }],
    };
  });

  return { panGesture, animatedSheetStyle, animatedRabbitStyle, selectedCategory, isSheetMinimized, isHandleTouched, handleTabPress };
}