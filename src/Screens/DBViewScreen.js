import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  Platform, 
  Dimensions, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { database } from '../services/credentials';
import { ref, get } from 'firebase/database';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const DBViewScreen = ({ navigation, route }) => {
  // Estado básico
  const [lista, setLista] = useState([]);
  const [filteredLista, setFilteredLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [nivelSeleccionado, setNivelSeleccionado] = useState('');
  const scrollViewRef = useRef(null);

  // Cargar datos sin animaciones
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

  const renderItem = (item) => (
    <View key={item.id} style={styles.content}>
      <View style={styles.itemHeader}>
        <Text style={styles.levelBadge}>{item.nivel.toUpperCase()} ESO</Text>
      </View>
      
      <Text style={styles.title}>{item.alumno || 'N/A'}</Text>
      
      {item.proyectos && Object.entries(item.proyectos).map(([key, value], index) => (
        <View key={`${item.id}-${key}-${index}`} style={styles.projectRow}>
          <Text style={styles.projectText}>
            <Text style={styles.projectLabel}>{key}:</Text> {value}
          </Text>
        </View>
      ))}
    </View>
  );

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
  <SafeAreaView style={{ flex: 1 }}>
    <View style={styles.container}>
      {/* Header simplificado */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visualización Base de Datos</Text>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate("Home")}
          style={styles.logoutButton}
        >
          <Text>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Buscador simplificado */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar alumno..."
          value={search}
          onChangeText={handleSearch}
        />

        <View style={styles.pickerWrapper}>
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
        </View>
      </View>

      {/* Contenedor principal para el scroll */}
      <View style={styles.scrollContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Cargando datos...</Text>
          </View>
        ) : filteredLista.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No se encontraron resultados</Text>
          </View>
        ) : isWeb ? (
          <View style={styles.webContent}>
            {filteredLista.map(renderItem)}
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.mobileContent}
            showsVerticalScrollIndicator={true}
          >
            {filteredLista.map(renderItem)}
            <View style={{ height: 50 }} />
          </ScrollView>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Gestión de Proyectos v1.0</Text>
      </View>
    </View>
  </SafeAreaView>
);
}

// Estilos básicos y simplificados
const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    height: isWeb ? '100%' : undefined, // Esto fuerza el alto completo en web
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  logoutButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 10,
  },
  picker: {
    height: 40,
  },
  // Contenedor para el ScrollView
  scrollContainer: {
    backgroundColor: '#fff',
  },
  webContent: {
    padding: 20,
    flex: 1,
    overflowY: 'auto',     
    overflowX: 'hidden',   
    maxHeight: '80vh',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mobileContent: {
    padding: 10,
  },
  // Item individual
  content: {
    width: isWeb ? (width > 768 ? '48%' : '100%') : '100%',
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Android
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  levelBadge: {
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  projectRow: {
    marginBottom: 5,
  },
  projectLabel: {
    fontWeight: 'bold',
  },
  projectText: {
    fontSize: 14,
  },
  // Estados de carga y sin resultados
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
  },
  // Footer
  footer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#f0f0f0',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
  },
};

export default DBViewScreen;



