import { createDrawerNavigator } from '@react-navigation/drawer';
import React, { useState } from 'react';
import CategoryContent from './category';
import { ColorContext } from './ColorContext';
import CustomDrawerContent from './CustomDrawerContent';
import { default as HomeContent, default as OptionContent } from './home';

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  const [colors, setColors] = useState(['#FFD8A9', '#FFF5E1', '#FFF5E1', '#FFD8A9']);

  return (
    <ColorContext.Provider value={{ colors, setColors }}>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Drawer.Screen name="Home" component={HomeContent} />
        <Drawer.Screen name="Category" component={CategoryContent} />
        <Drawer.Screen name="Option" component={OptionContent} />
      </Drawer.Navigator>
    </ColorContext.Provider>
  );
}
