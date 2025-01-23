import React from 'react';
import { View, Button, StyleSheet, ScrollView, Image, Text } from 'react-native';

/*<Image source={require('../assets/logo_InstitutAF_color_h.png')} style={styles.logo} resizeMode='contain' />*/

const AdminScreen = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.header}>
        <Text style={styles.title}>IPA Profesor</Text>
      </View>

      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <Button
            title="Crear Datos"
            onPress={() => navigation.navigate('Create')}
          />
          <Button
            title="Consultar Datos"
            onPress={() => navigation.navigate('DBView')}
            style={styles.button}
          />
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
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: '80%', 
    
    marginBottom: 10 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
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
  },
  button: {
    marginTop: 20,
  },
});

export default AdminScreen;