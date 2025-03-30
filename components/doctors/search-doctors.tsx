"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "../../components/ui/input";
import { doctors as staticDoctors, Doctor } from "../../lib/doctors";

interface SearchDoctorsProps {
  onFilteredDoctors: (filteredDoctors: Doctor[]) => void;
  allDoctors?: Doctor[];
}

export function SearchDoctors({ onFilteredDoctors, allDoctors = staticDoctors }: SearchDoctorsProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Фильтрация докторов по поисковому запросу
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Если поисковый запрос пустой, возвращаем всех докторов
      onFilteredDoctors(allDoctors);
      return;
    }

    // Фильтрация докторов по имени и специализации
    const term = searchTerm.toLowerCase();
    const filtered = allDoctors.filter(
      (doctor) => 
        doctor.name.toLowerCase().includes(term) || 
        doctor.specialty.toLowerCase().includes(term) ||
        (doctor.description && doctor.description.toLowerCase().includes(term))
    );
    
    onFilteredDoctors(filtered);
  }, [searchTerm, onFilteredDoctors, allDoctors]);

  return (
    <div className="p-4 border-b">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Поиск врачей..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 w-full"
          autoComplete="off"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-3"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
}