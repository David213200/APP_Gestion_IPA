import React from 'react';
import { View, TouchableOpacity, Text, ScrollView, Button } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import styles from './../StyleSheet/styles';

const ProfessorScreen = ({ navigation, route }) => {
  const name = route.params?.name || 'Desconocido'; // Manejo de parámetros inexistentes
  const userInfo = route.params?.user || {}; // Recibe el usuario desde LoginScreen
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>IPA Profesor</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
          <MaterialIcons name="logout" size={30} color="red" />
        </TouchableOpacity>
      </View>

      <Text style={styles.greeting}>Bienvenido, Profesor {name}</Text>

      <View style={styles.content}>
        <Text style={styles.contentText}>
          Aquí puedes agregar la funcionalidad específica para los profesores,
          como la lista de estudiantes, gestión de proyectos, etc.
        </Text>
      </View>

      {/* Sección centrada con el botón */}
      <View style={styles.buttonContainer}>
        <Button
          title="Consultar Datos"
          onPress={() => navigation.navigate('DBView')}
          color="#ff6f61"
        />
      </View>
    </ScrollView>
  );
};

export default ProfessorScreen;
