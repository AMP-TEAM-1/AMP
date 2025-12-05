import React, { createContext, ReactNode, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';

type ColorContextType = {
  colors: string[];
  setColors: (colors: string[]) => void;
};

export const ColorContext = createContext<ColorContextType>({
  colors: ['#fff', '#fff'],
  setColors: () => { },
});

export const ColorProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  // 사용자가 선택한 커스텀 색상 (null이면 테마 기본 색상 사용)
  const [customColors, setCustomColors] = useState<string[] | null>(null);

  // 커스텀 색상이 있으면 사용, 없으면 테마 배경색 사용 (LinearGradient는 최소 2개 색상 필요)
  const colors = useMemo(() =>
    customColors || [theme.background, theme.background],
    [customColors, theme.background]
  );

  return (
    <ColorContext.Provider value={{ colors, setColors: setCustomColors }}>
      {children}
    </ColorContext.Provider>
  );
};