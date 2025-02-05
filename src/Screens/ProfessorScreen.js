import React from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

/*const icon = require('../assets/logo_InstitutAF_color_h.png');

<Image source={icon} style={styles.logo} resizeMode="contain" />*/

const ProfessorScreen = ({ route }) => {
  const navigation = useNavigation();
  const name = route.params?.name || 'Desconocido'; // Manejo de parámetros inexistentes

  const userInfo = route.params?.user || {}; // Recibe el usuario desde LoginScreen
  
    function handleLogout() {
      try {
        navigation.replace("Home"); // Envía al usuario a la pantalla de login
        console.log("Sesión cerrada correctamente");
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>IPA Profesor</Text>
        <MaterialIcons name="logout" size={24} color="white" />
        </View>

      <Text style={styles.greeting}>Bienvenido, Profesor {name}</Text>

      <View style={styles.content}>
        <Text style={styles.contentText}>
          Aquí puedes agregar la funcionalidad específica para los profesores,
          como la lista de estudiantes, gestión de proyectos, etc.
        </Text>
        <Button
          title="Consultar Datos"
          onPress={() => navigation.navigate('DBView')}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f0f4f8",
    padding: 20,
    alignItems: "center",
  },
  header: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: "100%",
    maxWidth: 600,
  },
  logo: {
    width: '80%',
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  greeting: {
    fontSize: 20,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  content: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: "100%",
    maxWidth: 600,
  },
  contentText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
});

export default ProfessorScreen;
