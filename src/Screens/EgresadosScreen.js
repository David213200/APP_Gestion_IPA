import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Pressable } from 'react-native';
import { getDatabase, ref, get } from 'firebase/database';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function EgresadosScreen({ navigation }) {
  const [egresados, setEgresados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEgresados = async () => {
      setLoading(true);
      const db = getDatabase();
      const snapshot = await get(ref(db, 'alumnos_egresados'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const arr = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        setEgresados(arr);
      } else {
        setEgresados([]);
      }
      setLoading(false);
    };
    fetchEgresados();
  }, []);

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
        <Text style={styles.headerTitle}>Alumnos Egresados</Text>
        <Pressable 
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <LinearGradient colors={['#E74C3C', '#C0392B']} style={styles.logoutGradient}>
            <Feather name="power" size={20} color="white" />
          </LinearGradient>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#1976D2" />
        ) : egresados.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>No hay egresados</Text>
        ) : (
          egresados.map(alumno => (
            <View key={alumno.id} style={styles.card}>
              <Text style={styles.nombre}>{alumno.alumno || alumno.nombre}</Text>
              <Text style={styles.info}>Correo: {alumno.correo}</Text>
              <Text style={styles.info}>Tutor: {alumno.tutor}</Text>
              <Text style={styles.info}>Años en la escuela: {alumno.años ? alumno.años.join(', ') : '-'}</Text>
              <Text style={styles.info}>Fecha de egreso: {alumno.fecha_egreso || '-'}</Text>
              <Text style={styles.proyectosTitle}>Proyectos por año:</Text>
              {alumno.proyectosPorAño
                ? Object.entries(alumno.proyectosPorAño).map(([año, proyectos]) => (
                    <View key={año} style={styles.proyectosPorAño}>
                      <Text style={styles.año}>{año}:</Text>
                      {proyectos.length > 0
                        ? proyectos.map((p, idx) => (
                            <Text key={idx} style={styles.proyecto}>{p}</Text>
                          ))
                        : <Text style={styles.proyecto}>Sin proyectos</Text>}
                    </View>
                  ))
                : <Text style={styles.proyecto}>Sin proyectos</Text>
              }
            </View>
          ))
        )}
        <View style={{ height: 50 }} />
      </ScrollView>
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
  container: { padding: 20, backgroundColor: 'transparent' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 16, marginBottom: 18 },
  nombre: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  info: { fontSize: 14, color: '#333', marginBottom: 2 },
  proyectosTitle: { fontWeight: 'bold', marginTop: 8, marginBottom: 2 },
  proyectosPorAño: { marginLeft: 10, marginBottom: 2 },
  año: { fontWeight: 'bold', color: '#1976D2' },
  proyecto: { fontSize: 13, marginLeft: 10, color: '#444' },
});