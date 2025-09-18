// ManageProyectosScreen.js
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  FlatList, 
  ActivityIndicator, 
  TextInput,
  Animated,
  TouchableOpacity 
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { database } from '../services/credentials';
import { ref, get } from 'firebase/database';

const ManageProyectosScreen = ({ navigation, route }) => {
  const { user, role } = route.params || {};
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [nivelSeleccionado, setNivelSeleccionado] = useState('');
  const [catalogoProyectos, setCatalogoProyectos] = useState([]);
  const [catalogoLoading, setCatalogoLoading] = useState(true);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();
    
    fetchStudents();
    fetchCatalogo();
  }, []);

  const fetchStudents = async () => {
    try {
      const niveles = ['proyectos_sanitizado_1r', 'proyectos_sanitizado_2n', 
                      'proyectos_sanitizado_3r', 'proyectos_sanitizado_4t'];
      let allStudents = [];

      for (const nivel of niveles) {
        const dbRef = ref(database, `proyectos/${nivel}`);
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          Object.entries(data).forEach(([id, studentData]) => {
            allStudents.push({
              id,
              ...studentData,
              nivel: nivel.replace('proyectos_sanitizado_', ''),
              path: nivel
            });
          });
        }
      }
      // No filtres por tutor, muestra todos los alumnos
      // if (role === 'professor' && user?.nombre) {
      //   const nombreProfesor = user.nombre.trim().toLowerCase();
      //   allStudents = allStudents.filter(student =>
      //     (student.tutor || '').trim().toLowerCase() === nombreProfesor
      //   );
      // }

      setStudents(allStudents);
      setFilteredStudents(allStudents);
    } catch (error) {
      console.error("Error fetching students: ", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogo = async () => {
    try {
      const refCat = ref(database, 'CatalogoProyectos');
      const snap = await get(refCat);
      if (snap.exists()) {
        // Convierte a array de objetos {nombre, profesor}
        const arr = Object.values(snap.val()).map(p => ({
          nombre: p.nombre,
          profesor: p.profesor
        }));
        setCatalogoProyectos(arr);
      }
    } catch (e) {
      console.error("Error cargando catálogo:", e);
    } finally {
      setCatalogoLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    filterStudents(text, nivelSeleccionado);
  };

  const filterStudents = (searchText = search, nivel = nivelSeleccionado) => {
    let filtered = students;

    if (nivel) {
      filtered = filtered.filter(student => 
        student.nivel === nivel
      );
    }

    if (searchText) {
      filtered = filtered.filter(student =>
        student.alumno?.toLowerCase().includes(searchText.toLowerCase()))
    }

    setFilteredStudents(filtered);
  };

  const handleSelectStudent = (student) => {
    navigation.navigate('EditP', { student, user, role });
  };

  const puedeAsignarPropuesta = (propuesta, student) => {
    return true;  
  };

  let propuestasDisponibles = [];
  if (alumnoSeleccionado) {
    propuestasDisponibles = catalogoProyectos.filter(propuesta =>
      puedeAsignarPropuesta(propuesta, alumnoSeleccionado)
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#2C3E50', '#3498DB']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edició de Projectes</Text>
          
          <Pressable 
            onPress={() => navigation.navigate("Home")}
            style={({ pressed }) => [
              styles.logoutButton,
              //{ transform: [{ scale: pressed ? 0.95 : 1 }] }
            ]}
          >
            <LinearGradient colors={['#E74C3C', '#C0392B']} style={styles.logoutGradient}>
              <Feather name="power" size={20} color="white" />
            </LinearGradient>
          </Pressable>
        </View>

        <Animated.View style={[styles.searchContainer, { opacity: fadeAnim }]}>
          <LinearGradient 
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']} 
            style={styles.inputWrapper}>
            <Feather name="search" size={20} color="#4ECDC4" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cerca alumne..."
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={search}
              onChangeText={handleSearch}
            />
          </LinearGradient>

          <View style={styles.pickerWrapper}>
            <LinearGradient colors={['#1ABC9C', '#16A085']} style={styles.pickerGradient}>
              <Picker
                selectedValue={nivelSeleccionado}
                style={styles.picker}
                dropdownIconColor="black"
                onValueChange={(itemValue) => {
                  setNivelSeleccionado(itemValue);
                  filterStudents(search, itemValue);
                }}
              >
                <Picker.Item label="Tots els cursos" value="" />
                <Picker.Item label="1r ESO" value="1r" />
                <Picker.Item label="2n ESO" value="2n" />
                <Picker.Item label="3r ESO" value="3r" />
                <Picker.Item label="4t ESO" value="4t" />
              </Picker>
            </LinearGradient>
          </View>
        </Animated.View>

        <FlatList
          style={{ padding: 20, flex: 1, overflowY: 'auto', overflowX: 'hidden', maxHeight: '80vh' }} 
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable 
              onPress={() => handleSelectStudent(item)}
              style={({ pressed }) => [
                styles.pressableItem,
                { transform: [{ scale: pressed ? 0.98 : 1 }] }
              ]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                style={styles.studentCard}
              >
                <Text style={styles.studentName}>{item.alumno}</Text>
                <View style={styles.infoContainer}>
                  <Text style={styles.studentLevel}>{item.nivel.toUpperCase()} ESO</Text>
                  <Feather name="edit-2" size={18} color="#4ECDC4" />
                </View>
              </LinearGradient>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No s'han trobat alumnes</Text>
          }
        />

        {alumnoSeleccionado && (
          <View>
            <Text>Propostes disponibles per a {alumnoSeleccionado.alumno}:</Text>
            {catalogoProyectos.length === 0 ? (
              <Text>No hi ha propostes disponibles</Text>
            ) : (
              catalogoProyectos.map((propuesta, idx) => {
                const puedeAsignar = puedeAsignarPropuesta(propuesta, alumnoSeleccionado);
                return (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ flex: 1 }}>{propuesta.nombre} ({propuesta.profesor})</Text>
                    <Pressable
                      onPress={() => puedeAsignar && handleAsignarPropuesta(propuesta, alumnoSeleccionado)}
                      disabled={!puedeAsignar}
                      style={{
                        backgroundColor: puedeAsignar ? '#1976D2' : '#ccc',
                        padding: 6,
                        borderRadius: 6,
                        marginLeft: 8,
                        opacity: puedeAsignar ? 1 : 0.5,
                      }}
                    >
                      <Text style={{ color: 'white' }}>Assigna</Text>
                    </Pressable>
                  </View>
                );
              })
            )}
          </View>
        )}

      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = {
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    marginBottom: 20,
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
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C3E50'
  },
  searchContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    height: 50,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  pickerWrapper: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  pickerGradient: {
    paddingHorizontal: 15,
  },
  picker: {
    height: 50,
    color: 'black',
  },
  listContent: {
    paddingBottom: 20,
  },
  pressableItem: {
    marginBottom: 15,
  },
  studentCard: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  studentName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentLevel: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
};

export default ManageProyectosScreen;