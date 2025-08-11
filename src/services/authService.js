// Authentication service functions
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, googleProvider, db } from "../config/firebase";

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await updateProfile(user, { displayName });
    await createUserDocument(user, { displayName });

    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * Sign in with email and password
 * @param {string} email
 * @param {string} password
 * @param {boolean} isAdminLogin
 */
export const signInWithEmail = async (
  email,
  password,
  isAdminLogin = false
) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    if (isAdminLogin) {
      const isAdmin = await checkAdminStatus(user.email);
      if (!isAdmin) {
        await signOut(auth);
        return {
          user: null,
          error: "You are not an admin. Please login as user.",
        };
      }
    }

    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * Check if a user is admin
 */
export const checkAdminStatus = async (email) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("email", "==", email),
      where("role", "==", "admin")
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (isAdminLogin = false) => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    if (isAdminLogin) {
      const isAdmin = await checkAdminStatus(user.email);
      if (!isAdmin) {
        await signOut(auth);
        return {
          user: null,
          error: "You are not an admin. Please login as user.",
        };
      }
    } else {
      await createUserDocument(user);
    }

    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * Log out the current user
 */
export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Create user document in Firestore (only if it doesn't exist)
 */
const createUserDocument = async (user, additionalData = {}) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = new Date();

    try {
      await setDoc(userRef, {
        displayName:
          displayName ||
          additionalData.displayName ||
          email?.split("@")[0] ||
          "User",
        email,
        photoURL: photoURL || "",
        createdAt,
        isEligible: false,
        pendingNotes: [],
        approvedNotes: [],
        uploadedNotes: [],
        earnings: 0,
        ...additionalData,
      });
    } catch (error) {
      console.error("Error creating user document:", error);
    }
  }
};

/**
 * Get user document by UID
 */
export const getUserDocument = async (uid) => {
  if (!uid) return null;

  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting user document:", error);
    return null;
  }
};

/**
 * Update user document
 */
export const updateUserDocument = async (uid, data) => {
  if (!uid) return;

  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { ...data, updatedAt: new Date() });
    return { error: null };
  } catch (error) {
    console.error("Error updating user document:", error);
    return { error: error.message };
  }
};

/**
 * Firebase Auth state observer
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
