import { baseItemStyle, Item, itemStyleMap } from '@/data/items';
import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { ThemedText } from './themed-text';


const rabbitImage = require('../../assets/images/item/rabbit.png');

interface CharacterViewProps {
  carrots: number;
  equippedItems?: Item[];
  isSheetMinimized: boolean;
  isHandleTouched: boolean;
  animatedRabbitStyle: StyleProp<ViewStyle>;
}

export default function CharacterView({
  carrots,
  equippedItems = [], 
  isSheetMinimized,
  isHandleTouched,
  animatedRabbitStyle,
}: CharacterViewProps) {
  return (
    <View style={styles.characterSection}>
      {/* 당근 재화 표시 */}
      <View style={styles.carrotContainer}>
        <ThemedText style={styles.carrotEmoji}>🥕</ThemedText>
        <ThemedText style={styles.carrotText}>{carrots}</ThemedText>
      </View>

      {/* 인벤토리 이동 버튼 */}
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
        {equippedItems.map((item) => {
          const individualStyle = itemStyleMap[item.item_id];
          const typeStyle = baseItemStyle[item.type] || {};
          const itemStyle = individualStyle || typeStyle;

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
    top: 70, 
    left: 24,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  carrotEmoji: {
    fontSize: 20,
    lineHeight: 24,
  },
  carrotText: {
    fontSize: 18,
    fontFamily: 'Cafe24Ssurround',
    fontWeight: 'bold',
    lineHeight: 24,
    color: '#212529',
  },
  inventoryButton: {
    position: 'absolute',
    top: 70, 
    right: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  inventoryButtonText: {
    fontFamily: 'Cafe24Ssurround',
    color: '#49454F',
    fontSize: 15,
    fontWeight: '600',
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
});