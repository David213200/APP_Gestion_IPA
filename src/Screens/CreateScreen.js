import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Button } from 'react-native';

import styles from './../StyleSheet/styles';
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

export default CreateScreen;
