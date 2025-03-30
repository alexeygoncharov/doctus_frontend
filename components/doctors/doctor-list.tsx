"use client";

import React, { useState, useEffect } from "react";
import { doctors as staticDoctors, Doctor, mapApiDoctorToUi } from "../../lib/doctors";
import { getDoctors } from "../../lib/api";
import { User, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { PlusBadge } from "./plus-badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { SearchDoctors } from "./search-doctors";

interface DoctorListProps {
  onSelectDoctor: (doctor: Doctor) => void;
  selectedDoctorId: string | number | null;
  isMobile?: boolean;
  onCloseMobileMenu?: () => void;
}

export function DoctorList({ 
  onSelectDoctor, 
  selectedDoctorId,
  isMobile = false, 
  onCloseMobileMenu = () => {} 
}: DoctorListProps) {
  const [allDoctors, setAllDoctors] = useState<Doctor[]>(staticDoctors);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>(staticDoctors);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка докторов из API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        const apiDoctors = await getDoctors();
        // Преобразуем данные из API в формат, используемый во фронтенде
        const mappedDoctors = apiDoctors.map(mapApiDoctorToUi);
        setAllDoctors(mappedDoctors);
        setFilteredDoctors(mappedDoctors);
      } catch (err) {
        console.error("Ошибка при загрузке докторов:", err);
        setError("Не удалось загрузить список докторов");
        // Используем статические данные в случае ошибки
        setAllDoctors(staticDoctors);
        setFilteredDoctors(staticDoctors);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Обработчик поиска докторов
  const handleFilterDoctors = (filtered: Doctor[]) => {
    setFilteredDoctors(filtered);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Mobile header */}
      {isMobile && (
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-medium text-xl">Выберите специалиста</h2>
          <button 
            className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-gray-100" 
            onClick={onCloseMobileMenu}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {/* Desktop header */}
      {!isMobile && (
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">ИИ Врачи</h2>
          <p className="text-sm text-muted-foreground text-left">Выберите специалиста для консультации</p>
        </div>
      )}
      
      {/* Search doctors */}
      <SearchDoctors onFilteredDoctors={handleFilterDoctors} allDoctors={allDoctors} />
      
      {/* Doctors list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-3 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-full p-2 flex items-center space-x-3 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-gray-500">
            <p>{error}</p>
            <p className="text-sm mt-1">Пожалуйста, попробуйте позже</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {filteredDoctors.map((doctor) => (
              <button
                key={doctor.id}
                type="button"
                onClick={() => onSelectDoctor(doctor)}
                className={`
                  w-full text-left p-2 flex items-center space-x-3 
                  rounded-lg hover:bg-muted
                  ${selectedDoctorId === doctor.id ? 'bg-blue-50' : ''}
                `}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10 shrink-0 relative bg-blue-100">
                    <AvatarImage alt={doctor.name} src={doctor.avatar} draggable="false" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{doctor.name}</p>
                    {(doctor.isPremium || doctor.is_premium) && <PlusBadge />}
                  </div>
                  <p className="text-xs truncate text-gray-500">{doctor.specialty}</p>
                </div>
              </button>
            ))}
            
            {filteredDoctors.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Врачи не найдены</p>
                <p className="text-sm mt-1">Попробуйте изменить запрос</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}