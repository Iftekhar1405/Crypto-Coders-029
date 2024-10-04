// src/hooks/useAuth.js
import { useState, useEffect, useContext, createContext } from "react";
import { auth, database } from "../utils/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUser({ ...user, ...userData });
        } else {
          setUser(user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email, password, isAdmin) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await set(ref(database, `users/${user.uid}`), {
        email: user.email,
        isAdmin: isAdmin,
      });

      setUser({ ...user, isAdmin });
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userRef = ref(database, `users/${userCredential.user.uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setUser({ ...userCredential.user, ...userData });
      } else {
        setUser(userCredential.user);
      }
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      if (error.code === "auth/invalid-credential") {
        throw new Error("Invalid email or password. Please try again.");
      } else {
        throw error;
      }
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        await set(userRef, {
          email: user.email,
          isAdmin: false,
        });
      }

      const userData = snapshot.exists() ? snapshot.val() : { isAdmin: false };
      setUser({ ...user, ...userData });
      navigate("/dashboard");
    } catch (error) {
      console.error("Google login error:", error);
      throw new Error("Google login failed. Please try again.");
    }
  };

  const loginWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        await set(userRef, {
          email: user.email,
          isAdmin: false,
        });
      }

      const userData = snapshot.exists() ? snapshot.val() : { isAdmin: false };
      setUser({ ...user, ...userData });
      navigate("/dashboard");
    } catch (error) {
      console.error("Facebook login error:", error);
      throw new Error("Facebook login failed. Please try again.");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const value = {
    user,
    register,
    login,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
