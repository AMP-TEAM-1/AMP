import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Image, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { tokenStorage } from './storage';
import * as RawShopData from './shopItems.json'; // 임시 데이터 소스

// --- 상수 및 타입 정의 ---
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

type ItemCategory = '모자' | '장신구' | '배경';
const CATEGORIES: ItemCategory[] = ['모자', '장신구', '배경'];

const CATEGORY_MAP: Record<ItemCategory, string> = {
  '모자': 'hat',
  '장신구': 'accessory',
  '배경': 'background',
};

// API 명세서에 맞는 아이템 타입 정의
type Item = { id: string; item_id: number; name: string; price: number; type: string; image?: any; is_equipped?: boolean; };

// 이미지 매핑 (mypage.tsx와 동일하게 유지)
const imageMap: { [key: string]: any } = {
    'h1': require('../assets/images/item/strawHat.png'),
    'h2': require('../assets/images/item/cowboyHat.png'),
    'h3': require('../assets/images/item/chefsHat.png'),
    'h4': require('../assets/images/item/santa-hat.png'),
    'h5': require('../assets/images/item/birthdayHat.png'),
    'h6': require('../assets/images/item/crown.png'),
    'a1': require('../assets/images/item/heart-accessory.png'),
    'a2': require('../assets/images/item/bowtie.png'),
    'a3': require('../assets/images/item/necktie.png'),
    'a4': require('../assets/images/item/dot-ribbon.png'),
    'a5': require('../assets/images/item/scarf.png'),
    'a6': require('../assets/images/item/ribbon.png'),
    'b1': require('../assets/images/item/tulip-bg.png'),
    'b2': require('../assets/images/item/cactus-bg.png'),
    'b3': require('../assets/images/item/snowman-bg.png'),
    'b4': require('../assets/images/item/birthday-bg.png'),
    'b5': require('../assets/images/item/cake-bg.png'),
    'b6': require('../assets/images/item/stairs-bg.png'),
};

export default function InventoryScreen() {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('모자');
  const [inventoryItems, setInventoryItems] = useState<Item[]>([]);
  const [carrots, setCarrots] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const getAuthHeaders = async () => {
    const token = await tokenStorage.getItem();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // 임시: 로컬 JSON에서 일부 아이템을 "보유"한 것으로 가정합니다.
  // 실제로는 '/api/v1/users/me/items' 같은 API를 호출해야 합니다.
  const fetchInventoryItems = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      // // 명세서에 맞게 엔드포인트 수정: /api/v1/inventory (현재는 임시 데이터를 위해 주석 처리)
      // const response = await axios.get(`${API_URL}/api/v1/inventory`, { headers });

      // --- 임시 로직 ---
      // 모자 4개, 장신구 2개, 배경 0개를 보유한 것으로 가정
      const shopData = ('default' in RawShopData ? RawShopData.default : RawShopData) as { [key in ItemCategory]: any[] };

      const ownedHats = (shopData['모자'] || []).slice(0, 4).map(item => ({
        ...item,
        item_id: item.id,
        type: 'hat',
        image: imageMap[item.id] || null,
      }));

      const ownedAccessories = (shopData['장신구'] || []).slice(0, 2).map(item => ({
        ...item,
        item_id: item.id,
        type: 'accessory',
        image: imageMap[item.id] || null,
      }));

      // 배경 아이템은 보유하지 않음
      const ownedItems = [...ownedHats, ...ownedAccessories];
      // --- 임시 로직 끝 ---
      
      // 실제 API 연동 시 아래 코드로 대체합니다. (응답이 배열 전체라고 가정)
      // const itemsFromApi = response.data.map((item: any) => ({ ...item, image: imageMap[item.id] || null }));
      // setInventoryItems(itemsFromApi);
      
      setInventoryItems(ownedItems);
      setCarrots(120); // 임시 당근 데이터
    } catch (error) {
      console.error("인벤토리 로딩 실패:", error);
      Alert.alert("오류", "보유 아이템 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  const handleItemPress = (item: Item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleConfirmEquip = async () => {
    if (!selectedItem) return;
    
    // --- 실제 API 연동 시 아래 주석을 해제하세요 ---
    // try {
    //   const headers = await getAuthHeaders();
    //   // 명세서에 맞게 아이템 장착 API 연동
    //   const response = await axios.put(`${API_URL}/api/v1/inventory/${selectedItem.item_id}/equip`, {}, { headers });
    //   
    //   Alert.alert('장착 완료', response.data.message);
    //   // TODO: 장착 상태가 변경되었으므로 인벤토리 목록을 다시 불러오는 로직 추가
    //   // fetchInventoryItems(); 
    // } catch (error: any) {
    //   console.error("장착 실패:", error.response?.data || error);
    //   Alert.alert('장착 실패', error.response?.data?.error || "오류가 발생했습니다.");
    // }
    Alert.alert('장착 완료', `${selectedItem.name} 아이템을 착용했습니다.`);
    setIsModalVisible(false);
  };

  const handleCancelEquip = () => {
    setIsModalVisible(false);
  };

  const renderItem = ({ item }: { item: Item }) => (
    <Pressable
      style={[
        styles.itemContainer,
        selectedItem?.item_id === item.item_id && styles.itemSelected,
      ]}
      onPress={() => handleItemPress(item)}>
      <View style={styles.itemImage}>
        {item.image ? (
          <Image source={item.image} style={styles.itemImageContent} resizeMode="contain" />
        ) : (
          <ThemedText style={{ fontSize: 40 }}>❓</ThemedText>
        )}
      </View>
      <ThemedText style={styles.itemText}>보유 중</ThemedText>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '인벤토리',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.push('/mypage')} style={{ paddingLeft: 10 }}>
              <Ionicons name="arrow-back" size={28} color="black" />
            </Pressable>
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable style={{ paddingRight: 10 }}>
                {({ pressed }) => <Ionicons name="person-circle-outline" size={28} color="black" style={{ opacity: pressed ? 0.5 : 1 }} />}
              </Pressable>
            </Link>
          ),
          headerTitleStyle: { fontFamily: 'Jua', fontSize: 20 },
        }}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={handleCancelEquip}
        onDismiss={() => {
          setSelectedItem(null); // 모달이 완전히 닫힌 후에 아이템 선택을 해제합니다.
        }}
      >
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                {selectedItem?.image && (
                    <Image source={selectedItem.image} style={styles.modalItemImage} resizeMode="contain" />
                )}
                <ThemedText style={styles.modalText}>
                    착용하시겠습니까?
                </ThemedText>
                <View style={styles.modalButtonContainer}>
                    <Pressable style={[styles.modalButton, styles.confirmButton]} onPress={handleConfirmEquip}>
                        <ThemedText style={styles.modalButtonText}>예</ThemedText>
                    </Pressable>
                    <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={handleCancelEquip}>
                        <ThemedText style={[styles.modalButtonText, { color: '#4A4459' }]}>아니오</ThemedText>
                    </Pressable>
                </View>
            </View>
        </View>
      </Modal>

      <ThemedView style={styles.container}>
        {/* 상단 앱 바 */}
        <View style={styles.carrotInfoContainer}>
          <ThemedText style={styles.carrotText}>🥕 {carrots}</ThemedText>
        </View>

        {/* 카테고리 탭 */}
        <View style={styles.tabBar}>
          {CATEGORIES.map((category) => (
            <Pressable
              key={category}
              style={[styles.tab, selectedCategory === category && styles.activeTab]}
              onPress={() => setSelectedCategory(category)}
            >
              <ThemedText style={[styles.tabText, selectedCategory === category && styles.activeTabText]}>
                {category}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {/* 아이템 목록 */}
        {loading ? (
          <ActivityIndicator style={{ flex: 1 }} size="large" />
        ) : (
          <FlatList
            data={inventoryItems.filter(item => item.type === CATEGORY_MAP[selectedCategory])}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.item_id)}
            numColumns={3}
            contentContainerStyle={styles.itemList}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <ThemedText style={styles.emptyText}>보유한 아이템이 없습니다.</ThemedText>
                </View>
            }
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
  container: { flex: 1 },
  carrotInfoContainer: {
    paddingHorizontal: 20, // 왼쪽 정렬
    paddingVertical: 8,
  },
  carrotText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Jua',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#E8730D8A',
  },
  tabText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Jua',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  itemList: {
    padding: 10,
    marginHorizontal: 5, // 좌우 마진 추가
  },
  itemContainer: {
    width: '30.33%', // 3열 레이아웃을 위한 너비 지정
    alignItems: 'center',
    marginHorizontal: '1.5%', // 아이템 간 좌우 간격
    marginVertical: 8, // 아이템 간 상하 간격
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  itemSelected: {
    opacity: 0.5,
  },
  itemImage: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 5,
  },
  itemImageContent: { width: '90%', height: '90%' },
  itemText: { fontSize: 12, fontFamily: 'Jua' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontFamily: 'Jua',
    color: '#B3B3B3',
    fontSize: 16,
  },
  // --- Modal Styles ---
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 35,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalItemImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  modalText: {
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'Jua',
    fontSize: 18,
    lineHeight: 24,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    borderRadius: 25,
    padding: 10,
    elevation: 2,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: '#E8730D8A', // mypage.tsx의 구매하기 버튼 색상과 통일
  },
  cancelButton: {
    backgroundColor: '#f2f2f2', // mypage.tsx의 취소 버튼 색상과 통일
  },
  modalButtonText: {
    color: 'white',
    fontFamily: 'Jua',
    fontSize: 16,
  },
});