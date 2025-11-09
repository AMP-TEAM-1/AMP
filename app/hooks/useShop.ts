import { Item, mockShopItems } from '@/data/items';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

/**
 * 상점 관련 데이터를 관리하는 커스텀 훅입니다.
 * 상점 아이템 목록과 사용자의 재화(캐롯)를 가져오고, 아이템 구매 기능을 제공합니다.
 * 현재는 UI 테스트를 위해 임시 데이터를 사용하고 있습니다.
*/
export function useShop() {
  const [shopItems, setShopItems] = useState<Item[]>([]);
  const [carrots, setCarrots] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchShopData = useCallback(async () => {
    setLoading(true);
    // --- UI 테스트를 위한 임시 데이터 설정 ---
    // data/items.ts에서 정의한 mock 데이터를 사용합니다.
    setTimeout(() => {
      setShopItems(mockShopItems);
      setCarrots(70); // 임시 당근 개수
      setLoading(false);
    }, 500); // 실제 로딩처럼 보이게 0.5초 지연
  }, []);

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  const purchaseItem = async (item: Item) => {
    // --- UI 테스트를 위한 임시 구매 로직 ---
    return new Promise<boolean>((resolve) => {
      if (carrots < (item.price ?? 0)) {
        // Alert을 제거하고 실패 여부만 반환하여 UI 컴포넌트에서 처리하도록 합니다.
        resolve(false);
      } else {
        const newBalance = carrots - (item.price ?? 0);
        setCarrots(newBalance);
        // 구매한 아이템에 is_owned: true 속성을 추가하여 상태를 업데이트합니다.
        setShopItems((prevItems) =>
          prevItems.map((shopItem) => (shopItem.item_id === item.item_id ? { ...shopItem, is_owned: true } : shopItem))
        );
        Alert.alert('구매 완료', `${item.name}을(를) 구매했습니다!`);
        resolve(true);
      }
    });
  };

  return { shopItems, carrots, loading, purchaseItem, fetchShopData };
}

// 기존 API 연동 코드
/*
import { API_URL, getAuthHeaders } from '@/api';
import { imageMap, Item } from '@/data/items';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function useShop() {
  const [shopItems, setShopItems] = useState<Item[]>([]);
  const [carrots, setCarrots] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchShopData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      // 1. 상점 아이템 목록 가져오기
      // [수정] 백엔드 엔드포인트 변경: /api/v1/shop/items -> /shop/items
      const shopRes = await axios.get(`${API_URL}/shop/items`, { headers });

      const itemsFromApi = shopRes.data.map((item: any) => ({
        ...item,
        image: imageMap[item.item_id] || null,
      }));
      setShopItems(itemsFromApi);

      // 2. 사용자 정보(당근) 가져오기
      // [수정] 백엔드 엔드포인트 변경: /api/v1/users/me -> /users/me/
      const userRes = await axios.get(`${API_URL}/users/me/`, { headers });
      setCarrots(userRes.data.carrot_balance);
    } catch (error) {
      console.error('상점 정보 로딩 실패:', error);
      Alert.alert('오류', '상점 정보를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  const purchaseItem = async (item: Item) => {
    try {
      const headers = await getAuthHeaders();
      // [수정] 백엔드 엔드포인트 및 요청 방식 변경
      // 1. 경로: /api/v1/shop/purchase -> /shop/purchase/
      // 2. 요청: JSON Body -> Query Parameter
      const response = await axios.post(
        `${API_URL}/shop/purchase/?item_id=${item.item_id}`,
        {}, // Body는 비워둠
        { headers }
      );

      // [수정] 응답 데이터 구조 변경: User 객체에서 잔액 직접 추출
      const updatedUser = response.data;
      Alert.alert('구매 완료', `${item.name}을(를) 성공적으로 구매했습니다.`);
      setCarrots(updatedUser.carrot_balance);
      return true;
    } catch (error: any) {
      console.error('구매 실패:', error.response?.data || error);
      Alert.alert('구매 실패', error.response?.data?.detail || '오류가 발생했습니다.');
      return false;
    }
  };

  return { shopItems, carrots, loading, purchaseItem, fetchShopData };
}
*/