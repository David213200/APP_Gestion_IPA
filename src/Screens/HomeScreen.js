import React, { useEffect, useState } from "react";
import { View, Text, Button, Image } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";

import { useNavigation } from "@react-navigation/native";


WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [userInfo, setUserInfo] = useState(null);
  const navigation = useNavigation(); 


  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "787603279609-3pcr1587qo7momb2s33o70phnk7q2d86.apps.googleusercontent.com",
    iosClientId: "787603279609-1ilcm9t123jnc7rld8hp5id03khsl4jm.apps.googleusercontent.com",
    androidClientId: "639559208157-7sc7g32fq002j2qmnl245unktmtp1psh.apps.googleusercontent.com",
    redirectUri: makeRedirectUri({
      native: "com.ipa.app://",
    })
  });

  function getRole(email) {
    const admins = ["dlopezz2003@gmail.com"];
    const profesores = ["15584248.clot@fje.edu", "otroprofesor@example.com"];
    
    if (admins.includes(email)) return "Admin";
    if (profesores.includes(email)) return "Profesor";
    return "Estudiante"; // Todos los demás serán estudiantes por defecto
  }

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      fetchUserinfo(authentication.accessToken);
    }
  }, [response]);

  async function fetchUserinfo(accessToken) {
    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const user = await res.json();
      setUserInfo(user);

      const role = getRole(user.email);
      console.log(`Usuario: ${user.email} - Rol: ${role}`); // ⬅️ Para verificar en consola


      if (role === "Admin") {
        navigation.navigate("Admin", { user });
      } else if (role === "Profesor") {
        navigation.navigate("Profesor", { user });
      } else {
        navigation.navigate("Estudiante", { user });
      }

    } catch (error) {
      console.error("Error obteniendo datos del usuario:", error);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Inicio de Sesión con Google</Text>
      {userInfo ? (
        <View>
          <Text>Bienvenido, {userInfo.name}!</Text>
          <Image source={{ uri: userInfo.picture }} style={{ width: 100, height: 100 }} />
        </View>
      ) : (
        <Button title="Iniciar sesión con Google" onPress={() => promptAsync()} disabled={!request} />
      )}
    </View>
  );
}