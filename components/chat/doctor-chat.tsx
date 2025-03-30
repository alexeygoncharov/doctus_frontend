"use client";

import React, { useState, useEffect } from "react";
import { Doctor, doctors as staticDoctors, mapApiDoctorToUi } from "../../lib/doctors";
import { getDoctors } from "../../lib/api";
import { Message } from "../../lib/types";
import { DoctorList } from "../../components/doctors/doctor-list";
import { ChatWindow } from "../../components/chat/chat-window";
import { MenuIcon, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { PricingModal } from "../../components/pricing/pricing-modal";

interface DoctorChatProps {
  initialDoctorId?: string | number;
}

export function DoctorChat({ initialDoctorId }: DoctorChatProps = {}) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [chatSessions, setChatSessions] = useState<{[doctorId: string]: Message[]}>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Загрузка докторов из API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        const apiDoctors = await getDoctors();
        // Преобразуем данные из API в формат, используемый во фронтенде
        const mappedDoctors = apiDoctors.map(mapApiDoctorToUi);
        setDoctors(mappedDoctors);
        
        // Если передан initialDoctorId, выбираем соответствующего доктора
        if (initialDoctorId) {
          const initialDoctor = mappedDoctors.find((d: Doctor) => 
            d.id.toString() === initialDoctorId.toString()
          );
          if (initialDoctor) {
            setSelectedDoctor(initialDoctor);
          }
        }
      } catch (err) {
        console.error("Ошибка при загрузке докторов:", err);
        // Используем статические данные в случае ошибки
        setDoctors(staticDoctors);
        
        // Если передан initialDoctorId, выбираем соответствующего доктора из статических данных
        if (initialDoctorId) {
          const initialDoctor = staticDoctors.find((d: Doctor) => 
            d.id.toString() === initialDoctorId.toString()
          );
          if (initialDoctor) {
            setSelectedDoctor(initialDoctor);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, [initialDoctorId]);
  
  // Initialize empty chat sessions for each doctor
  useEffect(() => {
    if (doctors.length === 0) return;
    
    const initialSessions: {[doctorId: string]: Message[]} = {};
    doctors.forEach(doctor => {
      initialSessions[doctor.id] = [];
    });
    setChatSessions(initialSessions);
  }, [doctors]);
  
  // Event listener for showing pricing modal
  useEffect(() => {
    const handleShowPricing = () => {
      setIsPricingModalOpen(true);
    };
    
    window.addEventListener('showPricing', handleShowPricing);
    
    return () => {
      window.removeEventListener('showPricing', handleShowPricing);
    };
  }, []);
  
  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    // On mobile, automatically close the sidebar when a doctor is selected
    setIsMobileMenuOpen(false);
  };
  
  const currentMessages = selectedDoctor ? chatSessions[selectedDoctor.id] || [] : [];
  
  const setCurrentMessages = (updater: React.SetStateAction<Message[]>) => {
    if (!selectedDoctor) return;
    
    setChatSessions(prev => {
      const newMessages = typeof updater === 'function' 
        ? updater(prev[selectedDoctor.id] || [])
        : updater;
      
      return {
        ...prev,
        [selectedDoctor.id]: newMessages
      };
    });
  };

  return (
    <div className="h-[650px] md:h-[75vh] lg:h-[80vh] w-full border rounded-lg overflow-hidden flex flex-col md:flex-row relative bg-background">
      {/* Doctor list sidebar */}
      <div 
        className={`
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} 
          transition-transform duration-200 
          absolute md:relative z-20 
          h-full w-full md:w-1/3 lg:w-1/4 
          bg-background md:border-r top-0
        `}
      >
        <DoctorList 
          isMobile={isMobileMenuOpen} 
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
          onSelectDoctor={handleSelectDoctor}
          selectedDoctorId={selectedDoctor?.id || null}
        />
      </div>
      
      {/* Chat window */}
      <div className="flex-1 h-full flex flex-col">
        {/* Mobile header - integrated inside chat window */}
        <div className="md:hidden border-b p-4 flex items-center justify-between bg-background z-30">
          <div className="flex items-center">
            <button 
              type="button"
              className="p-2 mr-3 rounded-full hover:bg-muted"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold">
              {selectedDoctor && typeof selectedDoctor === 'object' ? `Чат с ${selectedDoctor.name}` : "ИИ Врачи"}
            </h2>
          </div>
          
        </div>
        
        <div className="flex-1 overflow-auto">
          <ChatWindow 
            doctor={selectedDoctor}
            messages={currentMessages}
            setMessages={setCurrentMessages}
          />
        </div>
      </div>
      
      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="absolute inset-0 bg-black/20 z-10 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Pricing Modal */}
      <PricingModal 
        isOpen={isPricingModalOpen} 
        onClose={() => setIsPricingModalOpen(false)} 
        subscription={null}
        onSubscribe={async () => {}}
      />
    </div>
  );
}