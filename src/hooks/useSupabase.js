import { useState, useEffect } from "react";
import { supabase } from "../config/supabase";

const DEFAULT_STORE_ID = "00000000-0000-0000-0000-000000000001";

export function useSupabase() {
    const [items, setItems] = useState([]);
    const [settings, setSettingsState] = useState({
        storeName: "Berkah",
        storeLocation: "",
        operatingHours: "",
        whatsappNumber: "6285157680550",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch menu items
    const fetchItems = async () => {
        try {
            const { data, error } = await supabase
                .from("menu_items")
                .select("*")
                .eq("store_id", DEFAULT_STORE_ID)
                .order("sort_order", { ascending: true });

            if (error) throw error;

            // Transform data to match component expectations
            const transformedData = data.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                description: item.description,
                category: item.category,
                photo: item.photo,
                views: item.views,
                order: item.sort_order,
            }));

            setItems(transformedData);
        } catch (err) {
            console.error("Error fetching items:", err);
            setError(err.message);
        }
    };

    // Fetch store settings
    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from("stores")
                .select("*")
                .eq("id", DEFAULT_STORE_ID)
                .single();

            if (error) throw error;

            if (data) {
                setSettingsState({
                    storeName: data.name,
                    whatsappNumber: data.whatsapp_number,
                });
            }
        } catch (err) {
            console.error("Error fetching settings:", err);
        }
    };

    // Initial fetch
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchItems(), fetchSettings()]);
            setLoading(false);
        };
        init();

        // Real-time subscription for menu items
        const itemsSubscription = supabase
            .channel("menu_items_changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "menu_items" },
                () => fetchItems()
            )
            .subscribe();

        // Real-time subscription for store settings
        const storeSubscription = supabase
            .channel("stores_changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "stores" },
                () => fetchSettings()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(itemsSubscription);
            supabase.removeChannel(storeSubscription);
        };
    }, []);

    // Add new item
    const addItem = async (itemData) => {
        try {
            const { data, error } = await supabase
                .from("menu_items")
                .insert({
                    store_id: DEFAULT_STORE_ID,
                    name: itemData.name,
                    price: itemData.price,
                    description: itemData.description,
                    category: itemData.category,
                    photo: itemData.photo,
                    views: 0,
                    sort_order: items.length,
                })
                .select()
                .single();

            if (error) throw error;

            await fetchItems();
            return data;
        } catch (err) {
            console.error("Error adding item:", err);
            throw err;
        }
    };

    // Update item
    const updateItem = async (id, data) => {
        try {
            const { error } = await supabase
                .from("menu_items")
                .update({
                    name: data.name,
                    price: data.price,
                    description: data.description,
                    category: data.category,
                    photo: data.photo,
                })
                .eq("id", id);

            if (error) throw error;

            await fetchItems();
        } catch (err) {
            console.error("Error updating item:", err);
            throw err;
        }
    };

    // Delete item
    const deleteItem = async (id) => {
        try {
            const { error } = await supabase
                .from("menu_items")
                .delete()
                .eq("id", id);

            if (error) throw error;

            await fetchItems();
        } catch (err) {
            console.error("Error deleting item:", err);
            throw err;
        }
    };

    // Increment views
    const incrementViews = async (id) => {
        try {
            // Get current views
            const item = items.find((i) => i.id === id);
            if (!item) return;

            const { error } = await supabase
                .from("menu_items")
                .update({ views: item.views + 1 })
                .eq("id", id);

            if (error) throw error;

            // Update local state immediately for better UX
            setItems((prev) =>
                prev.map((i) =>
                    i.id === id ? { ...i, views: i.views + 1 } : i
                )
            );
        } catch (err) {
            console.error("Error incrementing views:", err);
        }
    };

    // Reorder items
    const reorderItems = async (newItems) => {
        try {
            // Update local state immediately
            setItems(newItems.map((item, idx) => ({ ...item, order: idx })));

            // Batch update in database
            const updates = newItems.map((item, index) =>
                supabase
                    .from("menu_items")
                    .update({ sort_order: index })
                    .eq("id", item.id)
            );

            await Promise.all(updates);
        } catch (err) {
            console.error("Error reordering items:", err);
            await fetchItems(); // Revert on error
        }
    };

    // Upload photo to Supabase Storage
    const uploadPhoto = async (file) => {
        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}.${fileExt}`;
            const filePath = `menu-photos/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("bookletku")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const {
                data: { publicUrl },
            } = supabase.storage.from("bookletku").getPublicUrl(filePath);

            return { url: publicUrl, path: filePath };
        } catch (err) {
            console.error("Error uploading photo:", err);
            throw err;
        }
    };

    // Update store settings
    const setSettings = async (newSettings) => {
        try {
            const { error } = await supabase
                .from("stores")
                .update({
                    name: newSettings.storeName,
                    whatsapp_number: newSettings.whatsappNumber,
                })
                .eq("id", DEFAULT_STORE_ID);

            if (error) throw error;

            setSettingsState(newSettings);
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
        setSettings,
    };
}

export default useSupabase;
