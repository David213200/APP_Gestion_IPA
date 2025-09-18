import React, { useEffect, useRef } from 'react';
 import { View, ScrollView, Text, StyleSheet, Animated, Pressable, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getDatabase, ref, get, set, remove } from 'firebase/database';

const AdminScreen = ({ navigation, route }) => {
  const userInfo = route.params?.user || {};
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const [loadingPromocion, setLoadingPromocion] = React.useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 5,
        bounciness: 10,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const ejecutarPromocion = async () => {
    setLoadingPromocion(true);
    console.log("Iniciando promoción de alumnos...");
    try {
      const db = getDatabase();
      const cursos = ['1r', '2n', '3r', '4t'];
      const ramas = cursos.map(c => `proyectos_sanitizado_${c}`);
      const añoActual = new Date().getFullYear();

      // 1. Mueve los de 4t a egresados y elimina de 4t y usuarios
      const ref4t = ref(db, `proyectos/${ramas[3]}`);
      const snap4t = await get(ref4t);
      const alumnos4t = snap4t.exists() ? snap4t.val() : {};

      for (const [id, alumno] of Object.entries(alumnos4t)) {
        const años = alumno.años ? [...alumno.años, añoActual] : [añoActual];
        const proyectosPorAño = alumno.proyectosPorAño || {};
        proyectosPorAño[añoActual] = alumno.proyectos || [];
        // Añade el año al nombre del nodo en egresados
        const egresadoId = `${id}_${añoActual}`;
        await set(ref(db, `alumnos_egresados/${egresadoId}`), {
          ...alumno,
          años,
          proyectosPorAño,
          fecha_egreso: new Date().toISOString().slice(0,10)
        });
        // Elimina usuario de la rama usuarios
        await remove(ref(db, `usuarios/${id}`));
      }
      await remove(ref4t);

      // 2. Mueve 3r->4t, 2n->3r, 1r->2n (y elimina de origen)
      for (let i = cursos.length - 2; i >= 0; i--) {
        const refActual = ref(db, `proyectos/${ramas[i]}`);
        const snap = await get(refActual);
        const alumnos = snap.exists() ? snap.val() : {};

        for (const [id, alumno] of Object.entries(alumnos)) {
          const años = alumno.años ? [...alumno.años, añoActual] : [añoActual];
          const proyectosPorAño = alumno.proyectosPorAño || {};
          proyectosPorAño[añoActual] = alumno.proyectos || [];
          // Cambia el nombre del nodo al curso siguiente
          const nuevoId = id.replace(ramas[i], ramas[i+1]);
          await set(ref(db, `proyectos/${ramas[i+1]}/${nuevoId}`), {
            ...alumno,
            años,
            proyectosPorAño,
            nivel: cursos[i+1],
            proyectos: {} // Limpia proyectos para el nuevo año
          });
        }
        await remove(refActual);
      }

      Alert.alert("Promoció completada", "Tots els alumnes han estat promocionats correctament.");
    } catch (error) {
      Alert.alert("Error", "No s'ha pogut completar la promoció:\n" + error.message);
    }
    setLoadingPromocion(false);
  };

  return (
    <LinearGradient
      colors={['#0f3057', '#00587a', '#008891']}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={styles.profileContainer}
          >
            <Text style={styles.profileText}>
              {userInfo.name?.charAt(0).toUpperCase() || 'A'}
            </Text>
          </LinearGradient>
          
          <Pressable 
            onPress={() => navigation.navigate("Home")}
            style={({ pressed }) => [
              styles.logoutButton,
              { transform: [{ scale: pressed ? 0.95 : 1 }] }
            ]}
          >
            <Feather name="power" size={24} color="white" />
          </Pressable>
        </View>

        <Animated.Text 
          style={[
            styles.welcomeText,
            { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0]
            }) }] }
          ]}
        >
          Benvingut, {userInfo.name}!
        </Animated.Text>

        <Animated.View 
          style={[
            styles.outerContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.blurEffect} />
          <View style={styles.container}>

          <Pressable 
              style={({ pressed }) => [
                styles.button,
                { transform: [{ scale: pressed ? 0.95 : 1 }] }
              ]}
              onPress={() => navigation.navigate('DBView', { userRole: 'admin'})}
            >
              <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.buttonGradient}
              >
                <FontAwesome5 name="database" size={24} color="white" />
                <Text style={styles.buttonText}>Explorar Projectes</Text>
              </LinearGradient>
            </Pressable>

            <Pressable 
              style={({ pressed }) => [
                styles.button,
                { transform: [{ scale: pressed ? 0.95 : 1 }] }
              ]}
              onPress={() => navigation.navigate('GestionDB', { userRole: 'admin'})}
            >
              <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={styles.buttonGradient}
              >
                <FontAwesome5 name="plus-circle" size={24} color="white" />
                <Text style={styles.buttonText}>Edició de Base de Dades</Text>
              </LinearGradient>
            </Pressable>

            <Pressable 
              style={({ pressed }) => [
                styles.button,
                { transform: [{ scale: pressed ? 0.95 : 1 }] }
              ]}
              onPress={() => navigation.navigate('GestionProyectos')}
            >
              <LinearGradient
                colors={['#8e24aa', '#6a1b9a']}
                style={styles.buttonGradient}
              >
                <FontAwesome5 name="tasks" size={24} color="white" />
                <Text style={styles.buttonText}>Gestió de Projectes</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                { transform: [{ scale: pressed ? 0.95 : 1 }] }
              ]}
              onPress={ejecutarPromocion}
            >
              <LinearGradient
                colors={['#e53935', '#b71c1c']}
                style={styles.buttonGradient}
              >
                <FontAwesome5 name="arrow-up" size={24} color="white" />
                <Text style={styles.buttonText}>Promociona alumnes de curs</Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                { transform: [{ scale: pressed ? 0.95 : 1 }] }
              ]}
              onPress={() => navigation.navigate('Egresados')}
            >
              <LinearGradient
                colors={['#607d8b', '#455a64']}
                style={styles.buttonGradient}
              >
                <FontAwesome5 name="user-graduate" size={24} color="white" />
                <Text style={styles.buttonText}>Veure alumnes egressats</Text>
              </LinearGradient>
            </Pressable>
            <Pressable 
              style={({ pressed }) => [
                styles.button,
                { transform: [{ scale: pressed ? 0.95 : 1 }] }
              ]}
              onPress={() => navigation.navigate('GestionUsuarios')}
            >
              <LinearGradient
                colors={['#00bcd4', '#00838f']}
                style={styles.buttonGradient}
              >
                <MaterialIcons name="supervisor-account" size={24} color="white" />
                <Text style={styles.buttonText}>Gestió de Professors i Admins</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>

        {loadingPromocion && (
          <View style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center', zIndex: 10
          }}>
            <Text style={{ color: '#fff', fontSize: 18, marginBottom: 10 }}>Promocionant alumnes...</Text>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>IPA School Projects Manager v1.0</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
    marginTop: 15,
  },
  profileContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  profileText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#e53935',
    padding: 12,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  welcomeText: {
    fontSize: 24,
    color: 'white',
    fontWeight: '300',
    letterSpacing: 1.2,
    marginBottom: 40,
    textAlign: 'center',
  },
  outerContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  blurEffect: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    width: '95%',
    height: '105%',
    top: -10,
    transform: [{ rotate: '3deg' }],
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 25,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  button: {
    width: '100%',
    marginVertical: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  footer: {
    marginTop: 40,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontSize: 12,
    letterSpacing: 1,
  },
});

export default AdminScreen;