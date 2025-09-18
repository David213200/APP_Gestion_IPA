import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert, StyleSheet, Platform } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { auth, database } from "../services/credentials";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Esperar a que auth esté completamente inicializado
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const sanitizeEmail = (email) => email.replace(/\./g, "_");

  const handleLogin = () => {
    if (!isReady) {
      Alert.alert("Por favor espere", "El sistema de autenticación se está iniciando");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const userRef = ref(database, 'usuarios');
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const usersData = snapshot.val();
          let userData = null;

          // Buscar usuario por correo
          for (const key in usersData) {
            if (usersData[key].correo === user.email) {
              userData = usersData[key];
              break;
            }
          }

          if (userData) {
            const role = userData.rol;

            if (role === "Admin") {
              navigation.navigate("Admin", { user: userData });
            } else if (role === "Profesor") {
              navigation.navigate("Profesor", { user: userData });
            } else if (role === "Estudiante") {
              navigation.navigate("Estudiante", { user: userData });
            } else {
              Alert.alert("Error", "Rol de usuario desconocido");
            }
          } else {
            Alert.alert("Error", "Usuario no registrado en la base de datos");
          }
        } else {
          Alert.alert("Error", "No se encontraron usuarios en la base de datos");
        }
      })
      .catch((error) => {
        console.error("Error completo:", error);
        let errorMessage = "Error al iniciar sesión";
        
        if (error.code) {
          switch (error.code) {
            case "auth/invalid-email":
              errorMessage = "Correo electrónico inválido";
              break;
            case "auth/user-disabled":
              errorMessage = "Usuario deshabilitado";
              break;
            case "auth/user-not-found":
              errorMessage = "Usuario no encontrado";
              break;
            case "auth/wrong-password":
              errorMessage = "Contraseña incorrecta";
              break;
            case "auth/too-many-requests":
              errorMessage = "Demasiados intentos. Intente más tarde";
              break;
            case "auth/network-request-failed":
              errorMessage = "Error de red. Verifique su conexión";
              break;
          }
        }
        
        Alert.alert("Error", errorMessage);
      });
  };

  return (
    <LinearGradient colors={['#0f3057', '#00587a', '#008891']} style={styles.gradient}>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#ccc"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#ccc"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />
        <Pressable 
          onPress={handleLogin} 
          style={styles.loginButton}
          disabled={!isReady}
        >
          <LinearGradient 
            colors={['#4CAF50', '#45a049']} 
            style={[styles.buttonGradient, !isReady && styles.disabledButton]}
          >
            <MaterialIcons name="login" size={24} color="white" />
            <Text style={styles.loginText}>
              {isReady ? "Iniciar Sesión" : "Inicializando..."}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 30 
  },
  container: { 
    width: '100%',
    maxWidth: 400 
  },
  input: { 
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  loginButton: { 
    borderRadius: 10, 
    overflow: 'hidden',
    marginTop: 10
  },
  buttonGradient: { 
    padding: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  loginText: { 
    color: 'white', 
    fontSize: 18, 
    marginLeft: 10,
    fontWeight: 'bold'
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.6
  }
});

export default LoginScreen;