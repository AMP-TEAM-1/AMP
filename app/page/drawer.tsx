import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import CategoryContent from './category';
import CustomDrawerContent from './CustomDrawerContent';
import { default as HomeContent, default as OptionContent } from './home';

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />} screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="Home" component={HomeContent} />
      <Drawer.Screen name="Category" component={CategoryContent} />
      <Drawer.Screen name="Option" component={OptionContent} />
    </Drawer.Navigator>
  );
}
