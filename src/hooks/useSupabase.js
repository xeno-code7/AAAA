import { useState, useEffect, useCallback } from "react";
import { supabase } from "../config/supabase";

const DEFAULT_STORE_ID = "00000000-0000-0000-0000-000000000001";
const STORAGE_BUCKET = "menu-photos";

export function useSupabase() {
  const [items, setItems] = useState([]);
  const [settings, setSettingsState] = useState({
    storeName: "",
    storeLocation: "",
    operatingHours: "",
    whatsappNumber: "",
  });
  const [customCategories, setCustomCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Items
  const fetchItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("store_id", DEFAULT_STORE_ID)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      const transformed = (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description || "",
        category: item.category || "food",
        photo: item.photo || "",
        views: item.views || 0,
        order: item.sort_order || 0,
      }));

      setItems(transformed);
      extractCustomCategories(transformed);
      return transformed;
    } catch (err) {
      console.error("❌ Fetch items:", err);
      return [];
    }
  }, []);

  // Fetch Settings from Database
  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", DEFAULT_STORE_ID)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Store doesn't exist, create it
          const { data: newStore, error: insertError } = await supabase
            .from("stores")
            .insert({
              id: DEFAULT_STORE_ID,
              name: "Toko Saya",
              location: "",
              operating_hours: "",
              whatsapp_number: "628123456789",
            })
            .select()
            .single();

          if (insertError) throw insertError;

          setSettingsState({
            storeName: newStore.name,
            storeLocation: newStore.location || "",
            operatingHours: newStore.operating_hours || "",
            whatsappNumber: newStore.whatsapp_number,
          });
          return;
        }
        throw error;
      }

      // Set settings from database
      setSettingsState({
        storeName: data.name || "",
        storeLocation: data.location || "",
        operatingHours: data.operating_hours || "",
        whatsappNumber: data.whatsapp_number || "",
      });
    } catch (err) {
      console.error("❌ Fetch settings:", err);
      // Set default values on error
      setSettingsState({
        storeName: "Toko Saya",
        storeLocation: "",
        operatingHours: "",
        whatsappNumber: "628123456789",
      });
    }
  }, []);

  // Extract Custom Categories
  const extractCustomCategories = (items) => {
    const defaultCategories = ["food", "drink", "snack", "dessert", "other"];
    const allCats = [...new Set(items.map((i) => i.category))];
    setCustomCategories(allCats.filter((c) => !defaultCategories.includes(c)));
  };

  // Add Custom Category
  const addCustomCategory = (category) => {
    if (!category || typeof category !== "string") return false;
    
    const trimmed = category.trim().toLowerCase();
    if (trimmed.length < 2 || trimmed.length > 20) return false;
    
    const defaultCategories = ["food", "drink", "snack", "dessert", "other"];
    const allCategories = [...defaultCategories, ...customCategories];
    
    if (allCategories.includes(trimmed)) return false;
    if (!/^[a-z0-9\s-]+$/.test(trimmed)) return false;
    
    setCustomCategories((prev) => [...prev, trimmed]);
    return true;
  };

  // Initial Load + Realtime
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchItems(), fetchSettings()]);
      setLoading(false);
    };

    init();

    // Realtime subscription for items
    const itemsSub = supabase
      .channel("menu_items_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_items" },
        fetchItems
      )
      .subscribe();

    // Realtime subscription for settings
    const settingsSub = supabase
      .channel("stores_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stores" },
        fetchSettings
      )
      .subscribe();

    return () => {
      supabase.removeChannel(itemsSub);
      supabase.removeChannel(settingsSub);
    };
  }, [fetchItems, fetchSettings]);

  // Add Item
  const addItem = async (itemData) => {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .insert({
          store_id: DEFAULT_STORE_ID,
          name: itemData.name,
          price: itemData.price,
          description: itemData.description || "",
          category: itemData.category || "food",
          photo: itemData.photo || "",
          views: 0,
          sort_order: items.length,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchItems();
      return data;
    } catch (err) {
      console.error("❌ Add item:", err);
      throw err;
    }
  };

  // Update Item
  const updateItem = async (id, itemData) => {
    try {
      const updateData = {
        updated_at: new Date().toISOString(),
      };

      // Only include fields that are provided
      if (itemData.name !== undefined) updateData.name = itemData.name;
      if (itemData.price !== undefined) updateData.price = itemData.price;
      if (itemData.description !== undefined) updateData.description = itemData.description;
      if (itemData.category !== undefined) updateData.category = itemData.category;
      if (itemData.photo !== undefined) updateData.photo = itemData.photo;
      if (itemData.views !== undefined) updateData.views = itemData.views;

      const { error } = await supabase
        .from("menu_items")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      await fetchItems();
    } catch (err) {
      console.error("❌ Update item:", err);
      throw err;
    }
  };

  // Delete Item
  const deleteItem = async (id) => {
    try {
      await supabase.from("menu_items").delete().eq("id", id);
      await fetchItems();
    } catch (err) {
      console.error("❌ Delete item:", err);
      throw err;
    }
  };

  // Reorder
  const reorderItems = async (newItems) => {
    try {
      for (let i = 0; i < newItems.length; i++) {
        await supabase
          .from("menu_items")
          .update({ sort_order: i })
          .eq("id", newItems[i].id);
      }
      await fetchItems();
    } catch (err) {
      console.error("❌ Reorder:", err);
    }
  };

  // Upload Photo
  const uploadPhoto = async (file) => {
    try {
      const ext = file.name.split(".").pop();
      const fileName = `menu-${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

      return { url: urlData?.publicUrl || "" };
    } catch (err) {
      console.error("❌ Upload photo:", err);
      throw err;
    }
  };

  // Save Store Settings to Database
  const setSettings = async (newSettings) => {
    try {
      const { error } = await supabase
        .from("stores")
        .update({
          name: newSettings.storeName,
          location: newSettings.storeLocation,
          operating_hours: newSettings.operatingHours,
          whatsapp_number: newSettings.whatsappNumber,
          updated_at: new Date().toISOString(),
        })
        .eq("id", DEFAULT_STORE_ID);

      if (error) throw error;

      // Update local state after successful save
      setSettingsState(newSettings);
      
      // Refresh from database to ensure sync
      await fetchSettings();
      
      return { success: true };
    } catch (err) {
      console.error("❌ Save settings:", err);
      throw err;
    }
  };

  return {
    items,
    settings,
    customCategories,
    loading,

    addItem,
    updateItem,
    deleteItem,
    reorderItems,

    uploadPhoto,
    setSettings,
    addCustomCategory,
    refetch: fetchItems,
  };
}

export default useSupabase;