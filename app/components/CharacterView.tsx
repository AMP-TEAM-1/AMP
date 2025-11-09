import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { ThemedText } from './themed-text';

//const rabbitImage = require('@/assets/images/item/rabbit.png');
const rabbitImage = require('../../assets/images/item/rabbit.png');

interface CharacterViewProps {
  carrots: number;
  isSheetMinimized: boolean;
  isHandleTouched: boolean;
  animatedRabbitStyle: StyleProp<ViewStyle>;
}

/**
 * 마이페이지의 상단 영역을 담당하는 컴포넌트입니다.
 * 사용자의 캐릭터(토끼), 보유 재화(캐롯), 인벤토리 이동 버튼을 표시합니다.
 * Bottom Sheet의 상태에 따라 캐릭터의 위치와 크기가 애니메이션으로 변경됩니다.
 */
export default function CharacterView({
  carrots,
  isSheetMinimized,
  isHandleTouched,
  animatedRabbitStyle,
}: CharacterViewProps) {
  return (
    <View style={styles.characterSection}>
      {/* 당근 재화 표시 */}
      <View style={styles.carrotContainer}>
        <ThemedText style={styles.carrotText}>🥕 {carrots}</ThemedText>
      </View>

      {/* 인벤토리 이동 버튼 (바텀시트가 최소화되었을 때만 보임) */}
      {isSheetMinimized && !isHandleTouched && (
        <Pressable
          style={styles.inventoryButton}
          onPress={() => router.push('/page/inventory')}
        >
          <ThemedText style={styles.inventoryButtonText}>인벤토리 &gt;</ThemedText>
        </Pressable>
      )}

      {/* 애니메이션이 적용된 캐릭터 이미지 */}
      <Animated.View style={[styles.rabbitContainer, animatedRabbitStyle]}>
        <Image source={rabbitImage} style={styles.rabbitImage} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  characterSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
    pointerEvents: 'box-none',
  },
  carrotContainer: {
    position: 'absolute',
    top: 60, // AppHeader의 높이(60px)만큼 아래로 내려서 겹치지 않게 합니다.
    left: 20,
    paddingVertical: 11,
    backgroundColor: 'transparent',
  },
  carrotText: {
    fontSize: 18,
    fontFamily: 'Jua',
    fontWeight: 'bold',
  },
  inventoryButton: {
    position: 'absolute',
    top: 120, // 버튼을 아래로 조금 더 내리기 위해 top 값을 증가시킵니다.
    right: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inventoryButtonText: {
    fontFamily: 'Jua',
    color: '#49454F',
  },
  rabbitContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rabbitImage: {
    width: 220,
    height: 220,
  },
});