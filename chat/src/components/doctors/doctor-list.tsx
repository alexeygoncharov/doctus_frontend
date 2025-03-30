"use client";

import { useState, useEffect } from "react";
import { Doctor, doctors } from "@/lib/doctors";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { SearchIcon, XIcon, User } from "lucide-react";
import { PlusBadge } from "./plus-badge";

interface DoctorListProps {
  isMobile?: boolean;
  onCloseMobileMenu?: () => void;
  onSelectDoctor: (doctor: Doctor) => void;
  selectedDoctorId: string | null;
}

export function DoctorList({ onSelectDoctor, selectedDoctorId, onCloseMobileMenu, isMobile }: DoctorListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>(doctors);

  // Filter doctors when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDoctors(doctors);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query) ||
        doctor.description.toLowerCase().includes(query)
    );

    setFilteredDoctors(filtered);
  }, [searchQuery]);

  // Компонент для отображения пустого состояния, когда врач не выбран
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <svg 
        className="text-blue-500 mb-4" 
        fill="none" 
        height="64" 
        stroke="currentColor" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        viewBox="0 0 24 24" 
        width="64" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="8" r="6" />
        <path d="M8 14h8" />
        <path d="M12 12v8" />
        <path d="M8 22h8" />
        <path d="M11 8a1 1 0 1 0 2 0 1 1 0 1 0-2 0" />
      </svg>
      <h3 className="text-lg font-medium">Выберите врача</h3>
      <p className="text-muted-foreground mt-2 mb-6">Выберите нужного специалиста из списка слева</p>
      <div className="flex flex-col sm:flex-row sm:space-x-12 space-y-6 sm:space-y-0 mt-6">
        <div className="flex flex-col items-center">
          <svg className="lucide lucide-clock h-7 w-7 mb-2 text-blue-500" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="text-sm font-medium">Доступно 24/7</span>
          <span className="text-xs text-muted-foreground mt-1">Получите консультацию в любое время</span>
        </div>
        <div className="flex flex-col items-center">
          <svg className="lucide lucide-shield-check h-7 w-7 mb-2 text-blue-500" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span className="text-sm font-medium">Конфиденциально</span>
          <span className="text-xs text-muted-foreground mt-1">Ваши данные надежно защищены</span>
        </div>
        <div className="flex flex-col items-center">
          <svg className="lucide lucide-brain h-7 w-7 mb-2 text-blue-500" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
          </svg>
          <span className="text-sm font-medium">ИИ технологии</span>
          <span className="text-xs text-muted-foreground mt-1">Современные медицинские знания</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`w-full h-full flex flex-col ${isMobile ? "pt-[60px]" : ""}`}>
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">ИИ Врачи</h2>
          <p className="text-sm text-muted-foreground">Выберите специалиста для консультации</p>
        </div>
        {isMobile && (
          <button 
            type="button"
            className="p-2 rounded-full hover:bg-muted md:hidden"
            onClick={onCloseMobileMenu}
          >
            <XIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      
      <div className="p-4 border-b">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 w-full"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск врачей..."
            value={searchQuery}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-2">
          {filteredDoctors.length === 0 ? (
            <EmptyState />
          ) : (
            filteredDoctors.map((doctor) => (
              <button
                type="button"
                className={`w-full text-left p-2 flex items-center space-x-3 
                  ${selectedDoctorId === doctor.id 
                    ? "rounded-[6px] bg-[#3B82F6] shadow-[0px_3px_5px_0px_rgba(0,0,0,0.04)]" 
                    : "rounded-lg hover:bg-muted"
                  }`}
                key={doctor.id}
                onClick={() => onSelectDoctor(doctor)}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10 shrink-0 relative bg-blue-100">
                    <AvatarImage alt={doctor.name} src={doctor.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium truncate ${selectedDoctorId === doctor.id ? "text-white" : ""}`}>{doctor.name}</p>
                    {doctor.isPremium && <PlusBadge />}
                  </div>
                  <p className={`text-xs truncate ${selectedDoctorId === doctor.id ? "text-[#C9DBFF]" : "text-gray-500"}`}>{doctor.specialty}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}