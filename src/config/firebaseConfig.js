import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAcqhxckrckFP_Wi9ey9ceODrfxXTh-H-w",
    authDomain: "musvn-quizz.firebaseapp.com",
    databaseURL: "https://musvn-quizz-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "musvn-quizz",
    storageBucket: "musvn-quizz.appspot.com",
    messagingSenderId: "38100794938",
    appId: "1:38100794938:web:ab428f85c021f8c966ff03"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);