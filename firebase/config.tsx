import { initializeApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import { FirebaseApp } from "@firebase/app-types";

const firebaseConfig = {
  apiKey: "AIzaSyDfzX_GJ3J9PDofrn4Fqtp0-8evSIOEnhM",
  authDomain: "diva-the-indian-jewel.firebaseapp.com",
  projectId: "diva-the-indian-jewel",
  storageBucket: "diva-the-indian-jewel.appspot.com",
  messagingSenderId: "394239193589",
  appId: "1:394239193589:web:0a946abbc42463dcecf0bc",
  measurementId: "G-2ZK5NNMXTB",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app as unknown as FirebaseApp);