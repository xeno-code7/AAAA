import React from "react";
import { Palette, Check } from "lucide-react";

// Template configurations with complete color schemes
const templates = {
  blue: {
    id: "blue",
    name: "Blue Professional",
    preview: "bg-gradient-to-r from-[#666fb8] to-[#333fa1]",
    colors: {
      primary: "#666fb8",
      primaryDark: "#333fa1",
      primaryLight: "#e6e8f7",
      gradient: "from-[#666fb8] to-[#333fa1]",
      button: "bg-[#666fb8] hover:bg-[#333fa1]",
      badge: "bg-[#e6e8f7] text-[#666fb8]",
      border: "border-[#666fb8]",
    },
  },
  green: {
    id: "green",
    name: "Green Fresh",
    preview: "bg-gradient-to-r from-green-500 to-emerald-600",
    colors: {
      primary: "#10b981",
      primaryDark: "#059669",
      primaryLight: "#d1fae5",
      gradient: "from-green-500 to-emerald-600",
      button: "bg-green-500 hover:bg-emerald-600",
      badge: "bg-green-100 text-green-700",
      border: "border-green-500",
    },
  },
  purple: {
    id: "purple",
    name: "Purple Elegant",
    preview: "bg-gradient-to-r from-purple-500 to-pink-600",
    colors: {
      primary: "#a855f7",
      primaryDark: "#9333ea",
      primaryLight: "#f3e8ff",
      gradient: "from-purple-500 to-pink-600",
      button: "bg-purple-500 hover:bg-purple-600",
      badge: "bg-purple-100 text-purple-700",
      border: "border-purple-500",
    },
  },
  orange: {
    id: "orange",
    name: "Orange Warm",
    preview: "bg-gradient-to-r from-orange-500 to-red-600",
    colors: {
      primary: "#f97316",
      primaryDark: "#ea580c",
      primaryLight: "#ffedd5",
      gradient: "from-orange-500 to-red-600",
      button: "bg-orange-500 hover:bg-orange-600",
      badge: "bg-orange-100 text-orange-700",
      border: "border-orange-500",
    },
  },
  cyan: {
    id: "cyan",
    name: "Cyan Modern",
    preview: "bg-gradient-to-r from-cyan-500 to-blue-600",
    colors: {
      primary: "#06b6d4",
      primaryDark: "#0891b2",
      primaryLight: "#cffafe",
      gradient: "from-cyan-500 to-blue-600",
      button: "bg-cyan-500 hover:bg-cyan-600",
      badge: "bg-cyan-100 text-cyan-700",
      border: "border-cyan-500",
    },
  },
  rose: {
    id: "rose",
    name: "Rose Romantic",
    preview: "bg-gradient-to-r from-rose-500 to-pink-600",
    colors: {
      primary: "#f43f5e",
      primaryDark: "#e11d48",
      primaryLight: "#ffe4e6",
      gradient: "from-rose-500 to-pink-600",
      button: "bg-rose-500 hover:bg-rose-600",
      badge: "bg-rose-100 text-rose-700",
      border: "border-rose-500",
    },
  },
};

// Helper function to get template colors with fallback
export function getTemplateColors(templateId) {
  if (!templateId || !templates[templateId]) {
    return templates.blue.colors;
  }
  return templates[templateId].colors;
}

export default function TemplateSettings({
  currentTemplate = "blue",
  onTemplateChange,
  lang = "en",
}) {
  const safeTemplate =
    currentTemplate && templates[currentTemplate] ? currentTemplate : "blue";
  const currentColors = templates[safeTemplate].colors;

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="text-center pb-4 border-b mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Palette size={24} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">
          {lang === "id" ? "Template Warna" : "Color Template"}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {lang === "id"
            ? "Pilih tema warna untuk menu Anda"
            : "Choose a color theme for your menu"}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.values(templates).map((template) => (
          <button
            key={template.id}
            onClick={() => onTemplateChange && onTemplateChange(template.id)}
            className={`relative p-4 rounded-xl border-2 transition-all hover:scale-105 ${
              safeTemplate === template.id
                ? "border-blue-500 ring-4 ring-blue-100"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div
              className={`w-full h-20 rounded-lg ${template.preview} mb-3 shadow-md`}
            />

            <p className="text-sm font-semibold text-gray-900 mb-1">
              {template.name}
            </p>

            {safeTemplate === template.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <Check size={14} className="text-white" />
              </div>
            )}

            <div className="flex gap-1 mt-2">
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: template.colors.primary }}
              />
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: template.colors.primaryDark }}
              />
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: template.colors.primaryLight }}
              />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <p className="text-xs font-medium text-gray-600 mb-3">
          {lang === "id" ? "Pratinjau:" : "Preview:"}
        </p>
        <div className="space-y-2">
          <div
            className={`h-16 rounded-lg bg-gradient-to-r ${currentColors.gradient} flex items-center justify-center text-white font-semibold shadow-md`}
          >
            {lang === "id" ? "Header Menu" : "Menu Header"}
          </div>

          <button
            className={`w-full py-2 rounded-lg ${currentColors.button} text-white font-medium shadow-sm`}
          >
            {lang === "id" ? "Tombol" : "Button"}
          </button>

          <div className="flex gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${currentColors.badge}`}
            >
              {lang === "id" ? "Label" : "Badge"}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border-2 ${currentColors.border} bg-white`}
            >
              {lang === "id" ? "Border" : "Border"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>{lang === "id" ? "💡 Tips:" : "💡 Tip:"}</strong>{" "}
          {lang === "id"
            ? "Pilih warna yang sesuai dengan branding toko Anda untuk tampilan yang lebih menarik"
            : "Choose colors that match your store branding for a more attractive appearance"}
        </p>
      </div>
    </div>
  );
}

export { templates };
