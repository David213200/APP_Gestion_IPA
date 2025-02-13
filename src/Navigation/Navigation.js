import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import LoginScreen from './../Screens/HomeScreen';
import ProfessorScreen from './../Screens/ProfessorScreen';
import StudentScreen from './../Screens/StudentScreen';
import AdminScreen from './../Screens/AdminScreen';
import DBViewScreen from './../Screens//DBViewScreen';
import CreateScreen from './../Screens//CreateScreen';

const Stack = createStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Estudiante" component={StudentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Profesor" component={ProfessorScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Admin" component={AdminScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Create" component={CreateScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DBView" component={DBViewScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  </NavigationContainer>
  );
}
