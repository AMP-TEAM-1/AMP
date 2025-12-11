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
  const [customColors, setCustomColors] = useState<string[] | null>(null);

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