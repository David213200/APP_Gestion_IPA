import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import LoginScreen from './../Screens/LoginScreen';
import ProfessorScreen from './../Screens/ProfessorScreen';
import StudentScreen from './../Screens/StudentScreen';
import AdminScreen from './../Screens/AdminScreen';
import DBViewScreen from './../Screens//DBViewScreen';
import ScrollScreen from './../Screens/CreateScreen';
import ManageProyectosScreen from './../Screens/ManageProyectosScreen';
import EditProyectosScreen from '../Screens/EditProyectosScreen';
import GestionDB from '../BD/GestionDB';
import GestionProyectosScreen from '../Screens/GestionProyectosScreen';
import EgresadosScreen from '../Screens/EgresadosScreen';
import GestionUsuariosScreen from '../Screens/GestionUsuariosScreen';

const Stack = createStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Estudiante" component={StudentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Profesor" component={ProfessorScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Admin" component={AdminScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Create" component={ScrollScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DBView" component={DBViewScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Proyectos" component={ManageProyectosScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditP" component={EditProyectosScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GestionDB" component={GestionDB} options={{ headerShown: false }} />
      <Stack.Screen name="GestionProyectos" component={GestionProyectosScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Egresados" component={EgresadosScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GestionUsuarios" component={GestionUsuariosScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  </NavigationContainer>
  );
}
