// Configuración de Firebase. Se completa recién en la fase de conexión con Firebase
// (Fase 8 del plan) — hasta entonces la app corre con estos valores de referencia
// y las llamadas REST a Firebase van a fallar, lo cual es esperado en esta etapa.
export const environment = {
  production: false,
  firebase: {
    apiKey: 'TODO_FIREBASE_API_KEY',
    databaseURL: 'https://TODO_PROJECT-default-rtdb.firebaseio.com',
    projectId: 'TODO_PROJECT',
  },
};
