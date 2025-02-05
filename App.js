import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

// Replace with your actual screens

import AdminScreen from './src/Screens/AdminScreen';
import CreateScreen from './src/Screens/CreateScreen';
import DBViewScreen from './src/Screens/DBViewScreen';
import StudentScreen from './src/Screens/StudentScreen';
import LoginScreen from './src/Screens/HomeScreen';
import ProfessorScreen from './src/Screens/ProfessorScreen';

export default function App() {
  return (
    <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={LoginScreen} options={{ title: 'Home' }} />
      <Stack.Screen name="Estudiante" component={StudentScreen} options={{ title: 'Estudiante' }} />
      <Stack.Screen name="Profesor" component={ProfessorScreen} options={{ title: 'Profesor' }} />
      <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin' }} />
      <Stack.Screen name="Create" component={CreateScreen} options={{ title: 'Crear Entrada' }} />
      <Stack.Screen name="DBView" component={DBViewScreen} options={{ title: 'Consultar Base de Datos' }} />
    </Stack.Navigator>
  </NavigationContainer>
  );
}

