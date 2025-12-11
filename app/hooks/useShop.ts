import { API_URL, getAuthHeaders } from '@/api';
import { Item, imageMap } from '@/data/items';
import { useUserStore } from '@/store/userStore';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

const getImageKey = (imageUrl: string): string => {
  // URL에서 파일명 추출
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

  return keyMap[filename] || imageUrl; // 매핑이 없으면 원래 URL 반환
};

export function useShop() {
  const [shopItems, setShopItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const { carrots, purchaseItem } = useUserStore();

  const fetchShopItems = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const shopRes = await axios.get(`${API_URL}/shop/items`, { headers });

      const transformedItems = shopRes.data.map((item: any) => {
        const imageKey = getImageKey(item.image_url);
        const image = imageMap[imageKey];

        if (!image) {
          console.warn(`이미지 매핑 실패: ${item.image_url} → ${imageKey}`);
        }
        if (!item.type && !item.item_type) {
          console.warn(`type 필드 누락:`, item);
        }

        return {
          ...item,
          type: item.type || item.item_type || 'unknown',
          image: image || imageMap['h1'], 
        };
      });


      setShopItems(transformedItems);

    } catch (error) {
      console.error('상점 정보 로딩 실패:', error);
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