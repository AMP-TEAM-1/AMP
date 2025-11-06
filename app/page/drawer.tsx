import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import CategoryContent from './category';
import CustomDrawerContent from './CustomDrawerContent';
import HomeContent from './home';
import TodosScreen from './todos';

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Home" component={HomeContent} />
      <Drawer.Screen name="Category" component={CategoryContent} />
      <Drawer.Screen name="Todos" component={TodosScreen} />
    </Drawer.Navigator>
  );
}
