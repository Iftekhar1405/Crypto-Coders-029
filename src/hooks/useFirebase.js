import { useState, useEffect } from "react";
import { database } from "../utils/firebase";
import { ref, onValue, set, push } from "firebase/database";
import { useAuth } from "./useAuth";

export const useFirebase = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (user) {
      const userRef = ref(database, `users/${user.uid}`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        setUserData(data);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const updateUserProfile = async (data) => {
    if (user) {
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, { ...userData, ...data });
    }
  };

  const createGroup = async (groupData) => {
    if (user) {
      const groupsRef = ref(database, "groups");
      const newGroupRef = push(groupsRef);
      await set(newGroupRef, { ...groupData, createdBy: user.uid });
      return newGroupRef.key;
    }
  };

  const joinGroup = async (groupId) => {
    if (user) {
      const groupRef = ref(database, `groups/${groupId}/members/${user.uid}`);
      await set(groupRef, true);
    }
  };

  return { userData, updateUserProfile, createGroup, joinGroup };
};
