import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CreateScreen = ({ route }) => {
    const name = route.params?.name || 'Desconocido'; // Manejo de parámetros inexistentes
    
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bienvenido a crear {name}</Text>
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
  greeting: {
    fontSize: 20,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
});

export default CreateScreen;
