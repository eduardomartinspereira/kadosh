"use client";

import { X, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedFileTypes: string[];
  onFileTypeToggle: (type: string) => void;
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  categories: Array<{
    id: string;
    name: string;
  }>;
  onClearFilters: () => void;
}

export default function LeftSidebar({
  isOpen,
  onToggle,
  selectedFileTypes,
  onFileTypeToggle,
  selectedCategories,
  onCategoryToggle,
  categories,
  onClearFilters,
}: LeftSidebarProps) {
  const fileTypes = [
    { id: "psd", name: "PSD", icon: "📄" },
    { id: "png", name: "PNG", icon: "🖼️" },
    { id: "canva", name: "Canva", icon: "🎨" },
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-80 bg-gray-900 border-r border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header com Logo */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src="/logoKadosh.svg"
                  alt="Kadosh Logo"
                  className="h-8 w-auto"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                Filtros
              </h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Tipos de Arquivo */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-4 uppercase tracking-wide">
                Formatos
              </h3>
              <div className="space-y-3">
                {fileTypes.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors group"
                    onClick={() => onFileTypeToggle(type.id)}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-lg">{type.icon}</span>
                      <span className="text-sm text-gray-300 group-hover:text-white">
                        {type.name}
                      </span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded border-2 transition-colors ${
                        selectedFileTypes.includes(type.id)
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-600"
                      }`}
                    >
                      {selectedFileTypes.includes(type.id) && (
                        <div className="w-full h-full rounded bg-white scale-50" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Categorias */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-4 uppercase tracking-wide">
                Categorias
              </h3>
              <div className="space-y-3">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors group"
                      onClick={() => onCategoryToggle(category.id)}
                    >
                      <span className="text-sm text-gray-300 group-hover:text-white">
                        {category.name}
                      </span>
                      <div
                        className={`w-5 h-5 rounded border-2 transition-colors ${
                          selectedCategories.includes(category.id)
                            ? "bg-blue-600 border-blue-600"
                            : "border-gray-600"
                        }`}
                      >
                        {selectedCategories.includes(category.id) && (
                          <div className="w-full h-full rounded bg-white scale-50" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">
                    Carregando categorias...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 space-y-4">
            {/* Filtros Ativos */}
            {(selectedFileTypes.length > 0 ||
              selectedCategories.length > 0) && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">
                  Filtros Ativos:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFileTypes.map((type) => (
                    <Badge
                      key={type}
                      variant="secondary"
                      className="text-xs bg-blue-600 text-white"
                    >
                      {fileTypes.find((t) => t.id === type)?.name}
                    </Badge>
                  ))}
                  {selectedCategories.map((categoryId) => (
                    <Badge
                      key={categoryId}
                      variant="secondary"
                      className="text-xs bg-blue-600 text-white"
                    >
                      {categories.find((c) => c.id === categoryId)?.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Botão Limpar */}
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              disabled={
                selectedFileTypes.length === 0 &&
                selectedCategories.length === 0
              }
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Botão Toggle para Desktop */}
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className={`fixed left-4 top-4 z-50 ${
          isOpen ? "left-80" : "left-4"
        } transition-all duration-300`}
      >
        {isOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </>
  );
}
