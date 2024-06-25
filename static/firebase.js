import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

import * as firebaseAuth from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



// Your web app's Firebase configuration

const firebaseConfig = {

    apiKey: "AIzaSyBq0mEfx3itiPmUFTARPqYj-bu08OtLesI",

    authDomain: "itask-71a64.firebaseapp.com",

    projectId: "itask-71a64",

    storageBucket: "itask-71a64.appspot.com",

    messagingSenderId: "610036992885",

    appId: "1:610036992885:web:b6277d976127de1571213c"

};


// Initialize Firebase

export const app = initializeApp(firebaseConfig);
