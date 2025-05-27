import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, Pressable, Image, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { MaterialIcons, Feather } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation, route }) => { 
  const [userInfo, setUserInfo] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

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
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 5,
        bounciness: 10,
        useNativeDriver: true
      })
    ]).start();
  }, []);

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
    <LinearGradient colors={['#0f3057', '#00587a', '#008891']} style={styles.gradient}>
      <View style={styles.container}>
        <Animated.View style={[styles.logoContainer, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }]}>
          <Image 
            source={require('./../../assets/logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
          <Pressable 
            style={({ pressed }) => [
              styles.loginButton,
              { transform: [{ scale: pressed ? 0.95 : 1 }] }
            ]}
            onPress={() => promptAsync()} 
            disabled={!request}
          >
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.buttonGradient}
            >
              <MaterialIcons name="login" size={24} color="white" />
              <Text style={styles.loginButtonText}>Iniciar sesión con Google</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>IPA Education Suite v1.0</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({ 
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  logoContainer: {
    marginBottom: 50,
  },
  logo: {
    width: 300,
    height: 150,
    tintColor: 'white',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loginButton: {
    width: '80%',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonGradient: {
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    width: '100%',
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontSize: 12,
    letterSpacing: 1,
  },
});

export default LoginScreen;