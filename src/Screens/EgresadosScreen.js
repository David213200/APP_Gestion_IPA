import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Pressable, Modal, Platform, Dimensions } from 'react-native';
import { getDatabase, ref, get } from 'firebase/database';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function EgresadosScreen({ navigation }) {
  const [egresados, setEgresados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [proyectosModal, setProyectosModal] = useState([]);
  const [añoModal, setAñoModal] = useState('');

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

  const handleShowProyectos = (año, proyectos) => {
    setAñoModal(año);
    setProyectosModal(proyectos);
    setModalVisible(true);
  };

  const handleLogout = () => {
    navigation.navigate('Home');
  };

  const renderEgresadoCard = (alumno) => (
    <View key={alumno.id} style={styles.card}>
      <Text style={styles.nombre}>{alumno.alumno || alumno.nombre}</Text>
      <Text style={styles.info}>Correu: {alumno.correo}</Text>
      <Text style={styles.info}>Tutor: {alumno.tutor}</Text>
      <Text style={styles.info}>Anys a l'escola: {Array.isArray(alumno.años) ? alumno.años.join(', ') : '-'}</Text>
      <Text style={styles.info}>Data d'egressat: {alumno.fecha_egreso || '-'}</Text>
      <Text style={styles.proyectosTitle}>Projectes per any:</Text>
      {alumno.proyectosPorAño && typeof alumno.proyectosPorAño === 'object'
        ? Object.entries(alumno.proyectosPorAño).map(([año, proyectos]) => (
            <Pressable key={año} onPress={() => handleShowProyectos(año, proyectos)}>
              <Text style={[styles.año, { textDecorationLine: 'underline', color: '#1976D2', marginBottom: 4 }]}>
                {año} (veure projectes)
              </Text>
            </Pressable>
          ))
        : <Text style={styles.proyecto}>Sense projectes</Text>
      }
    </View>
  );

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
        <Text style={styles.headerTitle}>Alumnes Egressats</Text>
        <Pressable 
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <LinearGradient colors={['#E74C3C', '#C0392B']} style={styles.logoutGradient}>
            <Feather name="power" size={20} color="white" />
          </LinearGradient>
        </Pressable>
      </View>

      <View style={isWeb ? styles.webContent : styles.scrollContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1976D2" />
          </View>
        ) : egresados.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No hi ha egressats</Text>
          </View>
        ) : isWeb ? (
          egresados.map(alumno => renderEgresadoCard(alumno))
        ) : (
          <ScrollView contentContainerStyle={styles.mobileContent} showsVerticalScrollIndicator={true}>
            {egresados.map(alumno => renderEgresadoCard(alumno))}
            <View style={{ height: 50 }} />
          </ScrollView>
        )}
      </View>

      {/* Modal para mostrar proyectos */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>
              Projectes de {añoModal}
            </Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {Array.isArray(proyectosModal) && proyectosModal.length > 0 ? (
                proyectosModal.map((p, idx) => (
                  <Text key={idx} style={{ marginBottom: 6 }}>{p}</Text>
                ))
              ) : proyectosModal && typeof proyectosModal === 'object' && Object.keys(proyectosModal).length > 0 ? (
                Object.entries(proyectosModal).map(([nombre, valor], idx) => (
                  <Text key={idx} style={{ marginBottom: 6 }}>
                    <Text style={{ fontWeight: 'bold' }}>{nombre}:</Text> {valor}
                  </Text>
                ))
              ) : (
                <Text>No hi ha projectes aquest any.</Text>
              )}
            </ScrollView>
            <Pressable
              style={{ marginTop: 16, alignSelf: 'center', backgroundColor: '#1976D2', borderRadius: 8, padding: 10 }}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Tancar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  card: {
    width: isWeb ? (width > 900 ? '31%' : width > 600 ? '48%' : '100%') : '100%',
    minHeight: 220,
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
  nombre: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  info: { fontSize: 14, color: '#333', marginBottom: 2 },
  proyectosTitle: { fontWeight: 'bold', marginTop: 8, marginBottom: 2 },
  proyectosPorAño: { marginLeft: 10, marginBottom: 2 },
  año: { fontWeight: 'bold', color: '#1976D2' },
  proyecto: { fontSize: 13, marginLeft: 10, color: '#444' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
    elevation: 5
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
  scrollContainer: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    color: '#888',
    fontSize: 16,
  },
  mobileContent: {
    padding: 14,
  },
});