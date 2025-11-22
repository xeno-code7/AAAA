import React, { useState } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const CATEGORIES = ["food", "drink", "snack", "dessert", "other"];

export function ItemForm({ item, onSave, onCancel, onUploadPhoto }) {
    const { t } = useLanguage();

    const [form, setForm] = useState({
        name: item?.name || "",
        price: item?.price || "",
        description: item?.description || "",
        category: item?.category || "food",
        photo: item?.photo || "",
    });

    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState({});
    const [uploadError, setUploadError] = useState("");

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    // Handle file upload
    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset errors
        setUploadError("");

        // Validate file type
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
            setUploadError(
                "Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP."
            );
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError("Ukuran file terlalu besar. Maksimal 5MB.");
            return;
        }

        // Upload to Supabase
        if (onUploadPhoto) {
            setUploading(true);
            try {
                console.log("📤 Starting upload...");
                const result = await onUploadPhoto(file);
                console.log("✅ Upload result:", result);

                setForm((prev) => ({ ...prev, photo: result.url }));
                setUploadError("");
            } catch (err) {
                console.error("❌ Upload failed:", err);
                setUploadError(
                    err.message || "Upload gagal. Silakan coba lagi."
                );
            } finally {
                setUploading(false);
            }
        }

        // Reset input
        e.target.value = "";
    };

    // Remove photo
    const handleRemovePhoto = () => {
        setForm((prev) => ({ ...prev, photo: "" }));
        setUploadError("");
    };

    // Validate form
    const validate = () => {
        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name = "Nama wajib diisi";
        }

        if (!form.price || Number(form.price) <= 0) {
            newErrors.price = "Harga harus lebih dari 0";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle submit
    const handleSubmit = () => {
        if (!validate()) return;

        onSave({
            name: form.name.trim(),
            price: Number(form.price),
            description: form.description.trim(),
            category: form.category,
            photo: form.photo,
        });
    };

    return (
        <div className="space-y-4">
            {/* Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.name} <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.name
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                    }`}
                    placeholder="Contoh: Nasi Goreng Spesial"
                />
                {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
            </div>

            {/* Price */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.price} (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    value={form.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.price
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                    }`}
                    placeholder="25000"
                    min="0"
                />
                {errors.price && (
                    <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.description}
                </label>
                <textarea
                    value={form.description}
                    onChange={(e) =>
                        handleChange("description", e.target.value)
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                    placeholder="Deskripsi singkat menu..."
                />
            </div>

            {/* Category */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.category}
                </label>
                <select
                    value={form.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                            {t[cat]}
                        </option>
                    ))}
                </select>
            </div>

            {/* Photo Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.photo}
                </label>

                {/* Photo Preview */}
                {form.photo && (
                    <div className="relative inline-block mb-3">
                        <img
                            src={form.photo}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                            onError={(e) => {
                                e.target.src =
                                    "https://via.placeholder.com/128?text=Error";
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* Upload Button */}
                {!form.photo && (
                    <label
                        className={`
            flex flex-col items-center justify-center 
            w-full h-32 
            border-2 border-dashed border-gray-300 rounded-lg 
            cursor-pointer 
            hover:bg-gray-50 hover:border-blue-400
            transition-all
            ${uploading ? "opacity-50 pointer-events-none bg-gray-50" : ""}
          `}
                    >
                        {uploading ? (
                            <div className="flex flex-col items-center">
                                <Loader2
                                    size={32}
                                    className="text-blue-500 animate-spin mb-2"
                                />
                                <span className="text-sm text-gray-500">
                                    Mengupload...
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <Upload
                                    size={32}
                                    className="text-gray-400 mb-2"
                                />
                                <span className="text-sm text-gray-600 font-medium">
                                    Klik untuk upload foto
                                </span>
                                <span className="text-xs text-gray-400 mt-1">
                                    JPG, PNG, GIF, WebP (max 5MB)
                                </span>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                    </label>
                )}

                {/* Upload Error */}
                {uploadError && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                        <X size={12} />
                        {uploadError}
                    </p>
                )}

                {/* Or URL Input */}
                <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">
                        Atau masukkan URL foto:
                    </p>
                    <input
                        type="text"
                        value={form.photo}
                        onChange={(e) => handleChange("photo", e.target.value)}
                        placeholder="https://example.com/photo.jpg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                    {t.cancel}
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={uploading}
                    className={`
            flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium transition-colors
            ${uploading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}
          `}
                >
                    {uploading ? "Mengupload..." : t.save}
                </button>
            </div>
        </div>
    );
}

export default ItemForm;
