import { API_URL, getAuthHeaders } from '@/api';
import { Item, imageMap } from '@/data/items';
import { useUserStore } from '@/store/userStore';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

// 🔥 이미지 URL을 imageMap 키로 변환하는 헬퍼 함수
const getImageKey = (imageUrl: string): string => {
  // DB의 image_url: "../assets/images/item/strawHat.png"
  // imageMap 키: "h1", "h2", "a1" 등
  
  const filename = imageUrl.split('/').pop()?.replace('.png', '') || '';
  
  // 파일명 → imageMap 키 매핑
  const keyMap: { [key: string]: string } = {
    'strawHat': 'h1',
    'cowboyHat': 'h2',
    'crown': 'h6',
    'heart-accessory': 'a1',
    'health-accessory': 'a1',
    'bowtie': 'a2',
    'tulip-bg': 'b1',
  };
  
  return keyMap[filename] || imageUrl; // 매핑 실패 시 원본 URL 반환
};

export function useShop() {
  // 1. 상점 아이템 목록은 이 훅의 로컬 상태로 관리
  const [shopItems, setShopItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. 당근, 구매 함수는 전역 스토어에서 가져옴
  const { carrots, purchaseItem } = useUserStore();

  const fetchShopItems = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const shopRes = await axios.get(`${API_URL}/shop/items`, { headers });
      
      // 🔍 디버깅: API 응답 확인
      console.log('📦 API 응답:', shopRes.data);
      console.log('📦 첫 번째 아이템:', shopRes.data[0]);
      
      const transformedItems = shopRes.data.map((item: any) => {
        // 🔥 이미지 매핑 개선
        const imageKey = getImageKey(item.image_url);
        const image = imageMap[imageKey];
        
        // 🔍 디버깅: 매핑 결과 확인
        if (!image) {
          console.warn(`❌ 이미지 매핑 실패: ${item.image_url} → ${imageKey}`);
        }
        
        // 🔍 디버깅: type 필드 확인
        if (!item.type && !item.item_type) {
          console.warn(`❌ type 필드 누락:`, item);
        }
        
        return {
          ...item,
          // type이 없으면 item_type으로 폴백
          type: item.type || item.item_type || 'unknown',
          image: image || imageMap['h1'], // 이미지 매핑 실패 시 기본 이미지
        };
      });
      
      console.log('✅ 변환된 아이템:', transformedItems);
      setShopItems(transformedItems);

    } catch (error) {
      console.error('❌ 상점 정보 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShopItems();
  }, [fetchShopItems]);

  // 3. 반환 값 변경
  return { shopItems, carrots, loading, purchaseItem, fetchShopData: fetchShopItems };
}