import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, Pressable, Platform, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDatabase, ref, set, get, remove } from 'firebase/database';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getFunctions, httpsCallable } from 'firebase/functions';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const GestionUsuariosScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('Profesor');
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const auth = getAuth();
  const db = getDatabase();
  
  const functions = getFunctions();

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const usuariosRef = ref(db, 'usuarios');
      const snapshot = await get(usuariosRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        // SOLO profesores y admins, robusto
        const lista = Object.entries(data)
          .filter(([_, v]) => {
            const rol = String(v.rol || '').trim().toLowerCase();
            return rol === 'admin' || rol === 'profesor';
          })
          .map(([k, v]) => ({ id: k, ...v }));
        setUsuarios(lista);
      } else {
        setUsuarios([]);
      }
    } catch (e) {
      setErrorMessage('Error carregant usuaris');
    }
  };

  const resetForm = () => {
    setNombre('');
    setCorreo('');
    setPassword('');
    setRol('Profesor');
    setUsuarioSeleccionado(null);
  };

  const agregarUsuario = async () => {
    if (!nombre.trim() || !correo.trim() || !password.trim() || !rol.trim()) {
      setErrorMessage('Completa tots els camps');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, correo, password);
      const usuarioKey = correo.replace(/[@.]/g, '_');
      await set(ref(db, `usuarios/${usuarioKey}`), {
        nombre,
        correo,
        rol
      });
      setSuccessMessage('Usuari creat!');
      resetForm();
      cargarUsuarios();
    } catch (e) {
      setErrorMessage('Error: ' + e.message);
    }
  };

  const seleccionarUsuario = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setNombre(usuario.nombre);
    setCorreo(usuario.correo);
    setRol(usuario.rol);
  };

  const actualizarUsuario = async () => {
    if (!nombre.trim() || !rol.trim()) {
      setErrorMessage('Completa tots els camps');
      return;
    }
    try {
      const correoKey = usuarioSeleccionado.correo.replace(/[@.]/g, '_');
      await set(ref(db, `usuarios/${correoKey}`), {
        nombre,
        correo: usuarioSeleccionado.correo,
        rol
      });
      setSuccessMessage('Usuari actualitzat');
      resetForm();
      cargarUsuarios();
    } catch (e) {
      setErrorMessage('Error: ' + e.message);
    }
  };

  const eliminarUsuario = async (usuario) => {
    Alert.alert(
      'Eliminar usuari',
      `Segur que vols eliminar a ${usuario.nombre}?`,
      [
        { text: 'Cancel·la', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              const deleteUser = httpsCallable(functions, 'deleteUserByEmail');
              const result = await deleteUser({ email: usuario.correo });
              if (result.data.success) {
                setSuccessMessage('Usuari eliminat');
                resetForm();
                cargarUsuarios();
              } else {
                setErrorMessage('Error: ' + result.data.error);
              }
            } catch (e) {
              setErrorMessage('Error: ' + e.message);
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Home');
    } catch (e) {
      setErrorMessage('Error al sortir: ' + e.message);
    }
  };

  const handleImportCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'text/csv' });
      console.log("DocumentPicker result:", result);

      if (result.canceled) {
        console.log("Importación cancelada por el usuario.");
        return;
      }

      let csvText = "";

      // Web: base64
      if (result.assets && result.assets[0] && result.assets[0].uri.startsWith("data:text/csv;base64,")) {
        const base64 = result.assets[0].uri.split(',')[1];
        csvText = atob(base64);
        console.log("CSV text (web/base64):", csvText);
      }
      // Móvil: file:// o content://
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
        // Fallback: intenta fetch
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
        skipEmptyLines: true,
        complete: async (output) => {
          console.log("Papa.parse output:", output);

          let successCount = 0;
          let failCount = 0;
          let errores = [];

          for (const row of output.data) {
            const nombre = row.nombre?.trim();
            const correo = row.correo?.trim().toLowerCase();
            const password = row.password?.trim();
            const rol = row.rol?.trim();
            if (!nombre || !correo || !password || !rol) {
              failCount++;
              errores.push(`Faltan datos en la fila: ${JSON.stringify(row)}`);
              continue;
            }
            try {
              await createUserWithEmailAndPassword(auth, correo, password);
              const usuarioKey = correo.replace(/[@.]/g, '_');
              await set(ref(db, `usuarios/${usuarioKey}`), {
                nombre,
                correo,
                rol
              });
              successCount++;
              console.log(`Usuario creado: ${correo}`);
            } catch (e) {
              failCount++;
              errores.push(`Error con ${correo}: ${e.message}`);
              console.log(`Error creando usuario ${correo}:`, e.message);
            }
          }
          // Mensaje resumen
          const resumen = `Correctes: ${successCount}\nErrors: ${failCount}\n${errores.join('\n')}`;
          Alert.alert('Importació finalitzada', resumen);
          console.log(resumen);
          cargarUsuarios();
        },
        error: (err) => {
          Alert.alert('Error', 'No s\'ha pogut analitzar el CSV');
          console.log("Papa.parse error:", err);
        }
      });
    } catch (error) {
      Alert.alert('Error', 'No s\'ha pogut importar el CSV');
      console.log("Error general en handleImportCSV:", error);
    }
  };

  const renderUsuarioCard = (usuario) => (
    <View key={usuario.id} style={styles.usuarioCard}>
      <Text style={styles.usuarioNombre}>{usuario.nombre}</Text>
      <Text style={styles.usuarioCorreo}>{usuario.correo}</Text>
      <Text style={styles.usuarioRol}>{usuario.rol}</Text>
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <TouchableOpacity style={styles.editButton} onPress={() => seleccionarUsuario(usuario)}>
          <Feather name="edit-2" size={18} color="#1976D2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => eliminarUsuario(usuario)}>
          <Feather name="trash-2" size={18} color="#e53935" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
  <LinearGradient colors={['#0f3057', '#00587a', '#008891']} style={{ flex: 1 }}>
    <View style={{ flex: 1, minHeight: 0 }}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestió de Professors i Administradors</Text>
        <Pressable 
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <LinearGradient colors={['#E74C3C', '#C0392B']} style={styles.logoutGradient}>
            <Feather name="power" size={20} color="white" />
          </LinearGradient>
        </Pressable>
      </View>

      <View style={styles.scrollContent}>
        {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nom"
            value={nombre}
            onChangeText={setNombre}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Correu"
            value={correo}
            onChangeText={setCorreo}
            autoCapitalize="none"
            editable={!usuarioSeleccionado}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Contrasenya"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!usuarioSeleccionado}
            placeholderTextColor="#888"
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={rol}
              onValueChange={setRol}
              style={styles.picker}
              enabled={true}
              dropdownIconColor="#1976D2"
            >
              <Picker.Item label="Profesor" value="Profesor" />
              <Picker.Item label="Admin" value="Admin" />
            </Picker>
          </View>
          {!usuarioSeleccionado ? (
            <TouchableOpacity style={styles.addButton} onPress={agregarUsuario}>
              <Text style={styles.buttonText}>Afegeix Usuari</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.updateButton} onPress={actualizarUsuario}>
                <Text style={styles.buttonText}>Desa Canvis</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.buttonText}>Cancel·la</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleImportCSV}>
          <Text style={styles.buttonText}>Importa usuaris des de CSV</Text>
        </TouchableOpacity>

        <Text style={styles.subtitle}>Llista de Professors i Administradors</Text>
        {/* BLOQUE DE USUARIOS */}
        <View style={{ flex: 1, minHeight: 0 }}>
          {isWeb ? (
            <View style={styles.webContent}>
              {usuarios.length === 0 ? (
                <Text style={styles.noResultsText}>No s'han trobat usuaris</Text>
              ) : (
                usuarios.map((usuario) => renderUsuarioCard(usuario))
              )}
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.mobileContent} showsVerticalScrollIndicator={true}>
              {usuarios.length === 0 ? (
                <Text style={styles.noResultsText}>No s'han trobat usuaris</Text>
              ) : (
                usuarios.map((usuario) => renderUsuarioCard(usuario))
              )}
              <View style={{ height: 50 }} />
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  </LinearGradient>
);
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    position: 'relative',
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  logoutButton: {
    padding: 10,
  },
  logoutGradient: {
    borderRadius: 20,
    padding: 5,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  success: {
    color: '#4CAF50',
    marginBottom: 10,
    textAlign: 'center',
  },
  error: {
    color: '#F44336',
    marginBottom: 10,
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  addButton: {
    backgroundColor: '#007BFF',
    borderRadius: 4,
    paddingVertical: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: '#28A745',
    borderRadius: 4,
    paddingVertical: 15,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#DC3545',
    borderRadius: 4,
    paddingVertical: 15,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    marginTop: 20,
  },
  usuarioCard: {
    width: isWeb ? (width > 900 ? '31%' : width > 600 ? '48%' : '100%') : '100%',
    minHeight: 120,
    maxWidth: 440,
    marginBottom: 24,
    padding: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.90)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(52,152,219,0.10)',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  usuarioNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  usuarioCorreo: {
    fontSize: 14,
    color: '#666',
  },
  usuarioRol: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  editButton: {
    padding: 10,
  },
  deleteButton: {
    padding: 10,
  },
  webContent: {
    padding: 20, 
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    maxHeight: '80vh', // abans 80vh
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 24,
  },
  scrollContainer: {
    backgroundColor: 'transparent',
    flex: 1,
    minHeight: 200,
  },
  mobileContent: {
    padding: 14,
  },
  noResultsText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default GestionUsuariosScreen;