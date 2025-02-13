import React from 'react';
import { View, TouchableOpacity, ScrollView, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AdminScreen = ({ navigation, route }) => {
  const userInfo = route.params?.user || {}; 

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.header}>
        <Text style={styles.title}>IPA Profesor</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
          <MaterialIcons name="logout" size={30} color="red" />
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
    backgroundColor: '#1B5E20', // Verde fuerte
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:'center',
    width: '100%',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutButton: {
    backgroundColor: 'orange',
    padding: 10,
    borderRadius: 10,
  },
  welcomeText: {
    fontSize: 18,
    color: 'white',
    marginBottom: 20,
  },
  outerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'orange',
    width: '90%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'orange',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminScreen;
