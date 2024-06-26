import { app } from "./firebase.js"
import * as firebaseAuth from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// Initialize Firebase Authentication and get a reference to the service
const auth = firebaseAuth.getAuth(app);
const googleProvider = new firebaseAuth.GoogleAuthProvider();

function searchForEvents() {
    //Searching on the page element to regiter events
    let eventRegisteredCount = 0
    const signInButton = document.getElementById("firebase-sign-in");
    if (signInButton !== null) { signInButton.addEventListener("click", signInWithGoogle); eventRegisteredCount++; }

    const loginButton = document.getElementById("firebase-login");
    if (loginButton !== null) { loginButton.addEventListener("click", signInWithGoogle); eventRegisteredCount++; }


    if (eventRegisteredCount === 0) {
        console.warn("Warning: registered 0 event. \n We couldn't find any element to register \n - try to add 'firebase-<function>' id on a element \n - remove this script");
    } else console.info("Firebase initialized successfully, registered " + eventRegisteredCount + " events")
}

function signInWithGoogle() {
    firebaseAuth.signInWithPopup(auth, googleProvider)
        .then(async (result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = firebaseAuth.GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            // IdP data available using getAdditionalUserInfo(result)
            //try login
            if (await userExist(user.displayName)) {
                console.log("Loggin-in...");
                await login(user.displayName, "");
            } else {
                //sign-in
                console.log("Singin-in...");
                await signIn(user.displayName, "");
            }

            // ...
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData?.email;
            // The AuthCredential type that was used.
            const credential = firebaseAuth.GoogleAuthProvider.credentialFromError(error);
            console.error("We couldn't sign-in with google:")
            console.error(errorMessage);
        });
}

searchForEvents()