import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Pressable } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Papa from 'papaparse';
import { getDatabase, ref, set, remove, get, update } from 'firebase/database';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function GestionProyectosScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [profesor, setProfesor] = useState('');
  const [proyectos, setProyectos] = useState([]);
  const [editId, setEditId] = useState(null);

  const db = getDatabase();

  // Cargar proyectos existentes
  useEffect(() => {
    const fetchProyectos = async () => {
      const snapshot = await get(ref(db, 'CatalogoProyectos'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const arr = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        setProyectos(arr);
      }
    };
    fetchProyectos();
  }, []);

  // Añadir o modificar proyecto
  const handleGuardar = async () => {
    if (!nombre || !profesor) {
      Alert.alert('Error', 'Omple el nom i el professor');
      return;
    }
    let id = editId;
    if (!id) {
      // Nuevo proyecto: busca el siguiente número libre
      const nums = proyectos.map(p => parseInt(p.id.split('_')[1])).filter(n => !isNaN(n));
      const nextNum = nums.length ? Math.max(...nums) + 1 : 1;
      id = `proyecto_${nextNum}`;
    }
    await set(ref(db, `CatalogoProyectos/${id}`), { nombre, profesor });
    Alert.alert('Èxit', editId ? 'Projecte modificat' : 'Projecte afegit');
    setNombre('');
    setProfesor('');
    setEditId(null);
    // Refresca lista
    const snapshot = await get(ref(db, 'CatalogoProyectos'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      const arr = Object.entries(data).map(([id, val]) => ({ id, ...val }));
      setProyectos(arr);
    }
  };

  // Eliminar proyecto
  const handleEliminar = async (id) => {
    await remove(ref(db, `CatalogoProyectos/${id}`));
    setProyectos(proyectos.filter(p => p.id !== id));
    Alert.alert('Eliminat', 'Projecte eliminat');
  };

  // Editar proyecto
  const handleEditar = (proyecto) => {
    setNombre(proyecto.nombre);
    setProfesor(proyecto.profesor);
    setEditId(proyecto.id);
  };

  // Cargar CSV
  const handleCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'text/csv' });
      console.log("DocumentPicker result:", result);

      let csvText = "";

      // WEB: assets[0].uri es base64
      if (result.assets && result.assets[0] && result.assets[0].uri.startsWith("data:text/csv;base64,")) {
        const base64 = result.assets[0].uri.split(',')[1];
        // Decodifica base64 a texto
        csvText = atob(base64);
        console.log("CSV text (web/base64):", csvText);
      }
      // MÓVIL: file:// o content://
      else if (result.uri && (result.uri.startsWith("file://") || result.uri.startsWith("content://"))) {
        try {
          const { readAsStringAsync } = await import('expo-file-system');
          csvText = await readAsStringAsync(result.uri, { encoding: 'utf8' });
          console.log("CSV text (mobile):", csvText);
        } catch (e) {
          console.log("Error leyendo archivo con FileSystem:", e);
          Alert.alert('Error', 'No s\'ha pogut llegir el fitxer CSV');
          return;
        }
      } else {
        // Fallback: intenta fetch (poco probable que funcione en web con base64)
        try {
          const response = await fetch(result.uri);
          csvText = await response.text();
          console.log("CSV text (fetch):", csvText);
        } catch (e) {
          console.log("Error leyendo archivo con fetch:", e);
          Alert.alert('Error', 'No s\'ha pogut llegir el fitxer CSV');
          return;
        }
      }

      if (!csvText) {
        Alert.alert('Error', 'No s\'ha pogut llegir el fitxer CSV');
        return;
      }

      Papa.parse(csvText, {
        header: true,
        delimiter: ";",
        complete: async (output) => {
          console.log("Papa.parse output:", output);

          let maxNum = proyectos.map(p => parseInt(p.id.split('_')[1])).filter(n => !isNaN(n));
          maxNum = maxNum.length ? Math.max(...maxNum) : 0;
          let updates = {};
          output.data.forEach((row, idx) => {
            const nombre = row["projecte"] || row["nombre proyecto"] || row["nom projecte"] || row.nombre;
            const profesor = row["nom"] || row["nombre creador"] || row["nom creador"] || row.profesor;
            console.log("Fila CSV:", row, "->", nombre, profesor);
            if (nombre && profesor) {
              const id = `proyecto_${maxNum + idx + 1}`;
              updates[id] = { nombre, profesor };
            }
          });
          console.log("Updates a guardar:", updates);

          if (Object.keys(updates).length === 0) {
            Alert.alert('Error', 'El CSV no té dades vàlides.');
            return;
          }
          await update(ref(db, 'CatalogoProyectos'), updates);
          Alert.alert('Èxit', 'Projectes afegits des de CSV');
          // Refresca la lista de proyectos
          const snapshot = await get(ref(db, 'CatalogoProyectos'));
          if (snapshot.exists()) {
            const data = snapshot.val();
            const arr = Object.entries(data).map(([id, val]) => ({ id, ...val }));
            setProyectos(arr);
          }
        },
        error: (err) => {
          console.log("Papa.parse error:", err);
          Alert.alert('Error', 'No s\'ha pogut analitzar el CSV');
        }
      });
    } catch (error) {
      console.log("Error general en handleCSV:", error);
      Alert.alert('Error', 'No s\'ha pogut carregar el CSV');
    }
  };

  // Calcula el alto de la ventana y deja espacio para cabecera/inputs
  const windowHeight = Dimensions.get('window').height;
  const listaMaxHeight = windowHeight - 420; // Ajusta 420 según lo que ocupen tus controles arriba

  // Botón de logout
  const handleLogout = () => {
    navigation.navigate('Home');
  };

  return (
    <LinearGradient colors={['#0f3057', '#00587a', '#008891']} style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        {/* Título de la pantalla */}
        <Text style={styles.headerTitle}>Gestió de Projectes</Text>
        <Pressable 
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <LinearGradient colors={['#E74C3C', '#C0392B']} style={styles.logoutGradient}>
            <Feather name="power" size={20} color="white" />
          </LinearGradient>
        </Pressable>
      </View>
      <View style={styles.container}>
        {/* Cabecera y controles fijos arriba */}
        <TextInput
          style={styles.input}
          placeholder="Nom del projecte"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          style={styles.input}
          placeholder="Professor creador"
          value={profesor}
          onChangeText={setProfesor}
        />
        {/* Botón añadir/modificar */}
        <Button title={editId ? "Modifica projecte" : "Afegeix projecte"} onPress={handleGuardar} />
        <View style={styles.separator} />
        {/* Botón cargar CSV */}
        <Button title="Carrega projectes des de CSV" onPress={handleCSV} color="#1976D2" />
        <Text style={styles.subtitle}>Projectes existents</Text>

        {/* SOLO la lista scrollea */}
        <View style={[styles.scrollContainer, { maxHeight: listaMaxHeight }]}>
          <ScrollView contentContainerStyle={styles.listContent}>
            {proyectos.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>
                No hi ha projectes
              </Text>
            ) : (
              <>
                {proyectos.map(item => (
                  <View key={item.id} style={styles.proyectoItem}>
                    <Text style={styles.proyectoText}>{item.nombre} ({item.profesor})</Text>
                    <View style={{ flexDirection: 'row' }}>
                      <Button title="Edita" onPress={() => handleEditar(item)} />
                      <View style={{ width: 10 }} />
                      <Button title="Elimina" color="red" onPress={() => handleEliminar(item.id)} />
                    </View>
                  </View>
                ))}
                <View style={{ height: 50 }} />
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </LinearGradient>
  );
}

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
  container: { flex: 1, padding: 20, backgroundColor: 'transparent' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#0f3057' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10, backgroundColor: '#fff' },
  separator: { height: 20 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#ffffffff' },
  scrollContainer: {
    flex: 1,
    minHeight: 100,
    marginTop: 10,
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  proyectoItem: { backgroundColor: '#f5f5f5', padding: 10, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  proyectoText: { fontSize: 16, flex: 1 },
});