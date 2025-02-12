import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Picker } from '@react-native-picker/picker';
import { database } from '../services/credentials';
import { ref, get } from 'firebase/database';

export default function DBViewScreen() {
  const [lista, setLista] = useState([]);
  const [filteredLista, setFilteredLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [nivelSeleccionado, setNivelSeleccionado] = useState('');

  useEffect(() => {
    const getLista = async () => {
      try {
        const niveles = [
          'proyectos_sanitizado_1r',
          'proyectos_sanitizado_2n',
          'proyectos_sanitizado_3r',
          'proyectos_sanitizado_4t',
        ];
        let datosCompletos = [];

        for (const nivel of niveles) {
          const dbRef = ref(database, `proyectos/${nivel}`);
          const snapshot = await get(dbRef);

          if (snapshot.exists()) {
            const data = snapshot.val();
            const datosArray = Object.entries(data).map(([id, valores]) => ({
              id,
              ...valores,
              nivel: nivel.replace('proyectos_sanitizado_', ''),
            }));

            datosCompletos = [...datosCompletos, ...datosArray];
          }
        }

        setLista(datosCompletos);
        setFilteredLista(datosCompletos);
      } catch (error) {
        console.log('Error al obtener datos: ', error);
      } finally {
        setLoading(false);
      }
    };

    getLista();
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    let filteredData = lista;

    if (nivelSeleccionado) {
      filteredData = filteredData.filter((item) => item.nivel === nivelSeleccionado);
    }

    if (text.trim() !== '') {
      filteredData = filteredData.filter((item) =>
        item.alumno?.toString().toLowerCase().includes(text.toLowerCase())
      );
    }

    setFilteredLista(filteredData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('./../../assets/logo.png')} style={styles.logo} resizeMode="stretch" />
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre de alumno..."
        value={search}
        onChangeText={handleSearch}
      />
  
      <Picker
        selectedValue={nivelSeleccionado}
        style={styles.picker}
        onValueChange={(itemValue) => {
          setNivelSeleccionado(itemValue);
          handleSearch(search);
        }}
      >
        <Picker.Item label="Todos los cursos" value="" />
        <Picker.Item label="1r ESO" value="1r" />
        <Picker.Item label="2n ESO" value="2n" />
        <Picker.Item label="3r ESO" value="3r" />
        <Picker.Item label="4t ESO" value="4t" />
      </Picker>
  
      {Platform.OS === 'web' ? (
        <div style={styles.webContainer}>
          {filteredLista.map((item) => (
            <View key={item.id} style={styles.content}>
              <Text style={styles.title}>Alumno/a:</Text>
              <Text style={styles.value}>{item.alumno || 'N/A'}</Text>

              <Text style={styles.title}>Nivel ESO:</Text>
              <Text style={styles.value}>{item.nivel || 'N/A'}</Text>

              <Text style={styles.title}>Proyectos:</Text>
              {item.proyectos && Object.entries(item.proyectos).map(([key, value], index) => (
                <Text key={`${item.id}-${key}-${index}`} style={styles.projectText}>
                  ➪ {key}: {value}
                </Text>
              ))}
            </View>
          ))}
        </div>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 50 }} keyboardShouldPersistTaps="handled">
          {filteredLista.map((item) => (
            <View key={item.id} style={styles.content}>
              <Text style={styles.title}>{item.alumno}</Text>
              <Text style={styles.projectText}>Nivel: {item.nivel}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B5E20', // Verde fuerte
    padding: 20,
  },
  logo: {
    width: 300,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF9800', // Naranja suave
    marginBottom: 20,
    alignSelf: 'center',
  },
  searchInput: {
    height: 50,
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF9800',
    marginBottom: 20,
    alignSelf: 'center',
    paddingHorizontal: 15,
  },
  content: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1B5E20', // Verde fuerte
  },
  value: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  projectText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333', // Naranja suave
  },
  webContainer: {
    flex: 1,
    overflowY: 'auto',
    maxHeight: '70vh',
    border: '2px solid orange', // Borde naranja
    padding: 10, // Espaciado interno
    borderRadius: 10, // Bordes redondeados
    backgroundColor: '#FFF3E0', // Fondo color naranja claro
  }
  
});
