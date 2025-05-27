import React from 'react';
import { 
  ScrollView, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  View,
  Dimensions 
} from 'react-native';

const { height } = Dimensions.get('window');

const ScrollScreen = () => {
  // Texto más largo que la pantalla
  const longText = Array(100).fill("Lorem ipsum dolor sit amet. ").join('\n');

  return (

    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>TEST DE SCROLL</Text>
      <Text style={styles.text}>{longText}</Text>
    </ScrollView>

  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'red', // Color de debug
  },
  outerContainer: {
    flex: 1,
    backgroundColor: 'blue', // Color de debug
    padding: 10,
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'green', // Color de debug
  },
  contentContainer: {
    padding: 20,
    minHeight: height * 2, // Forzar altura 200% de la pantalla
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: 'white',
    lineHeight: 24,
  },
});

export default ScrollScreen;