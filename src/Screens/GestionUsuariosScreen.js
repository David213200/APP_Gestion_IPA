import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDatabase, ref, set, get, remove } from 'firebase/database';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getFunctions, httpsCallable } from 'firebase/functions';

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
        // Solo profesores y admins
        const lista = Object.entries(data)
          .filter(([_, v]) => v.rol === 'Profesor' || v.rol === 'Admin')
          .map(([k, v]) => ({ id: k, ...v }));
        setUsuarios(lista);
      } else {
        setUsuarios([]);
      }
    } catch (e) {
      setErrorMessage('Error cargando usuarios');
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
      setErrorMessage('Completa todos los campos');
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
      setSuccessMessage('¡Usuario creado!');
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
      setErrorMessage('Completa todos los campos');
      return;
    }
    try {
      const correoKey = usuarioSeleccionado.correo.replace(/[@.]/g, '_');
      await set(ref(db, `usuarios/${correoKey}`), {
        nombre,
        correo: usuarioSeleccionado.correo,
        rol
      });
      setSuccessMessage('Usuario actualizado');
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
                setSuccessMessage('Usuario eliminado');
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
      setErrorMessage('Error al salir: ' + e.message);
    }
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
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

        <Text style={styles.subtitle}>Llista de Professors i Administradors</Text>
        {usuarios.map((usuario) => (
          <View key={usuario.id} style={styles.usuarioItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.usuarioNombre}>{usuario.nombre}</Text>
              <Text style={styles.usuarioCorreo}>{usuario.correo}</Text>
              <Text style={styles.usuarioRol}>{usuario.rol}</Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => seleccionarUsuario(usuario)}>
              <Feather name="edit-2" size={18} color="#1976D2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => eliminarUsuario(usuario)}>
              <Feather name="trash-2" size={18} color="#e53935" />
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ height: 50 }} />
      </ScrollView>
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
    backgroundColor: '#223047',
    height: '100%',
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 18,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#b0bec5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    color: '#223047',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#b0bec5',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 40,
    width: '100%',
    color: '#223047',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  updateButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginTop: 4,
  },
  cancelButton: {
    backgroundColor: '#e53935',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  success: {
    color: '#388e3c',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  error: {
    color: '#e53935',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
    color: '#fff',
    alignSelf: 'flex-start',
  },
  usuarioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    width: '100%',
    maxWidth: 400,
    elevation: 1,
  },
  usuarioNombre: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0f3057',
  },
  usuarioCorreo: {
    color: '#555',
    fontSize: 14,
  },
  usuarioRol: {
    color: '#008891',
    fontSize: 14,
  },
  editButton: {
    backgroundColor: 'rgba(33,150,243,0.08)',
    padding: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(229,57,53,0.08)',
    padding: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
});

export default GestionUsuariosScreen;