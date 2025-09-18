/* eslint-disable max-len */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.assignRole = functions.https.onCall(async (data, context) => {
  // Verificar que el usuario que llama tiene permisos (opcional)
  if (!context.auth || context.auth.token.role !== "admin") {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Solo los administradores pueden asignar roles.",
    );
  }

  const {uid, role} = data; // Recibe UID del usuario y el rol
  try {
    // Asignar el rol al usuario
    await admin.auth().setCustomUserClaims(uid, {role});
    return {
      message: `Rol ${role} asignado a usuario con UID ${uid}`,
    };
  } catch (error) {
    throw new functions.https.HttpsError("unknown", error.message);
  }
});

// Cloud Function para eliminar usuario por correo
exports.deleteUserByEmail = functions.https.onCall(async (data, context) => {
  const email = data.email;
  if (!email) {
    throw new functions.https.HttpsError("invalid-argument", "No email provided");
  }
  try {
    // Busca el usuario en Auth
    const userRecord = await admin.auth().getUserByEmail(email);
    // Borra de Auth
    await admin.auth().deleteUser(userRecord.uid);

    // Borra de la BD (Realtime Database)
    const userKey = email.replace(/[@.]/g, "_");
    await admin.database().ref(`usuarios/${userKey}`).remove();

    // Si tienes otras ramas, por ejemplo proyectos asignados:
    // await admin.database().ref(`proyectos/${userKey}`).remove();

    // Si tienes más datos relacionados, añádelos aquí

    return {success: true};
  } catch (error) {
    throw new functions.https.HttpsError("unknown", error.message);
  }
});
