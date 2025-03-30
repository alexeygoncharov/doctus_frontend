"use client";

import React, { useState, useEffect } from "react";
import { Doctor, doctors } from "@/lib/doctors";
import { Message } from "@/lib/types";
import { DoctorList } from "@/components/doctors/doctor-list";
import { ChatWindow } from "@/components/chat/chat-window";
import { MenuIcon, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PricingModal } from "@/components/pricing/pricing-modal";

export function DoctorChat() {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [chatSessions, setChatSessions] = useState<{[doctorId: string]: Message[]}>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  
  // Initialize empty chat sessions for each doctor
  useEffect(() => {
    const initialSessions: {[doctorId: string]: Message[]} = {};
    doctors.forEach(doctor => {
      initialSessions[doctor.id] = [];
    });
    setChatSessions(initialSessions);
  }, []);
  
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
    <div className="h-[calc(100vh-2rem)] w-full border rounded-lg overflow-hidden flex flex-col md:flex-row relative bg-background">
      {/* Mobile header - only visible on mobile */}
      <div className="md:hidden border-b p-4 flex items-center justify-between bg-background z-30 fixed top-0 left-0 right-0">
        <div className="flex items-center">
          <button 
            type="button"
            className="p-2 mr-3 rounded-full hover:bg-muted"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          {selectedDoctor && typeof selectedDoctor === 'object' && (
            <div className="relative mr-3">
              <Avatar className="h-8 w-8 shrink-0 relative bg-blue-100">
                <AvatarImage alt={selectedDoctor.name} src={selectedDoctor.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 border-2 border-white" />
            </div>
          )}
          <h2 className="text-xl font-bold">
            {selectedDoctor && typeof selectedDoctor === 'object' ? `Чат с ${selectedDoctor.name}ом` : "ИИ Врачи"}
          </h2>
        </div>
      </div>

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
      <div className="flex-1 h-[calc(100%-64px)] md:h-full mt-16 md:mt-0 pt-[60px] md:pt-0">
        <ChatWindow 
          doctor={selectedDoctor}
          messages={currentMessages}
          setMessages={setCurrentMessages}
        />
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
      />
    </div>
  );
}