const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.assignRole = functions.https.onCall(async (data, context) => {
  // Verificar que el usuario que llama tiene permisos (opcional)
  if (!context.auth || context.auth.token.role !== "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Solo los administradores pueden asignar roles."
    );
  }

  const { uid, role } = data; // Recibe UID del usuario y el rol
  try {
    // Asignar el rol al usuario
    await admin.auth().setCustomUserClaims(uid, { role });
    return { message: `Rol ${role} asignado a usuario con UID ${uid}` };
  } catch (error) {
    throw new functions.https.HttpsError("unknown", error.message);
  }
});
