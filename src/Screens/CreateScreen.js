import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import MaterialIcons from'react-native-vector-icons/MaterialIcons';

import styles from './../StyleSheet/styles';
const CreateScreen = ({ navigation, route }) => {
    
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
        <MaterialIcons name="logout" size={30} color="red" />
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateScreen;
