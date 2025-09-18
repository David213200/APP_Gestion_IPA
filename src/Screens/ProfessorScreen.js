import React, { useEffect, useRef } from 'react';
import { View, ScrollView, Text, Animated, Pressable } from 'react-native';
import { MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ProfessorScreen = ({ navigation, route }) => {
  const name = route.params?.name || 'Desconocido';
  const userInfo = route.params?.user || {};
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

  return (
    <LinearGradient
      colors={['#2A2D3E', '#1C1E2A', '#0F1017']}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#FF6B6B', '#FF4757']}
            style={styles.profileContainer}
          >
            <Text style={styles.profileText}>
              {userInfo.name?.charAt(0).toUpperCase() || 'P'}
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
              transform: [
                { 
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0]
                  })
                }
              ] 
            }
          ]}
        >
          Bienvenido, Profesor {name}
        </Animated.Text>

        <Animated.View 
          style={[
            styles.outerContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.blurEffect} />
          <View style={styles.container}>
            <View style={styles.content}>
              <Text style={styles.contentText}>
                Aquí puedes gestionar tus estudiantes y proyectos académicos
                con herramientas especializadas para docentes.
              </Text>

              <Pressable 
                style={({ pressed }) => [
                  styles.actionButton,
                  { transform: [{ scale: pressed ? 0.95 : 1 }] }
                ]}
                onPress={() => navigation.navigate('DBView', { userRole: 'professor' })}
              >
                <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.buttonGradient}
              >
                <FontAwesome5 name="database" size={24} color="white" />
                <Text style={styles.buttonText}>Explorar Proyectos</Text>
              </LinearGradient>
              </Pressable>

              <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { transform: [{ scale: pressed ? 0.95 : 1 }] }
              ]}
              onPress={() => navigation.navigate('Proyectos', { user: userInfo, role: 'professor' })}
              >
                <LinearGradient
                  colors={['#4CAF50', '#45a049']}
                  style={styles.buttonGradient}
                >
                  <FontAwesome5 name="plus-circle" size={24} color="white" />
                  <Text style={styles.buttonText}>Añadir Proyectos</Text>
                </LinearGradient>
                </Pressable>
            </View>
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Education Suite v1.0</Text>
        </View>
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
    backgroundColor: '#FF6B6B',
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
    transform: [{ rotate: '-3deg' }],
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 25,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  contentText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '300',
  },
  actionButton: {
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
  featureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    width: '48%',
    marginVertical: 10,
  },
  featureText: {
    color: 'white',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
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
};

export default ProfessorScreen;