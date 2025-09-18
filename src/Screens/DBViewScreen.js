import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  Platform, 
  Dimensions, 
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { database } from '../services/credentials';
import { ref, get } from 'firebase/database';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
  <LinearGradient colors={['#0f3057', '#00587a', '#008891']} style={{ flex: 1 }}>
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visualización Base de Datos</Text>
        <Pressable 
          onPress={() => navigation.navigate("Home")}
          style={styles.logoutButton}
        >
          <LinearGradient colors={['#E74C3C', '#C0392B']} style={styles.logoutGradient}>
            <Feather name="power" size={20} color="white" />
          </LinearGradient>
        </Pressable>
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
    </SafeAreaView>
  </LinearGradient>
);
}

// Estilos básicos y simplificados
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  logoutGradient: {
    padding: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#223047', // Azul oscuro de fondo general
    height: isWeb ? '100%' : undefined,
  },
  searchContainer: {
    padding: 14,
    backgroundColor: 'rgba(41,128,185,0.13)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 10,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    color: '#fff',
    fontSize: 15,
    marginRight: 8,
  },
  pickerWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(41,128,185,0.18)',
    marginLeft: 8,
    flex: 0.7,
  },
  picker: {
    height: 40,
    color: '#fff',
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    backgroundColor: 'transparent',
  },
  webContent: {
    padding: 20,
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    maxHeight: '80vh',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 24,
  },
  mobileContent: {
    padding: 14,
  },
  content: {
    width: isWeb ? (width > 900 ? '31%' : width > 600 ? '48%' : '100%') : '100%',
    minHeight: 440,      // Alto mínimo para tarjetas pequeñas
    maxHeight: 440,      // Alto máximo para igualar todas
    maxWidth: 440,       // Ancho máximo para que no se estiren demasiado
    marginBottom: 24,
    padding: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.90)', // Fondo claro para la tarjeta
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(52,152,219,0.10)',
    justifyContent: 'flex-start',
    overflow: 'hidden',  // Oculta el contenido que se salga
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  levelBadge: {
    fontWeight: 'bold',
    color: '#16A085',
    backgroundColor: 'rgba(22,160,133,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    fontSize: 13,
    overflow: 'hidden',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#223047', // Texto oscuro
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  projectRow: {
    marginBottom: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(41,128,185,0.08)', // Azul muy suave
  },
  projectLabel: {
    fontWeight: 'bold',
    color: '#16A085', // Verde para destacar
    fontSize: 14,
  },
  projectText: {
    fontSize: 14,
    color: '#223047', // Texto oscuro
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.7,
  },
  footer: {
    padding: 10,
    borderTopWidth: 0,
    backgroundColor: 'rgba(44,62,80,0.95)',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#fff',
    opacity: 0.7,
  },
});

export default DBViewScreen;



