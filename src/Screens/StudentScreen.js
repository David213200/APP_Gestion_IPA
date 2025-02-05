import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Text, Modal, Dimensions } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const StudentScreen = ({ route }) => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const projects = [
    { id: 1, name: "Proyecto 1" },
    { id: 2, name: "Proyecto 2" },
    { id: 3, name: "Proyecto 3" },
    { id: 4, name: "Proyecto 4" },
  ];

  function handleLogout() {
    try {
      navigation.replace("Home");
      console.log("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  const openProjectDetails = (project) => {
    setSelectedProject(project);
    setModalVisible(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.header}>
        <Text style={styles.title}>IPA Estudiante</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>Tus Proyectos</Text>
          <View style={styles.projectsContainer}>
            {projects.map((project) => (
              <TouchableOpacity key={project.id} style={styles.project} onPress={() => openProjectDetails(project)}>
                <Text style={styles.projectText}>{project.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedProject ? selectedProject.name : ""}</Text>
            <Text style={styles.modalText}>Fecha de Iniciación: 01/01/2023</Text>
            <Text style={styles.modalText}>Tutor: John Doe</Text>
            <Text style={styles.modalText}>Información: Lorem ipsum dolor sit amet.</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  welcomeText: {
    textAlign: 'center',
    fontSize: 18,
    marginVertical: 10,
  },
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  container: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: "90%",
    maxWidth: 600,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  projectsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  project: {
    width: width < 600 ? '48%' : '23%',
    aspectRatio: 1,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 10,
  },
  projectText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default StudentScreen;
