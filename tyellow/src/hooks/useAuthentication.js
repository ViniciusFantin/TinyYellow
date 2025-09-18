import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";

import { auth } from "../firebase/config";

import { useState, useEffect } from "react";

export const useAuthentication = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);

  // CleanUp
  // Deal with memory leak
  const [cancelled, setCancelled] = useState(false);

  function checkIfIsCancelled() {
    if (cancelled) {
      return;
    }
  }

  const createUser = async (data) => {
    checkIfIsCancelled();

    setLoading(true);
    setError(false);

    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      await updateProfile(user, {
        displayName: data.displayName,
      });

      setLoading(false);

      return user;
    } catch (error) {
      console.log(error.message);
      console.log(typeof error.message);

      let systemErrorMessage;

      if (error.message.includes("Password")) {
        systemErrorMessage = "the password must be at least 6 characters long.";
      } else if (error.message.includes("email-already")) {
        systemErrorMessage = "email alreary exists ";
      } else {
        systemErrorMessage = "oops, an error occurred";
      }

      setLoading(false);
      setError(systemErrorMessage);
    }
  };

  // Logout
  const logout = () => {
    checkIfIsCancelled();
    signOut(auth);
  };

  // Autenticação do Login
  const login = async (data) => {
    checkIfIsCancelled();

    setLoading(true);
    setError(false);

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (error) {
      console.log("codigo de erro: ", error.message);

      let systemErrorMessage;

      if (error.message.includes("auth/invalid-credential")) {
        systemErrorMessage = "User or Password is incorret.";
      } //else if (error.message.includes("auth/wrong-password")) {
      //systemErrorMessage = "Senha incorreta.";}
      else {
        systemErrorMessage = "Ocorreu um erro, por favor tenta mais tarde.";
      }
      console.log(systemErrorMessage);
      setError(systemErrorMessage);
    }

    setLoading(false);
  };

  useEffect(() => {
    return () => setCancelled(true);
  }, []);

  return {
    auth,
    createUser,
    error,
    loading,
    logout,
    login,
  };
};
