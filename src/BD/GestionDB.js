import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text,
  Pressable,
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

// Firebase imports
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, get, update, remove } from 'firebase/database';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDy5fUIBhZLpKBtGrLlfkf2b7hQxnvsq74",
  authDomain: "ipa-app-93325.firebaseapp.com",
  databaseURL: "https://ipa-app-93325-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ipa-app-93325",
  storageBucket: "ipa-app-93325.firebasestorage.app",
  messagingSenderId: "710571178171",
  appId: "1:710571178171:web:c0d9df9dc15dee8399d19e"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); 
}
const database = getDatabase(app);

const GestionDB = ({ navigation }) => {
  const scrollRef = useRef(null);
  const [nombre, setNombre] = useState('');
  const [tutor, setTutor] = useState('');
  const [curso, setCurso] = useState('1r');
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resultadoImportacion, setResultadoImportacion] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Efecto para controlar el scroll con rueda en web
  useEffect(() => {
    if (Platform.OS === 'web' && scrollRef.current) {
      const handleWheel = (e) => {
        e.preventDefault();
        const scrollContainer = scrollRef.current;
        const scrollAmount = e.deltaY * 1.5; // Velocidad de scroll ajustable
        scrollContainer.scrollTop += scrollAmount;
      };

      const container = scrollRef.current;
      container.addEventListener('wheel', handleWheel, { passive: false });

      return () => {
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);

  useEffect(() => {
    cargarAlumnos(curso);
  }, [curso]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const cargarAlumnos = async (cursoValue) => {
    setLoading(true);
    try {
      const cursoPath = `proyectos/proyectos_sanitizado_${cursoValue}`;
      const alumnosRef = ref(database, cursoPath);
      const snapshot = await get(alumnosRef);
      
      if (snapshot.exists()) {
        const alumnosData = Object.entries(snapshot.val()).map(([id, alumno]) => ({ id, ...alumno }));
        setAlumnos(alumnosData);
      } else {
        setAlumnos([]);
      }
    } catch (error) {
      setErrorMessage(`Error cargando alumnos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const agregarAlumno = async () => {
    if (!nombre.trim() || !tutor.trim()) {
      setErrorMessage("Complete todos los campos");
      return;
    }

    try {
      const cursoPath = `proyectos/proyectos_sanitizado_${curso}`;
      const alumnosRef = ref(database, cursoPath);
      const snapshot = await get(alumnosRef);
      const totalAlumnos = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
      const nuevoId = `proyectos_sanitizado_${curso}_alumno_${totalAlumnos}`;

      await set(ref(database, `${cursoPath}/${nuevoId}`), {
        alumno: nombre,
        nivel: curso,
        tutor: tutor,
        proyectos: {}
      });

      setSuccessMessage("¡Alumno agregado!");
      resetForm();
      await cargarAlumnos(curso);
    } catch (error) {
      setErrorMessage(`Error: ${error.message}`);
    }
  };

  const actualizarAlumno = async () => {
    if (!alumnoSeleccionado) return;
    
    if (!nombre.trim() || !tutor.trim()) {
      setErrorMessage("Complete todos los campos");
      return;
    }

    try {
      const path = `proyectos/proyectos_sanitizado_${alumnoSeleccionado.curso}/${alumnoSeleccionado.id}`;
      await update(ref(database, path), { alumno: nombre, tutor: tutor });
      setSuccessMessage("¡Cambios guardados!");
      resetForm();
      await cargarAlumnos(curso);
    } catch (error) {
      setErrorMessage(`Error al actualizar: ${error.message}`);
    }
  };

  const editarAlumno = async (cursoAlumno, idAlumno) => {
    try {
      const path = `proyectos/proyectos_sanitizado_${cursoAlumno}/${idAlumno}`;
      const snapshot = await get(ref(database, path));
      
      if (snapshot.exists()) {
        setAlumnoSeleccionado({ id: idAlumno, curso: cursoAlumno });
        setNombre(snapshot.val().alumno);
        setTutor(snapshot.val().tutor);
      }
    } catch (error) {
      setErrorMessage(`Error al cargar para editar: ${error.message}`);
    }
  };

  const eliminarAlumno = async (cursoAlumno, idAlumno) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Eliminar este alumno permanentemente?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          onPress: async () => {
            try {
              await remove(ref(database, `proyectos/proyectos_sanitizado_${cursoAlumno}/${idAlumno}`));
              await cargarAlumnos(curso);
              setSuccessMessage("Alumno eliminado");
            } catch (error) {
              setErrorMessage(`Error al eliminar: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setNombre('');
    setTutor('');
    setAlumnoSeleccionado(null);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'text/*' });
      if (result.canceled) return;

      if (result.assets?.[0]) {
        const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
        const resultados = await procesarCSV(fileContent);
        setResultadoImportacion(resultados);
        setShowModal(true);
      }
    } catch (error) {
      setErrorMessage(`Error seleccionando archivo: ${error.message}`);
    }
  };

  const procesarCSV = async (csvString) => {
    const resultados = { total: 0, exitos: 0, errores: 0, erroresDetalles: [] };
    const alumnosPorCurso = {};

    csvString.split('\n').forEach((linea, index) => {
      if (!linea.trim()) return;
      
      resultados.total++;
      const partes = linea.split(';');
      
      if (partes.length < 3) {
        resultados.errores++;
        resultados.erroresDetalles.push(`Fila ${index + 1}: Campos incompletos`);
        return;
      }
      
      const [alumno, nivel, tutor] = partes;
      if (!alumno || !nivel || !tutor || !['1r','2n','3r','4t'].includes(nivel)) {
        resultados.errores++;
        resultados.erroresDetalles.push(`Fila ${index + 1}: ${!['1r','2n','3r','4t'].includes(nivel) ? 'Curso inválido' : 'Campos incompletos'}`);
        return;
      }
      
      (alumnosPorCurso[nivel] = alumnosPorCurso[nivel] || []).push({ alumno, tutor });
    });

    for (const [curso, alumnos] of Object.entries(alumnosPorCurso)) {
      try {
        const updates = {};
        const snapshot = await get(ref(database, `proyectos/proyectos_sanitizado_${curso}`));
        let contador = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;

        alumnos.forEach((alumno) => {
          const nuevoId = `proyectos_sanitizado_${curso}_alumno_${contador++}`;
          updates[`proyectos/proyectos_sanitizado_${curso}/${nuevoId}`] = {
            alumno: alumno.alumno,
            nivel: curso,
            tutor: alumno.tutor,
            proyectos: {}
          };
        });

        await update(ref(database), updates);
        resultados.exitos += alumnos.length;
      } catch (error) {
        resultados.errores += alumnos.length;
        resultados.erroresDetalles.push(`Error en curso ${curso}: ${error.message}`);
      }
    }

    await cargarAlumnos(curso);
    return resultados;
  };

  return (
    <LinearGradient
      colors={['#0f3057', '#00587a', '#008891']}
      style={[styles.gradient, Platform.OS === 'web' && styles.webGradient]}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CRUD Alumnes</Text>
        
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

      <View 
        style={{  padding: 20,
                  flex: 1,
                  overflowY: 'auto',     
                  overflowX: 'hidden',   
                  maxHeight: '80vh'}}>
        {successMessage && (
          <View style={styles.successMessage}>
            <Text style={styles.messageText}>{successMessage}</Text>
          </View>
        )}
        
        {errorMessage && (
          <View style={styles.errorMessage}>
            <Text style={styles.messageText}>{errorMessage}</Text>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Curso:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={curso}
              onValueChange={setCurso}
              style={styles.picker}
              dropdownIconColor="#4a5568"
            >
              <Picker.Item label="1r" value="1r" />
              <Picker.Item label="2n" value="2n" />
              <Picker.Item label="3r" value="3r" />
              <Picker.Item label="4t" value="4t" />
            </Picker>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nombre:</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre del alumno"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tutor:</Text>
            <TextInput
              style={styles.input}
              value={tutor}
              onChangeText={setTutor}
              placeholder="Nombre del tutor"
            />
          </View>

          <View style={styles.buttonGroup}>
            {!alumnoSeleccionado ? (
              <TouchableOpacity style={styles.addButton} onPress={agregarAlumno}>
                <Text style={styles.buttonText}>Agregar Alumno</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={styles.updateButton} onPress={actualizarAlumno}>
                  <Text style={styles.buttonText}>Guardar Cambios</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.importCard}>
          <Text style={styles.sectionTitle}>Importar desde CSV</Text>
          <Text style={styles.importInfo}>Formato esperado: nombre;curso;tutor</Text>
          <TouchableOpacity style={styles.importButton} onPress={pickDocument}>
            <Text style={styles.buttonText}>Seleccionar Archivo CSV</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.studentsCard}>
          <Text style={styles.sectionTitle}>Lista de Alumnos</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
          ) : alumnos.length > 0 ? (
            alumnos.map((alumno) => (
              <View key={alumno.id} style={styles.alumnoItem}>
                <View style={styles.alumnoInfo}>
                  <Text style={styles.alumnoName}>{alumno.alumno}</Text>
                  <Text style={styles.alumnoTutor}>Tutor: {alumno.tutor}</Text>
                </View>
                <View style={styles.alumnoActions}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => editarAlumno(curso, alumno.id)}
                  >
                    <MaterialIcons name="edit" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => eliminarAlumno(curso, alumno.id)}
                  >
                    <MaterialIcons name="delete" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noStudents}>No hay alumnos en este curso</Text>
          )}
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Resultado de la importación</Text>
              
              {resultadoImportacion && (
                <View style={styles.resultContainer}>
                  <Text style={styles.resultText}>Total procesado: {resultadoImportacion.total}</Text>
                  <Text style={styles.resultText}>Éxitos: {resultadoImportacion.exitos}</Text>
                  <Text style={styles.resultText}>Errores: {resultadoImportacion.errores}</Text>
                  
                  {resultadoImportacion.erroresDetalles.length > 0 && (
                    <View style={styles.erroresContainer}>
                      <Text style={styles.erroresTitle}>Errores en filas:</Text>
                      <ScrollView style={styles.erroresList}>
                        {resultadoImportacion.erroresDetalles.map((error, index) => (
                          <Text key={index} style={styles.errorDetail}>{error}</Text>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
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
  gradient: {
      flex: 1,
      ...(Platform.OS === 'web' && { minHeight: '100vh' }),
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
  container: {
    flex: 1,
    ...(Platform.OS === 'web' ? {
      height: '100vh',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
    } : {}),
  },  
  contentContainer: {
    padding: 20,
    paddingBottom: 50,
    flexGrow: 1,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    flex: 1,
  },
  updateButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    flex: 1,
  },
  importButton: {
    backgroundColor: '#ff9800',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  importCard: {
    backgroundColor: 'rgba(255, 140, 0, 0.15)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 0, 0.3)',
  },
  studentsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  importInfo: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
    fontSize: 14,
  },
  alumnoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  alumnoInfo: {
    flex: 1,
  },
  alumnoName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  alumnoTutor: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 5,
  },
  alumnoActions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 5,
  },
  noStudents: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  loader: {
    marginTop: 20,
  },
  successMessage: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorMessage: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  messageText: {
    color: 'white',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  resultContainer: {
    width: '100%',
  },
  resultText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  erroresContainer: {
    marginTop: 15,
    width: '100%',
  },
  erroresTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#d32f2f',
  },
  erroresList: {
    maxHeight: 150,
  },
  errorDetail: {
    fontSize: 14,
    color: '#d32f2f',
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    marginTop: 20,
    paddingHorizontal: 30,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

export default GestionDB;