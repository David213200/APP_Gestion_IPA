import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert, StyleSheet, Platform } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { auth, database } from "../services/credentials";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
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
      Alert.alert("Si us plau, espera", "El sistema d'autenticació s'està iniciant");
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
              Alert.alert("Error", "Rol d'usuari desconegut");
            }
          } else {
            Alert.alert("Error", "Usuari no registrat a la base de dades");
          }
        } else {
          Alert.alert("Error", "No s'han trobat usuaris a la base de dades");
        }
      })
      .catch((error) => {
        console.error("Error completo:", error);
        let errorMessage = "Error en iniciar sessió";
        
        if (error.code) {
          switch (error.code) {
            case "auth/invalid-email":
              errorMessage = "Correu electrònic invàlid";
              break;
            case "auth/user-disabled":
              errorMessage = "Usuari deshabilitat";
              break;
            case "auth/user-not-found":
              errorMessage = "Usuari no trobat";
              break;
            case "auth/wrong-password":
              errorMessage = "Contrasenya incorrecta";
              break;
            case "auth/too-many-requests":
              errorMessage = "Massa intents. Torna-ho a intentar més tard";
              break;
            case "auth/network-request-failed":
              errorMessage = "Error de xarxa. Comprova la teva connexió";
              break;
          }
        }
        
        Alert.alert("Error", errorMessage);
      });
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Introdueix el teu correu electrònic per recuperar la contrasenya.");
      console.log("No email provided");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Correu enviat",
        "T'hem enviat un correu per restablir la contrasenya. Revisa la teva safata d'entrada."
      );
      console.log("Password reset email sent to:", email);
    } catch (error) {
      let errorMessage = "No s'ha pogut enviar el correu de recuperació.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "No existeix cap usuari amb aquest correu.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "El correu electrònic no és vàlid.";
      }
      Alert.alert("Error", errorMessage);
      console.log("Password reset error:", error);
    }
  };

  return (
    <LinearGradient colors={['#0f3057', '#00587a', '#008891']} style={styles.gradient}>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Correu electrònic"
          placeholderTextColor="#ccc"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          placeholder="Contrasenya"
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
              {isReady ? "Inicia sessió" : "Inicialitzant..."}
            </Text>
          </LinearGradient>
        </Pressable>

        <Pressable onPress={handleForgotPassword} style={{ marginTop: 16 }}>
          <Text style={{ color: '#fff', textAlign: 'center', textDecorationLine: 'underline' }}>
            Has oblidat la contrasenya?
          </Text>
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
  },
  forgotPasswordText: {
    color: 'white',
    marginTop: 15,
    textAlign: 'center',
    textDecorationLine: 'underline'
  }
});

export default LoginScreen;