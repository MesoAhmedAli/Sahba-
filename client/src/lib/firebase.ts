import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider, 
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Firebase Authentication Error:", error);
    
    if (error.code === 'auth/unauthorized-domain') {
      throw new Error(`Domain authorization required: Please add ${window.location.hostname} to Firebase Console > Authentication > Settings > Authorized domains`);
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup blocked: Please allow popups for this domain');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Login cancelled by user');
    }
    
    throw error;
  }
}

export async function loginWithEmail(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error("Email login error:", error);
    
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address');
    } else if (error.code === 'auth/user-disabled') {
      throw new Error('This account has been disabled');
    }
    
    throw error;
  }
}

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }
    
    return result.user;
  } catch (error: any) {
    console.error("Email signup error:", error);
    
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email already exists');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address');
    }
    
    throw error;
  }
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error("Password reset error:", error);
    
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address');
    }
    
    throw error;
  }
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}