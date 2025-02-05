import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Image, Text } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons';

const AdminScreen = ({ route }) => {
  const navigation = useNavigation();
  const userInfo = route.params?.user || {}; 

  function handleLogout() {
    try {
      navigation.replace("Home"); 
      console.log("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.header}>
        <Text style={styles.title}>IPA Profesor</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <Text style={styles.welcomeText}>Bienvenido, {userInfo.name}!</Text>
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Create')}>
            <Text style={styles.buttonText}>Crear Datos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('DBView')}>
            <Text style={styles.buttonText}>Consultar Datos</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  welcomeText: {
    textAlign: 'center',
    fontSize: 18,
    marginVertical: 10,
  },
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  container: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: "90%",
    maxWidth: 600,
    alignItems: 'center',
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AdminScreen;
