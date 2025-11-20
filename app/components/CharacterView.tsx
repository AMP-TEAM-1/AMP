import { Item } from '@/data/items';
import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { ThemedText } from './themed-text';

//const rabbitImage = require('@/assets/images/item/rabbit.png');
const rabbitImage = require('../../assets/images/item/rabbit.png');

interface CharacterViewProps {
  carrots: number;
  equippedItems?: Item[];
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
  equippedItems = [], // 기본값을 빈 배열로 설정
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
        {/* 장착된 아이템들을 캐릭터 위에 겹쳐서 렌더링합니다. */}
        {equippedItems.map((item) => {          
          // ✅ [수정] 액세서리 종류에 따라 다른 스타일을 적용하는 함수
          const getAccessoryStyle = (item: Item) => {
            // TODO: 아래 ID를 실제 데이터베이스의 아이템 ID로 변경해주세요.
            if (item.item_id === 4) { // 예: 하트 액세서리 ID가 101일 경우
              return styles.heartAccessoryItem;
            }
            if (item.item_id === 5) { // 예: 나비넥타이 ID가 102일 경우
              return styles.bowtieAccessoryItem;
            }
            return styles.accessoryItem; // 기본 액세서리 스타일
          };
          
          // ✅ [수정] 아이템 타입에 따라 스타일을 결정하는 로직
          const itemStyle = 
            item.type === 'hat' ? styles.hatItem :
            item.type === 'accessory' ? getAccessoryStyle(item) :
            item.type === 'background' ? styles.backgroundItem :
            {};
          
          return (
            <Image key={item.item_id} source={item.image} style={[styles.equippedItem, itemStyle]} resizeMode="contain" />
          );
        })}
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
  equippedItem: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  hatItem: {
    // 모자 아이템의 위치와 크기 조정
    width: '40%',
    height: '40%',
    top: '5%',
  },
  accessoryItem: {
    // 장신구 아이템의 위치와 크기 조정
    width: '25%',
    height: '25%',
    top: '52%',
  },
  // ✅ [추가] 하트 액세서리 전용 스타일
  heartAccessoryItem: {
    width: '17%',
    height: '17%',
    top: '63%',
    left: '53%',
  },
  // ✅ [추가] 나비넥타이 전용 스타일
  bowtieAccessoryItem: {
    width: '25%',
    height: '25%',
    top: '52%',
    // 기본 accessoryItem과 동일한 위치이므로 left, right 조정 불필요
  },
  backgroundItem: {
    // 배경 아이템은 캐릭터 뒤에 위치하도록 zIndex 설정
    zIndex: -1,
    opacity: 0.8,
  },
});