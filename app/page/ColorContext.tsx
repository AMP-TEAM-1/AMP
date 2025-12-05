import React, { createContext, ReactNode, useState } from 'react';

type ColorContextType = {
  colors: string[];
  setColors: (colors: string[]) => void;
};

export const ColorContext = createContext<ColorContextType>({
  colors: [],
  setColors: () => { },
});

export const ColorProvider = ({ children }: { children: ReactNode }) => {
  // 깔끔한 오프 화이트 단일 배경 (그라데이션 제거)
  const [colors, setColors] = useState<string[]>(['#F8F9FA']);

  return (
    <ColorContext.Provider value={{ colors, setColors }}>
      {children}
    </ColorContext.Provider>
  );
};