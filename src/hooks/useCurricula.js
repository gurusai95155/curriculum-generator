import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs 
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./useAuth";

export function useCurricula() {
  const { userProfile } = useAuth();
  const [curricula, setCurricula] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.college) {
      setCurricula([]);
      setLoading(false);
      return;
    }

    // Load published curricula for the user's college
    const q = query(
      collection(db, "curricula"),
      where("college", "==", userProfile.college),
      where("status", "==", "published"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCurricula(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching curricula:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile?.college]);

  // Save draft or publish new curriculum
  async function saveCurriculum(curriculumData) {
    if (!userProfile) throw new Error("User profile not found. Cannot save curriculum.");

    const newDoc = {
      ...curriculumData,
      publishedBy: userProfile.uid,
      publishedByName: userProfile.name,
      college: userProfile.college,
      createdAt: new Date().toISOString(),
      publishedAt: curriculumData.status === "published" ? new Date().toISOString() : null
    };

    const docRef = await addDoc(collection(db, "curricula"), newDoc);
    return docRef.id;
  }

  // Update curriculum status (draft -> published, etc.)
  async function updateStatus(curriculumId, status) {
    const docRef = doc(db, "curricula", curriculumId);
    const updates = { 
      status,
      publishedAt: status === "published" ? new Date().toISOString() : null
    };
    await updateDoc(docRef, updates);
  }

  // Delete curriculum
  async function deleteCurriculum(curriculumId) {
    const docRef = doc(db, "curricula", curriculumId);
    await deleteDoc(docRef);
  }

  return {
    curricula,
    loading,
    saveCurriculum,
    updateStatus,
    deleteCurriculum
  };
}
