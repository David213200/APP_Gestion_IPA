import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Configuración de Firebase con la URL correcta
const firebaseConfig = {
  apiKey: "AIzaSyDy5fUIBhZLpKBtGrLlfkf2b7hQxnvsq74",
  authDomain: "ipa-app-93325.firebaseapp.com",
  projectId: "ipa-app-93325",
  storageBucket: "ipa-app-93325.appspot.com",
  messagingSenderId: "710571178171",
  appId: "1:710571178171:web:c0d9df9dc15dee8399d19e",
  databaseURL: "https://ipa-app-93325-default-rtdb.europe-west1.firebasedatabase.app/" // URL correcta
};

// Inicializar Firebase
const appFirebase = initializeApp(firebaseConfig);

// Exportar la base de datos
export const database = getDatabase(appFirebase);
export default appFirebase;
