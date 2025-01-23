import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
  const [name, setName] = useState("");
  const navigation = useNavigation();

const handleLogin = () => {
  if (name.toLowerCase() === "admin") {
    navigation.navigate("Admin");
  } else if (name.toLowerCase() === "Profesor") {
    navigation.navigate("Profesor", { name });
  } else {
    navigation.navigate("Estudiante", { name }); // Aquí pasamos el parámetro "name"
  }
};

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
});

export default LoginScreen;
