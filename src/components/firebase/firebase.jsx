import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/compat/database';
import data from '../../data/config.json';

const firebaseConfig = data.firebaseConfig;
const isNotMicroservice = data.enviroment == 'cloud';

let app;
let auth;
let db;
let realTimeDB;
let storage;

if (isNotMicroservice) {
  // Inicialize o Firebase apenas se ele ainda não foi inicializado
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // Inicializa os serviços
  app = firebase.app();
  auth = firebase.auth();
  db = firebase.firestore();
  realTimeDB = firebase.database();
  storage = firebase.storage();
}

// Exporta (vazio se for microsservice)
export { app, auth, db, realTimeDB, storage };
