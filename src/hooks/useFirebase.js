import { useState, useEffect } from "react";
import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    increment,
    serverTimestamp,
    writeBatch,
} from "firebase/firestore";
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";
import { db, storage } from "../config/firebase";

const STORE_ID = "default-store"; // Bisa diganti dengan auth user ID

export function useFirebase() {
    const [items, setItems] = useState([]);
    const [settings, setSettings] = useState({
        storeName: "My Store",
        whatsappNumber: "628123456789",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Collection references
    const itemsRef = collection(db, "stores", STORE_ID, "items");
    const storeRef = doc(db, "stores", STORE_ID);

    // Listen to items in real-time
    useEffect(() => {
        const q = query(itemsRef, orderBy("order", "asc"));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const itemsList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setItems(itemsList);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching items:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Listen to store settings
    useEffect(() => {
        const unsubscribe = onSnapshot(
            storeRef,
            (doc) => {
                if (doc.exists()) {
                    setSettings(doc.data());
                }
            },
            (err) => {
                console.error("Error fetching settings:", err);
            }
        );

        return () => unsubscribe();
    }, []);

    // Add new item
    const addItem = async (itemData) => {
        try {
            const newItem = {
                ...itemData,
                views: 0,
                order: items.length,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            const docRef = await addDoc(itemsRef, newItem);
            return { id: docRef.id, ...newItem };
        } catch (err) {
            console.error("Error adding item:", err);
            throw err;
        }
    };

    // Update item
    const updateItem = async (id, data) => {
        try {
            const itemRef = doc(db, "stores", STORE_ID, "items", id);
            await updateDoc(itemRef, {
                ...data,
                updatedAt: serverTimestamp(),
            });
        } catch (err) {
            console.error("Error updating item:", err);
            throw err;
        }
    };

    // Delete item
    const deleteItem = async (id) => {
        try {
            const itemRef = doc(db, "stores", STORE_ID, "items", id);

            // Find item to delete its photo if exists
            const item = items.find((i) => i.id === id);
            if (item?.photoPath) {
                const photoRef = ref(storage, item.photoPath);
                await deleteObject(photoRef).catch(() => {});
            }

            await deleteDoc(itemRef);
        } catch (err) {
            console.error("Error deleting item:", err);
            throw err;
        }
    };

    // Increment views
    const incrementViews = async (id) => {
        try {
            const itemRef = doc(db, "stores", STORE_ID, "items", id);
            await updateDoc(itemRef, {
                views: increment(1),
            });
        } catch (err) {
            console.error("Error incrementing views:", err);
        }
    };

    // Reorder items (batch update)
    const reorderItems = async (newItems) => {
        try {
            const batch = writeBatch(db);

            newItems.forEach((item, index) => {
                const itemRef = doc(db, "stores", STORE_ID, "items", item.id);
                batch.update(itemRef, { order: index });
            });

            await batch.commit();
        } catch (err) {
            console.error("Error reordering items:", err);
            throw err;
        }
    };

    // Upload photo
    const uploadPhoto = async (file) => {
        try {
            const filename = `${Date.now()}-${file.name}`;
            const photoRef = ref(
                storage,
                `stores/${STORE_ID}/photos/${filename}`
            );

            await uploadBytes(photoRef, file);
            const url = await getDownloadURL(photoRef);

            return {
                url,
                path: `stores/${STORE_ID}/photos/${filename}`,
            };
        } catch (err) {
            console.error("Error uploading photo:", err);
            throw err;
        }
    };

    // Update store settings
    const updateSettings = async (newSettings) => {
        try {
            await updateDoc(storeRef, {
                ...newSettings,
                updatedAt: serverTimestamp(),
            });
        } catch (err) {
            console.error("Error updating settings:", err);
            throw err;
        }
    };

    return {
        items,
        settings,
        loading,
        error,
        addItem,
        updateItem,
        deleteItem,
        incrementViews,
        reorderItems,
        uploadPhoto,
        updateSettings,
        setSettings: updateSettings,
    };
}

export default useFirebase;
