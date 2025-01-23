import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { StyleSheet, Text, View } from 'react-native';

import AdminScreen from './src/Screens/AdminScreen';
import CreateScreen from './src/Screens/CreateScreen';
import DBViewScreen from './src/Screens/DBViewScreen';
import StudentScreen from './src/Screens/StudentScreen';
import LoginScreen from './src/Screens/HomeScreen';
import ProfessorScreen from './src/Screens/ProfessorScreen';

const Stack = createStackNavigator();

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  
  const [accessToken, setAccessToken] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: "639559208157-ot3vscon2rpc4ai9utergk2ad8s6v33q.apps.googleusercontent.com",
    iosClientId: "639559208157-hlri5cj2n6du6ho9g1l74ujpeu0qupha.apps.googleusercontent.com",
    androidClientId: "639559208157-7sc7g32fq002j2qmnl245unktmtp1psh.apps.googleusercontent.com"
  });

  

  return (
    <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={LoginScreen} options={{ title: 'Inicio' }} />
      <Stack.Screen name="Estudiante" component={StudentScreen} options={{ title: 'Estudiante' }} />
      <Stack.Screen name="Profesor" component={ProfessorScreen} options={{ title: 'Profesor' }} />
      <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin' }} />
      <Stack.Screen name="Create" component={CreateScreen} options={{ title: 'Crear Entrada' }} />
      <Stack.Screen name="DBView" component={DBViewScreen} options={{ title: 'Consultar Base de Datos' }} />
    </Stack.Navigator>
  </NavigationContainer>
  );
}

