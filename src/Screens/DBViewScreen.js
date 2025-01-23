import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { database } from '../services/credentials';
import { ref, get } from 'firebase/database';

export default function DBViewScreen() {
  const [lista, setLista] = useState([]);
  const [filteredLista, setFilteredLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const getLista = async () => {
      try {
        const dbRef = ref(database, 'ipa-1r'); // Nodo de la BD
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          // Convertir los datos de la BD en un array y filtrar proyectos con "Sin datos"
          const datosArray = Object.entries(data).map(([id, valores]) => ({
            id,
            ...valores,
          }));
          const datosFiltrados = datosArray.map((item) => ({
            id: item.id,
            Alumne_a: item['alumne_a'] || 'N/A',
            NivellESO: item['nivell_eso'] || 'N/A',
            Tutor_a: item['tutor_a'] || 'N/A',
            Proyectos: Object.entries(item)
              .filter(([key, value]) => 
                !['alumne_a', 'tutor_a', 'nivell_eso', 'id'].includes(key) && value !== 'Sin datos'
              )
              .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
              }, {}),
          }));

          setLista(datosFiltrados);
          setFilteredLista(datosFiltrados);
        } else {
          console.log('No hay datos disponibles en el nodo ipa-1r');
        }
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
    const filteredData = lista.filter((item) =>
      item.Alumne_a?.toString().toLowerCase().includes(text.toLowerCase())
    );
    setFilteredLista(filteredData);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre de alumno..."
        value={search}
        onChangeText={handleSearch}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading ? (
          <Text>Cargando datos...</Text>
        ) : filteredLista.length > 0 ? (
          filteredLista.map((item) => (
            <View key={item.id} style={styles.content}>
              <Text style={styles.title}>Alumno/a:</Text>
              <Text style={styles.value}>{item.Alumne_a}</Text>

              <Text style={styles.title}>Nivel ESO:</Text>
              <Text style={styles.value}>{item.NivellESO}</Text>

              <Text style={styles.title}>Tutor/a:</Text>
              <Text style={styles.value}>{item.Tutor_a}</Text>

              <Text style={styles.title}>Proyectos:</Text>
              {Object.entries(item.Proyectos).map(([key, value]) => (
                <Text key={key} style={styles.projectText}>
                 ➪ {key}: {value}
                </Text>
              ))}
            </View>
          ))
        ) : (
          <Text>No hay datos disponibles</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    padding: 20,
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
  },
  content: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
    maxWidth: 600,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: "#333",
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
    color: "#555",
  },
  projectText: {
    fontSize: 14,
    marginLeft: 10,
    color: "#555",
  },
});
