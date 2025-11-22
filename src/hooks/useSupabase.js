import { useState, useEffect, useCallback } from "react";
import { supabase, STORAGE_BUCKET, DEFAULT_STORE_ID } from "../config/supabase";

export function useSupabase() {
    const [items, setItems] = useState([]);
    const [settings, setSettingsState] = useState({
        storeName: "My Store",
        whatsappNumber: "628123456789",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ============================================
    // FETCH FUNCTIONS
    // ============================================

    // Fetch all menu items
    const fetchItems = useCallback(async () => {
        try {
            console.log("📥 Fetching menu items...");

            const { data, error } = await supabase
                .from("menu_items")
                .select("*")
                .eq("store_id", DEFAULT_STORE_ID)
                .order("sort_order", { ascending: true });

            if (error) {
                console.error("❌ Fetch items error:", error);
                throw error;
            }

            const transformedData = (data || []).map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                description: item.description || "",
                category: item.category || "food",
                photo: item.photo || "",
                views: item.views || 0,
                order: item.sort_order || 0,
            }));

            console.log("✅ Items fetched:", transformedData.length);
            setItems(transformedData);
            return transformedData;
        } catch (err) {
            console.error("❌ Error fetching items:", err);
            setError(err.message);
            return [];
        }
    }, []);

    // Fetch store settings
    const fetchSettings = useCallback(async () => {
        try {
            console.log("📥 Fetching store settings...");

            const { data, error } = await supabase
                .from("stores")
                .select("*")
                .eq("id", DEFAULT_STORE_ID)
                .single();

            if (error) {
                // If store doesn't exist, create it
                if (error.code === "PGRST116") {
                    console.log("🏪 Creating default store...");
                    const { data: newStore, error: createError } =
                        await supabase
                            .from("stores")
                            .insert({
                                id: DEFAULT_STORE_ID,
                                name: "My Store",
                                whatsapp_number: "628123456789",
                            })
                            .select()
                            .single();

                    if (createError) throw createError;

                    setSettingsState({
                        storeName: newStore.name,
                        whatsappNumber: newStore.whatsapp_number,
                    });
                    return;
                }
                throw error;
            }

            if (data) {
                console.log("✅ Settings fetched:", data.name);
                setSettingsState({
                    storeName: data.name,
                    whatsappNumber: data.whatsapp_number,
                });
            }
        } catch (err) {
            console.error("❌ Error fetching settings:", err);
        }
    }, []);

    // Initial data fetch
    useEffect(() => {
        const initData = async () => {
            setLoading(true);
            await Promise.all([fetchItems(), fetchSettings()]);
            setLoading(false);
        };
        initData();
    }, [fetchItems, fetchSettings]);

    // ============================================
    // CRUD OPERATIONS
    // ============================================

    // ADD new item
    const addItem = async (itemData) => {
        try {
            console.log("➕ Adding new item:", itemData.name);

            const newItem = {
                store_id: DEFAULT_STORE_ID,
                name: itemData.name,
                price: Number(itemData.price) || 0,
                description: itemData.description || "",
                category: itemData.category || "food",
                photo: itemData.photo || "",
                views: 0,
                sort_order: items.length,
            };

            const { data, error } = await supabase
                .from("menu_items")
                .insert(newItem)
                .select()
                .single();

            if (error) {
                console.error("❌ Add item error:", error);
                throw error;
            }

            console.log("✅ Item added:", data.id);

            // Update local state
            const transformedItem = {
                id: data.id,
                name: data.name,
                price: data.price,
                description: data.description,
                category: data.category,
                photo: data.photo,
                views: data.views,
                order: data.sort_order,
            };

            setItems((prev) => [...prev, transformedItem]);
            return transformedItem;
        } catch (err) {
            console.error("❌ Error adding item:", err);
            throw err;
        }
    };

    // UPDATE item
    const updateItem = async (id, itemData) => {
        try {
            console.log("✏️ Updating item:", id);

            const updates = {
                name: itemData.name,
                price: Number(itemData.price) || 0,
                description: itemData.description || "",
                category: itemData.category || "food",
                photo: itemData.photo || "",
                updated_at: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .from("menu_items")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) {
                console.error("❌ Update item error:", error);
                throw error;
            }

            console.log("✅ Item updated:", data.id);

            // Update local state
            setItems((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? {
                              ...item,
                              name: data.name,
                              price: data.price,
                              description: data.description,
                              category: data.category,
                              photo: data.photo,
                          }
                        : item
                )
            );

            return data;
        } catch (err) {
            console.error("❌ Error updating item:", err);
            throw err;
        }
    };

    // DELETE item
    const deleteItem = async (id) => {
        try {
            console.log("🗑️ Deleting item:", id);

            // Get item first to delete photo if exists
            const item = items.find((i) => i.id === id);

            // Delete from database
            const { error } = await supabase
                .from("menu_items")
                .delete()
                .eq("id", id);

            if (error) {
                console.error("❌ Delete item error:", error);
                throw error;
            }

            // Delete photo from storage if exists
            if (item?.photo && item.photo.includes(STORAGE_BUCKET)) {
                try {
                    const photoPath = item.photo.split(`${STORAGE_BUCKET}/`)[1];
                    if (photoPath) {
                        await supabase.storage
                            .from(STORAGE_BUCKET)
                            .remove([photoPath]);
                        console.log("🖼️ Photo deleted:", photoPath);
                    }
                } catch (photoErr) {
                    console.warn("⚠️ Could not delete photo:", photoErr);
                }
            }

            console.log("✅ Item deleted:", id);

            // Update local state
            setItems((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            console.error("❌ Error deleting item:", err);
            throw err;
        }
    };

    // INCREMENT views
    const incrementViews = async (id) => {
        try {
            const item = items.find((i) => i.id === id);
            if (!item) return;

            const newViews = (item.views || 0) + 1;

            // Update local state immediately for better UX
            setItems((prev) =>
                prev.map((i) => (i.id === id ? { ...i, views: newViews } : i))
            );

            // Update in database
            await supabase
                .from("menu_items")
                .update({ views: newViews })
                .eq("id", id);
        } catch (err) {
            console.error("❌ Error incrementing views:", err);
        }
    };

    // REORDER items
    const reorderItems = async (newItems) => {
        try {
            console.log("🔄 Reordering items...");

            // Update local state immediately
            const reorderedItems = newItems.map((item, idx) => ({
                ...item,
                order: idx,
            }));
            setItems(reorderedItems);

            // Update in database
            const updates = newItems.map((item, index) =>
                supabase
                    .from("menu_items")
                    .update({ sort_order: index })
                    .eq("id", item.id)
            );

            await Promise.all(updates);
            console.log("✅ Items reordered");
        } catch (err) {
            console.error("❌ Error reordering items:", err);
            // Revert on error
            await fetchItems();
        }
    };

    // ============================================
    // PHOTO UPLOAD
    // ============================================

    const uploadPhoto = async (file) => {
        try {
            console.log("📤 Uploading photo:", file.name);

            // Validate file
            if (!file) throw new Error("No file provided");

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/webp",
            ];
            if (!allowedTypes.includes(file.type)) {
                throw new Error(
                    "File type not allowed. Use JPG, PNG, GIF, or WebP."
                );
            }

            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                throw new Error("File too large. Maximum 5MB.");
            }

            // Generate unique filename
            const fileExt = file.name.split(".").pop().toLowerCase();
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 10);
            const fileName = `menu-photos/${timestamp}-${randomStr}.${fileExt}`;

            console.log("📁 Uploading to:", fileName);

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(fileName, file, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (error) {
                console.error("❌ Upload error:", error);
                throw error;
            }

            console.log("✅ Upload success:", data.path);

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(fileName);

            console.log("🔗 Public URL:", urlData.publicUrl);

            return {
                url: urlData.publicUrl,
                path: fileName,
            };
        } catch (err) {
            console.error("❌ Error uploading photo:", err);
            throw err;
        }
    };

    // Delete photo from storage
    const deletePhoto = async (photoUrl) => {
        try {
            if (!photoUrl || !photoUrl.includes(STORAGE_BUCKET)) return;

            const photoPath = photoUrl.split(`${STORAGE_BUCKET}/`)[1];
            if (!photoPath) return;

            console.log("🗑️ Deleting photo:", photoPath);

            const { error } = await supabase.storage
                .from(STORAGE_BUCKET)
                .remove([photoPath]);

            if (error) throw error;

            console.log("✅ Photo deleted");
        } catch (err) {
            console.error("❌ Error deleting photo:", err);
        }
    };

    // ============================================
    // STORE SETTINGS
    // ============================================

    const setSettings = async (newSettings) => {
        try {
            console.log("💾 Saving settings:", newSettings);

            const { error } = await supabase
                .from("stores")
                .update({
                    name: newSettings.storeName,
                    whatsapp_number: newSettings.whatsappNumber,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", DEFAULT_STORE_ID);

            if (error) {
                console.error("❌ Update settings error:", error);
                throw error;
            }

            console.log("✅ Settings saved");
            setSettingsState(newSettings);
        } catch (err) {
            console.error("❌ Error updating settings:", err);
            throw err;
        }
    };

    // ============================================
    // RETURN
    // ============================================

    return {
        // Data
        items,
        settings,
        loading,
        error,

        // CRUD
        addItem,
        updateItem,
        deleteItem,
        incrementViews,
        reorderItems,

        // Photo
        uploadPhoto,
        deletePhoto,

        // Settings
        setSettings,

        // Refresh
        refetch: fetchItems,
    };
}

export default useSupabase;
