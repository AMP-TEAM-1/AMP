import { Item, mockInventoryItems } from '@/data/items';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

/**
 * 사용자의 인벤토리 관련 데이터를 관리하는 커스텀 훅입니다.
 * 보유 아이템 목록, 재화(캐롯) 개수를 가져오고, 아이템 장착/해제 기능을 제공합니다.
 * 현재는 UI 테스트를 위해 임시 데이터를 사용하고 있습니다.
*/
export function useInventory() {
  const [inventoryItems, setInventoryItems] = useState<Item[]>([]);
  const [carrots, setCarrots] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    // --- UI 테스트를 위한 임시 데이터 설정 ---
    // data/items.ts에서 정의한 mock 데이터를 사용합니다.
    setTimeout(() => {
      setInventoryItems(mockInventoryItems);
      setCarrots(70); // 임시 당근 개수
      setLoading(false);
    }, 500); // 실제 로딩처럼 보이게 0.5초 지연
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const equipItem = async (item: Item) => {
    // --- UI 테스트를 위한 임시 장착 로직 ---
    setInventoryItems((prevItems) =>
      prevItems.map((invItem) => {
        // 같은 타입의 다른 아이템은 장착 해제
        if (invItem.type === item.type && invItem.item_id !== item.item_id) {
          return { ...invItem, is_equipped: false };
        }
        // 선택한 아이템은 장착 상태 토글
        if (invItem.item_id === item.item_id) {
          return { ...invItem, is_equipped: !invItem.is_equipped };
        }
        return invItem;
      })
    );
    Alert.alert('알림', `${item.name} 장착 상태가 변경되었습니다.`);
    return true;
  };

  return { inventoryItems, carrots, loading, fetchInventory, equipItem };
}

// 기존 API 연동 코드 (force 파라미터 포함)
/*
import { API_URL, getAuthHeaders } from '@/api';
import { imageMap, Item } from '@/data/items';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function useInventory() {
  const [inventoryItems, setInventoryItems] = useState<Item[]>([]);
  const [carrots, setCarrots] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      // 인벤토리 아이템 목록 가져오기
      // [수정] 백엔드 엔드포인트 변경: /inventory/ -> /api/inventory
      const inventoryRes = await axios.get(`${API_URL}/api/inventory`, { headers });

      const itemsFromApi = inventoryRes.data.map((item: any) => {
        return {
          ...item,
          image: imageMap[item.item_id] || null,
        } as Item;
      });
      setInventoryItems(itemsFromApi);

      // 사용자 정보(당근) 가져오기
      // [수정] 백엔드 엔드포인트 변경: /api/v1/users/me -> /users/me/
      const userRes = await axios.get(`${API_URL}/users/me/`, { headers });
      setCarrots(userRes.data.carrot_balance);
    } catch (error) {
      console.error('인벤토리 로딩 실패:', error);
      Alert.alert('오류', '보유 아이템 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // force 파라미터를 추가하여 아이템 강제 교체 기능을 구현합니다.
  const equipItem = async (item: Item, force: boolean = false) => {
    try {
      const headers = await getAuthHeaders();
      // [수정] 백엔드 엔드포인트 및 요청 방식 변경
      // 1. 경로: /inventory/equip/ -> /api/inventory/{item_id}/equip
      // 2. 요청: Query Parameter -> Path Parameter + Request Body
      const response = await axios.put(
        `${API_URL}/api/inventory/${item.item_id}/equip`,
        { item_id: item.item_id, is_equipped: true, force: force }, // is_equipped와 force 옵션을 body에 담아 전송
        { headers }
      );
      Alert.alert('장착 완료', response.data.message);
      await fetchInventory(); // 장착 후 인벤토리 정보 새로고침
      return true;
    } catch (error: any) {
      console.error('장착 실패:', error.response?.data || error.message);

      // Conflict 에러 (아이템 교체) 처리
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        return new Promise((resolve) => {
          Alert.alert(
            '아이템 교체',
            error.response?.data?.error || '이미 다른 아이템을 착용하고 있습니다. 교체할까요?',
            [
              { text: '취소', style: 'cancel', onPress: () => resolve(false) },
              {
                text: '교체',
                // '교체'를 누르면 force=true로 함수를 재호출합니다.
                onPress: async () => {
                  const success = await equipItem(item, true);
                  resolve(success);
                },
              },
            ]
          );
        });
      }
      Alert.alert('장착 실패', error.response?.data?.error || '오류가 발생했습니다.');
      return false;
    }
  };

  return { inventoryItems, carrots, loading, fetchInventory, equipItem };
}
*/