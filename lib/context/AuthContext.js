"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

const AuthContext = createContext({
  user: null,
  userProfile: null,
  role: null,
  loading: true,
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, "users", currentUser.uid);

        try {
          const docSnap = await getDoc(userRef);

          if (!docSnap.exists()) {
            // First time login (e.g. Google Sign-in) -> Create default profile as "pasien"
            const initialProfile = {
              nama: currentUser.displayName || currentUser.email?.split("@")[0] || "Pengguna Baru",
              email: currentUser.email || "",
              noHp: "",
              role: "pasien",
              aktif: true,
              dibuatPada: serverTimestamp(),
            };
            await setDoc(userRef, initialProfile);
          }

          // Realtime listener for user profile changes (e.g. admin promotes role or disables account)
          unsubscribeProfile = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              setUserProfile(data);
              setRole(data.role || "pasien");
            } else {
              setUserProfile({
                nama: currentUser.displayName || currentUser.email?.split("@")[0] || "Pengguna",
                email: currentUser.email || "",
                noHp: "",
                role: "pasien",
                aktif: true,
              });
              setRole("pasien");
            }
            setLoading(false);
          }, (err) => {
            console.error("Error listening to user profile:", err);
            // Fallback agar aplikasi tidak macet saat Firestore rules sedang diatur
            setUserProfile({
              nama: currentUser.displayName || currentUser.email?.split("@")[0] || "Pengguna",
              email: currentUser.email || "",
              noHp: "",
              role: "pasien",
              aktif: true,
            });
            setRole("pasien");
            setLoading(false);
          });
        } catch (err) {
          console.error("Error initializing user document:", err);
          // Fallback agar aplikasi tidak macet saat Firestore rules sedang diatur
          setUserProfile({
            nama: currentUser.displayName || currentUser.email?.split("@")[0] || "Pengguna",
            email: currentUser.email || "",
            noHp: "",
            role: "pasien",
            aktif: true,
          });
          setRole("pasien");
          setLoading(false);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const registerWithEmail = async ({ nama, email, password, noHp, role = "pasien" }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (nama) {
      await updateProfile(cred.user, { displayName: nama });
    }
    const userRef = doc(db, "users", cred.user.uid);
    const newProfile = {
      nama: nama || (role === "dokter" ? "Dokter Gigi" : "Pengguna"),
      email: email,
      noHp: noHp || "",
      role: role || "pasien",
      aktif: true,
      dibuatPada: serverTimestamp(),
    };
    await setDoc(userRef, newProfile);

    // Jika mendaftar sebagai dokter, buatkan jadwal praktik awal agar langsung aktif
    if (role === "dokter") {
      try {
        const { collection, addDoc } = await import("firebase/firestore");
        const defaultJadwal = [
          { dokterId: cred.user.uid, hari: "senin", jamMulai: "09:00", jamSelesai: "15:00" },
          { dokterId: cred.user.uid, hari: "rabu", jamMulai: "09:00", jamSelesai: "15:00" },
          { dokterId: cred.user.uid, hari: "jumat", jamMulai: "09:00", jamSelesai: "15:00" },
        ];
        for (const j of defaultJadwal) {
          await addDoc(collection(db, "jadwal_dokter"), j);
        }
      } catch (e) {
        console.error("Error creating default doctor schedule:", e);
      }
    }

    return cred.user;
  };

  const loginWithEmail = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  };

  const logout = async () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("logging_out", "true");
    }
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    setRole(null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      setUserProfile(data);
      setRole(data.role || "pasien");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        role,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
