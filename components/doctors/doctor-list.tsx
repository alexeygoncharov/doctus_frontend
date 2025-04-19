"use client";

import React, { useState, useEffect } from "react";
import { doctors as staticDoctors, Doctor, mapApiDoctorToUi } from "../../lib/doctors";
import { getDoctors } from "../../lib/api";
import { User, X } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { ScrollArea } from "../../components/ui/scroll-area";
import { SearchDoctors } from "./search-doctors";
import { SimpleAvatar } from "@/components/ui/SimpleAvatar";
import { PlusBadge } from "./plus-badge";
import { useRouter } from "next/router";

interface DoctorListProps {
  onSelectDoctor: (doctor: Doctor) => void;
  selectedDoctorId: string | number | null;
  isMobile?: boolean;
  onCloseMobileMenu?: () => void;
  doctors: Doctor[];
  isLoading: boolean;
  error: string | null;
}

export function DoctorList({ 
  onSelectDoctor, 
  selectedDoctorId,
  isMobile = false, 
  onCloseMobileMenu = () => {},
  doctors,
  isLoading,
  error,
}: DoctorListProps) {
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>(doctors);

  useEffect(() => {
    setFilteredDoctors(doctors);
  }, [doctors]);

  const handleFilterDoctors = (filtered: Doctor[]) => {
    setFilteredDoctors(filtered);
  };
  const router = useRouter();
  const isDoctorPage = router.pathname === '/doctor/[slug]';

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
      <SearchDoctors onFilteredDoctors={handleFilterDoctors} allDoctors={doctors} />
      
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
            {filteredDoctors.map((doctor) => {
              const avatarSrc = doctor.avatar.startsWith('/uploads/')
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${doctor.avatar}`
                : doctor.avatar;
              const targetPath = `/doctor/${doctor.slug || doctor.id}`;
              return (
                <button
                  key={doctor.id}
                  type="button"
                  onClick={(e) => {
                    onSelectDoctor(doctor);
                    if (isDoctorPage) {
                      e.preventDefault();
                      router.push(targetPath, undefined, { shallow: true });
                    } else {
                      router.push(targetPath);
                    }
                  }}
                  className={
                    `w-full text-left p-2 flex items-center space-x-3 rounded-lg hover:bg-muted
                    ${selectedDoctorId === doctor.id ? 'bg-blue-50' : ''}`
                  }
                >
                  <div className="relative shrink-0">
                    <SimpleAvatar
                      src={avatarSrc}
                      alt={doctor.name || 'Доктор'}
                      fallbackText={doctor.name ?? undefined}
                      width={40}
                      height={40}
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{doctor.name}</p>
                      {doctor.isPremium && <PlusBadge />}
                    </div>
                    <p className="text-xs truncate text-gray-500">{doctor.description}</p>
                  </div>
                </button>
              );
            })}
            
            {filteredDoctors.length === 0 && !isLoading && (
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