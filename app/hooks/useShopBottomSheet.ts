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

  // Bottom Sheet의 높이와 최소화되었을 때의 높이를 정의합니다.
  const sheetHeight = screenHeight * 0.45;

  // 최소화 상태일 때 보여줄 높이를 정의합니다. 이 값은 화면 비율과 무관하게 일정해야 합니다.
  // 핸들 높이(약 30px) + 카테고리 탭 높이(약 45px) = 약 75px
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
      // 드래그하는 동안 위치 업데이트 (위로 스크롤 방지)
      translateY.value = Math.max(context.value.y + event.translationY, 0);
    })
    .onEnd((event) => {
      // 제스처가 끝났을 때, 특정 임계값 또는 속도를 기준으로 시트를 닫거나 열기
      if (event.translationY > sheetHeight / 3 || event.velocityY > 500) {
        // 아래로 충분히 스와이프하면 시트를 최소화합니다.
        translateY.value = withSpring(minimizedPosition, { damping: 90 });
        runOnJS(setIsSheetMinimized)(true);
        runOnJS(setSelectedCategory)(null); // 시트가 내려가면 카테고리 선택 해제
      } else {
        // 그렇지 않으면 원래 위치로 복귀
        translateY.value = withSpring(0, { damping: 100 });
        runOnJS(setIsSheetMinimized)(false);
        if (!selectedCategory) {
          runOnJS(setSelectedCategory)('모자'); // 시트가 올라가면 '모자'를 기본 선택
        }
      }
    })
    .onFinalize(() => {
      runOnJS(setIsHandleTouched)(false);
    });

  // 카테고리 탭을 누를 때 실행되는 함수
  const handleTabPress = (category: ItemCategory) => {
    translateY.value = withSpring(0, { damping: 50 });
    setIsSheetMinimized(false);
    setSelectedCategory(category);
  };

  // Bottom Sheet의 애니메이션 스타일
  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // 토끼 캐릭터의 애니메이션 스타일
  const animatedRabbitStyle = useAnimatedStyle(() => {
    const headerHeight = 60; // 상단 헤더 높이
    const rabbitImageHeight = 220; // 토끼 이미지 높이

    // 바텀시트가 최대로 확장되었을 때의 상단 Y 좌표
    const sheetTopY = screenHeight - sheetHeight;
    // 헤더와 바텀시트 사이의 공간 높이
    const availableSpace = sheetTopY - headerHeight;
    // 헤더와 바텀시트 사이 공간의 중앙 Y좌표를 계산하고, 추가로 20px 위로 올립니다.
    const expandedRabbitY = headerHeight + (availableSpace - rabbitImageHeight) / 2 - 30;
    
    // 최소화 상태일 때의 토끼 Y 위치
    const minimizedRabbitY = screenHeight / 2 - 150;

    const rabbitTranslateY = interpolate(translateY.value, [0, minimizedPosition], [expandedRabbitY, minimizedRabbitY]);
    const rabbitScale = interpolate(translateY.value, [0, minimizedPosition], [1, 1.25]);
    return {
      transform: [{ translateY: rabbitTranslateY }, { scale: rabbitScale }],
    };
  });

  return { panGesture, animatedSheetStyle, animatedRabbitStyle, selectedCategory, isSheetMinimized, isHandleTouched, handleTabPress };
}