import React from 'react';

export const ColorContext = React.createContext<{
  colors: string[];
  setColors: (colors: string[]) => void;
}>({
  colors: ['#FFD8A9', '#FFF5E1', '#FFF5E1', '#FFD8A9'],
  setColors: () => {},
});
