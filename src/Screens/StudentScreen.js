import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ref, get } from 'firebase/database';
import { database } from '../services/credentials';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';


const StudentScreen = ({ route, navigation }) => {
  const user = route.params.user;
  const [proyectos, setProyectos] = useState([]);

  useEffect(() => {
    const cargarProyectosAlumno = async () => {
      const proyectosRef = ref(database, 'proyectos');
      const snapshot = await get(proyectosRef);

      if (snapshot.exists()) {
        const niveles = snapshot.val();
        const proyectosDelAlumno = [];

        Object.values(niveles).forEach((nivel) => {
          Object.values(nivel).forEach((proyecto) => {
            if (proyecto.correo === user.correo) {
              proyectosDelAlumno.push(proyecto);
            }
          });
        });

        setProyectos(proyectosDelAlumno);
      }
    };

    cargarProyectosAlumno();
  }, []);

  // Agrupa los proyectos por estado
  const proyectosNormales = proyectos.flatMap(proy =>
    Object.entries(proy.proyectos || {})
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => ({
        nombre: key,
        estado: value,
        alumno: proy.alumno,
        tutor: proy.tutor,
        nivel: proy.nivel,
      }))
  );

  const proyectosPorEstado = proyectosNormales.reduce((acc, proyecto) => {
    const estado = proyecto.estado;
    if (!acc[estado]) acc[estado] = [];
    acc[estado].push(proyecto);
    return acc;
  }, {});

  // Extrae los totales del primer proyecto (si existen)
  const totales = proyectos.length > 0
    ? Object.entries(proyectos[0].proyectos || {})
        .filter(([key]) => key.startsWith('_'))
        .map(([key, value]) => ({ key, value }))
    : [];

  return (
    <LinearGradient colors={['#2C3E50', '#3498DB', '#2980B9']} style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Informació de l'alumne</Text>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate("Home")}
          style={styles.logoutButton}
        >
          <Text>Surt</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          Benvingut/da {user.nombre}, aquests són els teus projectes:
        </Text>

        {proyectos.length === 0 ? (
          <Text style={styles.noProyectos}>No tens projectes assignats.</Text>
        ) : (
          <View style={styles.card}>
            <Text style={styles.nombre}>{proyectos[0].alumno}</Text>
            <Text style={styles.tutor}>Tutor: {proyectos[0].tutor}</Text>
            <Text style={styles.nivel}>Nivell: {proyectos[0].nivel}</Text>

            {/* Totales */}
            {totales.length > 0 && (
              <View style={styles.totalesContainer}>
                {totales.map(({ key, value }) => (
                  <Text key={key} style={styles.totalesText}>
                    {key.replace('_', '').toUpperCase()}: {value}
                  </Text>
                ))}
              </View>
            )}

            {/* Proyectos agrupados por estado */}
            {Object.entries(proyectosPorEstado).map(([estado, proyectosArr]) => (
              <View key={estado} style={styles.estadoGroup}>
                <View style={[styles.estadoHeader, { backgroundColor: getColorByEstado(estado) }]}>
                  <Text style={styles.estadoHeaderText}>
                    <FontAwesome5 name="tasks" size={16} /> {estado}
                  </Text>
                  <View style={styles.estadoBadge}>
                    <Text style={styles.estadoBadgeText}>{proyectosArr.length}</Text>
                  </View>
                </View>
                {proyectosArr.map((proy, idx) => (
                  <View key={idx} style={styles.proyectoItem}>
                    <FontAwesome5 name="folder-open" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.proyectoNombre}>{proy.nombre}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

// Función para asignar color según estado
function getColorByEstado(estado) {
  switch (estado.toLowerCase()) {
    case 'assignada':
      return '#f1c40f';
    case 'acabada':
      return '#27ae60';
    case 'en curs':
      return '#2980b9';
    case '1r trim':
      return '#8e44ad';
    case '2n trim':
      return '#e67e22';
    case 'tancada':
      return '#c0392b';
    case '23-24':
      return '#16a085';
    default:
      return '#34495e';
  }
}

// Estilos profesionales
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
    headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
    backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.08)',
  },
    header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(44,62,80,0.97)',
    borderBottomWidth: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  title: {
    color: 'white',
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
    logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.08)',
  },
  noProyectos: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    padding: 20,
    backgroundColor: '#1ABC9C',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  nombre: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  tutor: {
    color: 'white',
    fontSize: 15,
    marginBottom: 2,
  },
  nivel: {
    color: 'white',
    fontSize: 15,
    marginBottom: 10,
  },
  totalesContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  totalesText: {
    color: '#fff',
    fontWeight: 'bold',
    backgroundColor: 'rgba(44,62,80,0.25)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
    fontSize: 13,
  },
  estadoGroup: {
    marginBottom: 18,
  },
  estadoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  estadoHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
    letterSpacing: 0.5,
  },
  estadoBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  estadoBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  proyectoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(44,62,80,0.18)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    marginLeft: 10,
  },
  proyectoNombre: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default StudentScreen;
