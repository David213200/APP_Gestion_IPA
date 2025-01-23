import React, { useState } from 'react';
import { Text, View, Image, TouchableOpacity, ScrollView, Modal, StyleSheet, Dimensions } from 'react-native';

/*const icon = require('../../assets/logo_InstitutAF_color_h.png');

<Image source={icon} style={styles.logo} resizeMode="contain" />*/

const { width } = Dimensions.get('window');

const StudentScreen = ({ route }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const projects = [
    { id: 1, name: "Proyecto 1" },
    { id: 2, name: "Proyecto 2" },
    { id: 3, name: "Proyecto 3" },
    { id: 4, name: "Proyecto 4" },
  ];

  const openProjectDetails = (project) => {
    setSelectedProject(project);
    setModalVisible(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        
        <Text style={styles.title}>IPA {route.params.name}</Text>
      </View>

      <Text style={styles.greeting}>Bienvenido</Text>

      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>Nombre del Alumno</Text>
        <Text style={styles.studentCourse}>Curso: 5° de Primaria</Text>
        <Text style={styles.studentDescription}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.
        </Text>

        <View style={styles.projectsContainer}>
          {projects.map((project) => (
            <TouchableOpacity key={project.id} style={styles.project} onPress={() => openProjectDetails(project)}>
              <Text style={styles.projectText}>{project.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedProject ? selectedProject.name : ""}</Text>
            <Text style={styles.modalText}>Fecha de Iniciación: 01/01/2023</Text>
            <Text style={styles.modalText}>Tutor: John Doe</Text>
            <Text style={styles.modalText}>
              Información: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.
            </Text>
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
  container: {
    flexGrow: 1,
    backgroundColor: "#f0f4f8",
    padding: 20,
    alignItems: "center",
  },
  header: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: "100%",
    maxWidth: 600,
  },
  logo: { 
    width: '80%', 
    height: 100, 
    marginBottom: 10 
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "#333",
    textAlign: "center",
  },
  greeting: { 
    fontSize: 20, 
    color: "#333", 
    marginBottom: 20, 
    textAlign: "center" 
  },
  studentInfo: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: "100%",
    maxWidth: 600,
  },
  studentName: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 5 },
  studentCourse: { fontSize: 16, color: "#555", marginBottom: 10 },
  studentDescription: { fontSize: 14, color: "#666", marginBottom: 15 },
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
  projectText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  modalContent: { width: "80%", backgroundColor: "#fff", padding: 20, borderRadius: 10, alignItems: "center" },
  modalTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  modalText: { fontSize: 16, marginBottom: 10, textAlign: "center" },
  modalImage: { width: 100, height: 100, marginBottom: 20 },
  closeButton: { backgroundColor: "#007bff", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  closeButtonText: { color: "#fff", fontWeight: "bold" },
});

export default StudentScreen;