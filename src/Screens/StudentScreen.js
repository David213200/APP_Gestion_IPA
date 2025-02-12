import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Text, Modal, Dimensions } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons';

import styles from './../StyleSheet/styles';

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

export default StudentScreen;
