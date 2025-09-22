"use client";

import { X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
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

export default function FilterSidebar({
  isOpen,
  onClose,
  selectedFileTypes,
  onFileTypeToggle,
  selectedCategories,
  onCategoryToggle,
  categories,
  onClearFilters,
}: FilterSidebarProps) {
  const fileTypes = [
    { id: "psd", name: "PSD", icon: "📄" },
    { id: "png", name: "PNG", icon: "🖼️" },
    { id: "canva", name: "Canva", icon: "🎨" },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-background border-r z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Filtros</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Tipos de Arquivo */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">
                Formato
              </h3>
              <div className="space-y-2">
                {fileTypes.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onFileTypeToggle(type.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{type.icon}</span>
                      <span className="text-sm">{type.name}</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 transition-colors ${
                        selectedFileTypes.includes(type.id)
                          ? "bg-primary border-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {selectedFileTypes.includes(type.id) && (
                        <div className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Categorias */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">
                Categorias
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onCategoryToggle(category.id)}
                  >
                    <span className="text-sm">{category.name}</span>
                    <div
                      className={`w-4 h-4 rounded-full border-2 transition-colors ${
                        selectedCategories.includes(category.id)
                          ? "bg-primary border-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {selectedCategories.includes(category.id) && (
                        <div className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t space-y-3">
            {/* Filtros Ativos */}
            {(selectedFileTypes.length > 0 ||
              selectedCategories.length > 0) && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {selectedFileTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {fileTypes.find((t) => t.id === type)?.name}
                    </Badge>
                  ))}
                  {selectedCategories.map((categoryId) => (
                    <Badge
                      key={categoryId}
                      variant="secondary"
                      className="text-xs"
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
              className="w-full"
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
    </>
  );
}
