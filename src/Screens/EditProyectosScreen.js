import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';
import { database } from '../services/credentials';
import { ref, update, get } from 'firebase/database';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const EditProyectosScreen = ({ navigation, route }) => {
  const { student } = route.params;
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectStatus, setNewProjectStatus] = useState('Assignada');
  const [assignades, setAssignades] = useState('0');
  const [total, setTotal] = useState('0');
  const [totalAcabades, setTotalAcabades] = useState('0');
  const [loading, setLoading] = useState(false);
  const [catalogoProyectos, setCatalogoProyectos] = useState([]);
  const [catalogoLoading, setCatalogoLoading] = useState(true);

  useEffect(() => {
    if (student.proyectos) {
      const proyectosData = student.proyectos;
      const proyectosArray = Object.entries(proyectosData)
        .filter(([key]) => !key.startsWith('_'))
        .map(([nombre, estado]) => ({ nombre, estado }));
      
      setProjects(proyectosArray);
      setAssignades(proyectosData._assignades?.toString() || '0');
      setTotal(proyectosData._total?.toString() || '0');
      setTotalAcabades(proyectosData._total_acabades?.toString() || '0');
    }
  }, []);

  useEffect(() => {
    const fetchCatalogo = async () => {
      try {
        const refCat = ref(database, 'CatalogoProyectos');
        const snap = await get(refCat);
        if (snap.exists()) {
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
    fetchCatalogo();
  }, []);

  const handleProjectChange = (index, field, value) => {
    const newProjects = [...projects];
    newProjects[index][field] = value;
    setProjects(newProjects);
  };

  const addNewProject = () => {
    if (!newProjectName.trim()) {
      Alert.alert('Error', "El nom del projecte és obligatori");
      return;
    }
    
    if (projects.some(p => p.nombre === newProjectName)) {
      Alert.alert('Error', "Ja existeix un projecte amb aquest nom");
      return;
    }

    setProjects([...projects, { nombre: newProjectName, estado: newProjectStatus }]);
    setNewProjectName('');
    setNewProjectStatus('Assignada');
  };

  const removeProject = (index) => {
    const newProjects = projects.filter((_, i) => i !== index);
    setProjects(newProjects);
  };

  const validateFields = () => {
    if (projects.length === 0) {
      Alert.alert('Error', "Ha d'existir almenys un projecte");
      return false;
    }
    
    for (const project of projects) {
      if (!project.nombre.trim()) {
        Alert.alert('Error', "Tots els projectes han de tenir un nom");
        return false;
      }
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateFields()) return;
    
    const proyectosData = {
      _assignades: assignades,
      _total: total,
      _total_acabades: totalAcabades
    };

    projects.forEach(project => {
      proyectosData[project.nombre] = project.estado;
    });

    setLoading(true);
    try {
      const nivelPath = `proyectos_sanitizado_${student.nivel}`;
      const studentRef = ref(database, `proyectos/${nivelPath}/${student.id}/proyectos`);
      await update(studentRef, proyectosData);
      
      Alert.alert('Èxit', 'Dades desades correctament');
      navigation.goBack();
    } catch (error) {
      console.error("Error saving proyectos: ", error);
      Alert.alert('Error', "No s'han pogut desar les dades");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#2C3E50', '#3498DB']} style={styles.gradient}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top']}>

            <View style={{ padding: 20, flex: 1, overflowY: 'auto', overflowX: 'hidden', maxHeight: '80vh'}}>
              <Text style={styles.title}>Editar Projectes - {student.alumno}</Text>
    
              {projects.map((project, index) => (
                <View key={index} style={styles.projectCard}>
                  <View style={styles.projectHeader}>
                    <Text style={styles.projectNumber}>Projecte {index + 1}</Text>
                    <Pressable onPress={() => removeProject(index)}>
                      <Feather name="trash-2" size={20} color="#e74c3c" />
                    </Pressable>
                  </View>
    
                  <Text style={styles.label}>Nom del Projecte</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={project.nombre}
                      onValueChange={(value) => handleProjectChange(index, 'nombre', value)}
                      dropdownIconColor="#4ECDC4"
                    >
                      <Picker.Item label="Selecciona un projecte..." value="" />
                      {catalogoProyectos.map((p, idx) => (
                        <Picker.Item key={idx} label={p.nombre} value={p.nombre} />
                      ))}
                    </Picker>
                  </View>
                  {project.nombre ? (
                    <Text style={{ color: '#4ECDC4', marginTop: 5 }}>
                      Professor creador: {catalogoProyectos.find(p => p.nombre === project.nombre)?.profesor || '—'}
                    </Text>
                  ) : null}
    
                  <Text style={styles.label}>Estat</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={project.estado}
                      onValueChange={(value) => handleProjectChange(index, 'estado', value)}
                      dropdownIconColor="#4ECDC4"
                    >
                      <Picker.Item label="Assignada" value="Assignada" />
                      <Picker.Item label="Acabada" value="Acabada" />
                      <Picker.Item label="En curs" value="En curs" />
                      <Picker.Item label="1r trim" value="1r trim" />
                      <Picker.Item label="2n trim" value="2n trim" />
                    </Picker>
                  </View>
                </View>
              ))}
    
              <View style={styles.newProjectContainer}>
                <Text style={styles.sectionTitle}>Afegir Nou Projecte</Text>
    
                <Text style={styles.label}>Nom del Projecte</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newProjectName}
                    onValueChange={setNewProjectName}
                    dropdownIconColor="#4ECDC4"
                  >
                    <Picker.Item label="Selecciona un projecte..." value="" />
                    {catalogoProyectos.map((p, idx) => (
                      <Picker.Item key={idx} label={p.nombre} value={p.nombre} />
                    ))}
                  </Picker>
                </View>
                {newProjectName ? (
                  <Text style={{ color: '#4ECDC4', marginTop: 5 }}>
                    Professor creador: {catalogoProyectos.find(p => p.nombre === newProjectName)?.profesor || '—'}
                  </Text>
                ) : null}
    
                <Text style={styles.label}>Estat Inicial</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newProjectStatus}
                    onValueChange={setNewProjectStatus}
                    dropdownIconColor="#4ECDC4"
                  >
                    <Picker.Item label="Assignada" value="Assignada" />
                    <Picker.Item label="En curs" value="En curs" />

                  </Picker>
                </View>
    
                <Pressable onPress={addNewProject} style={styles.addButton}>
                  <LinearGradient colors={['#1ABC9C', '#16A085']} style={styles.addButtonGradient}>
                    <Feather name="plus" size={24} color="white" />
                    <Text style={styles.addButtonText}>Afegir Projecte</Text>
                  </LinearGradient>
                </Pressable>
              </View>
    
              <View style={styles.statsContainer}>
                <Text style={styles.sectionTitle}>Estadístiques</Text>
    
                <View style={styles.statsRow}>
                  <View style={styles.statInput}>
                    <Text style={styles.label}>Assignades</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={assignades}
                      onChangeText={setAssignades}
                    />
                  </View>
    
                  <View style={styles.statInput}>
                    <Text style={styles.label}>Total</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={total}
                      onChangeText={setTotal}
                    />
                  </View>
    
                  <View style={styles.statInput}>
                    <Text style={styles.label}>Acabades</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={totalAcabades}
                      onChangeText={setTotalAcabades}
                    />
                  </View>
                </View>
              </View>
            </View>
    
            <Pressable 
              onPress={handleSave} 
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              disabled={loading}
            >
              <LinearGradient colors={['#1ABC9C', '#16A085']} style={styles.button}>
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Desar Canvis</Text>
                )}
              </LinearGradient>
            </Pressable>
          </SafeAreaView>
        </SafeAreaProvider>
    </LinearGradient>
  );
};
  

const styles = {
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  gradient: {
    flex: 1,
    ...Platform.select({
      web: {
        height: '100vh',  
        minHeight: '100vh',
      },
      default: {
        height: '100%'
      }
    })
  },
  keyboardAvoiding: {
    flex: 1,
    ...Platform.select({
      web: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }
    })
  },
  scrollView: {
    flex: 1,
    ...Platform.select({
      web: {
        height: 'calc(100vh - 100px)', // Espacio para el botón
        overflowY: 'auto'
      }
    })
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    ...Platform.select({
      web: {
        minHeight: '100%',
        paddingBottom: 100 // Igual al alto del botón
      },
      default: {
        paddingBottom: 100
      }
    })
  },
  buttonContainer: {
    ...Platform.select({
      web: {
        position: 'fixed',
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 1000
      },
      default: {
        paddingHorizontal: 20,
        paddingBottom: 20
      }
    })
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  projectCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  projectNumber: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  label: {
    color: '#4ECDC4',
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  newProjectContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
  },
  statsContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statInput: {
    flex: 1,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  addButton: {
    marginTop: 15,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: '600',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 25,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
};

export default EditProyectosScreen;