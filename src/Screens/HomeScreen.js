import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation, route }) => { 
  const [userInfo, setUserInfo] = useState(null);

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
    <View style={styles.loginContainer}>
      <Image source={require('./../../assets/logo.png')} style={styles.logo} resizeMode="stretch" />

      <TouchableOpacity style={styles.loginButton} onPress={() => promptAsync()} disabled={!request}>
        <Text style={styles.loginButtonText}>Iniciar sesión con Google</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({ 
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5f8e4e", // Fondo naranja claro
    borderWidth: 2,
    borderColor: "orange",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loginButton: {
    backgroundColor: "orange",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  logo: {
    width: 300,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
});

export default LoginScreen;