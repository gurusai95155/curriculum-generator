import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register a new user
  async function register(name, email, password, role, college) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user profile in Firestore
      const profileData = {
        uid: user.uid,
        name,
        email,
        role, // 'Faculty' or 'Student'
        college: college.trim(),
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "users", user.uid), profileData);
      setUserProfile(profileData);
      return user;
    } catch (error) {
      console.error("Registration Error:", error);
      throw error;
    }
  }

  // Login existing user
  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Profile will be loaded by onAuthStateChanged listener
      return userCredential.user;
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  }

  // Logout
  function logout() {
    setUserProfile(null);
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          } else {
            console.warn("User document not found in Firestore!");
            setUserProfile(null);
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    register,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
