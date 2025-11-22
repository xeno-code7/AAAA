import React, { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
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

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith("image/")) {
            setErrors((prev) => ({
                ...prev,
                photo: "Please select an image file",
            }));
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrors((prev) => ({
                ...prev,
                photo: "Image must be less than 5MB",
            }));
            return;
        }

        if (onUploadPhoto) {
            setUploading(true);
            try {
                const result = await onUploadPhoto(file);
                setForm((prev) => ({
                    ...prev,
                    photo: result.url,
                    photoPath: result.path,
                }));
            } catch (err) {
                setErrors((prev) => ({
                    ...prev,
                    photo: "Upload failed. Please try again.",
                }));
            } finally {
                setUploading(false);
            }
        } else {
            // Fallback: create local preview URL
            const url = URL.createObjectURL(file);
            setForm((prev) => ({ ...prev, photo: url }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = "Name is required";
        if (!form.price || form.price <= 0)
            newErrors.price = "Valid price is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        onSave({
            ...form,
            price: Number(form.price),
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
                    className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nasi Goreng Spesial"
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
                    className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.price ? "border-red-500" : "border-gray-300"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                            {t[cat]}
                        </option>
                    ))}
                </select>
            </div>

            {/* Photo */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.photo}
                </label>

                {/* Photo preview */}
                {form.photo && (
                    <div className="relative mb-2 inline-block">
                        <img
                            src={form.photo}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded-lg border"
                        />
                        <button
                            onClick={() => handleChange("photo", "")}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                            <X size={12} />
                        </button>
                    </div>
                )}

                {/* Upload button or URL input */}
                <div className="flex gap-2">
                    <label
                        className={`
            flex items-center gap-2 px-3 py-2 
            border border-dashed border-gray-300 rounded-lg 
            cursor-pointer hover:bg-gray-50 transition-colors
            ${uploading ? "opacity-50 pointer-events-none" : ""}
          `}
                    >
                        {uploading ? (
                            <span className="text-sm text-gray-500">
                                Uploading...
                            </span>
                        ) : (
                            <>
                                <Upload size={16} className="text-gray-400" />
                                <span className="text-sm text-gray-600">
                                    {t.uploadPhoto}
                                </span>
                            </>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                    </label>
                </div>

                {/* Or URL input */}
                <div className="mt-2">
                    <input
                        type="text"
                        value={form.photo}
                        onChange={(e) => handleChange("photo", e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
                {errors.photo && (
                    <p className="text-red-500 text-xs mt-1">{errors.photo}</p>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
                <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                    {t.cancel}
                </button>
                <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    {t.save}
                </button>
            </div>
        </div>
    );
}

export default ItemForm;
