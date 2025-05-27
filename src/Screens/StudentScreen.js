import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, Text, Modal, Animated, Pressable } from 'react-native';
import { MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const StudentScreen = ({ route, navigation }) => {
  const name = route.params?.name || 'Desconocido';
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

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

  const projects = [
    { id: 1, name: "Proyecto 1", icon: 'rocket' },
    { id: 2, name: "Proyecto 2", icon: 'flask' },
    { id: 3, name: "Proyecto 3", icon: 'code' },
    { id: 4, name: "Proyecto 4", icon: 'chart-line' },
  ];

  const openProjectDetails = (project) => {
    setSelectedProject(project);
    setModalVisible(true);
  };

  return (
    <LinearGradient
      colors={['#2C3E50', '#3498DB', '#2980B9']}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#1ABC9C', '#16A085']}
            style={styles.profileContainer}
          >
            <Text style={styles.profileText}>
              {name?.charAt(0).toUpperCase() || 'E'}
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
            { 
              opacity: fadeAnim,
              transform: [{ translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0]
              }) }]
            }
          ]}
        >
          Bienvenido {name}, ¡a crear!
        </Animated.Text>

        <Animated.View 
          style={[
            styles.outerContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.blurEffect} />
          <View style={styles.container}>
            <Text style={styles.sectionTitle}>Tus Proyectos</Text>
            
            <View style={styles.projectsGrid}>
              {projects.map((project) => (
                <Pressable 
                  key={project.id} 
                  style={({ pressed }) => [
                    styles.projectCard,
                    { transform: [{ scale: pressed ? 0.95 : 1 }] }
                  ]}
                  onPress={() => openProjectDetails(project)}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.projectGradient}
                  >
                    <FontAwesome5 
                      name={project.icon} 
                      size={28} 
                      color="#1ABC9C" 
                      style={styles.projectIcon}
                    />
                    <Text style={styles.projectText}>{project.name}</Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          </View>
        </Animated.View>

        <Modal visible={modalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <LinearGradient
              colors={['#2C3E50', '#34495E']}
              style={styles.modalContainer}
            >
              <Text style={styles.modalTitle}>{selectedProject?.name}</Text>
              
              <View style={styles.modalContent}>
                <View style={styles.infoRow}>
                  <Feather name="calendar" size={20} color="#1ABC9C" />
                  <Text style={styles.infoText}>Fecha de Iniciación: 01/01/2023</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <FontAwesome5 name="chalkboard-teacher" size={20} color="#1ABC9C" />
                  <Text style={styles.infoText}>Tutor: John Doe</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <MaterialIcons name="description" size={20} color="#1ABC9C" />
                  <Text style={styles.infoText}>Información: Lorem ipsum dolor sit amet.</Text>
                </View>
              </View>

              <Pressable 
                style={({ pressed }) => [
                  styles.closeButton,
                  { transform: [{ scale: pressed ? 0.95 : 1 }] }
                ]}
                onPress={() => setModalVisible(false)}
              >
                <LinearGradient
                  colors={['#1ABC9C', '#16A085']}
                  style={styles.closeGradient}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </LinearGradient>
              </Pressable>
            </LinearGradient>
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = {
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
    backgroundColor: '#E74C3C',
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
    transform: [{ rotate: '2deg' }],
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 25,
    borderRadius: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 25,
    textAlign: 'center',
    letterSpacing: 1,
  },
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  projectCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  projectGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectIcon: {
    marginBottom: 10,
  },
  projectText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    borderRadius: 20,
    padding: 25,
    elevation: 10,
  },
  modalTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalContent: {
    marginBottom: 25,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  infoText: {
    color: 'white',
    fontSize: 14,
    flexShrink: 1,
  },
  closeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 15,
  },
  closeGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
};

export default StudentScreen;