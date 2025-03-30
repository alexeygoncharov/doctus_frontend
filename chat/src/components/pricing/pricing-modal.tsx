"use client";

import { useEffect } from "react";
import { X, Check } from "lucide-react";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  // Close modal when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex justify-between items-center border-b">
          <h2 className="text-2xl font-bold">Тарифы +Plus</h2>
          <button 
            type="button"
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-8">
            Выберите подходящий тарифный план для получения доступа ко всем врачам и расширенным возможностям
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Стартовый план */}
            <div className="border rounded-lg p-6 flex flex-col">
              <div className="mb-4">
                <h3 className="text-xl font-bold">Стартовый</h3>
                <p className="text-gray-500 mt-1">Доступ к базовым функциям</p>
              </div>
              
              <div className="mb-6">
                <span className="text-3xl font-bold">499₽</span>
                <span className="text-gray-500 ml-2">/ месяц</span>
              </div>
              
              <ul className="space-y-3 mb-6 flex-1">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Доступ к 5 премиум-специалистам</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>20 консультаций в месяц</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Загрузка файлов до 5 МБ</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Базовая история консультаций</span>
                </li>
              </ul>
              
              <button type="button" className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                Выбрать план
              </button>
            </div>
            
            {/* Профессиональный план */}
            <div className="border rounded-lg p-6 flex flex-col border-blue-500 shadow-md relative">
              <div className="absolute -top-3 right-4 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                Популярный выбор
              </div>
              
              <div className="mb-4">
                <h3 className="text-xl font-bold">Профессиональный</h3>
                <p className="text-gray-500 mt-1">Полный доступ без ограничений</p>
              </div>
              
              <div className="mb-6">
                <span className="text-3xl font-bold">999₽</span>
                <span className="text-gray-500 ml-2">/ месяц</span>
              </div>
              
              <ul className="space-y-3 mb-6 flex-1">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Доступ ко всем 15+ премиум-специалистам</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Безлимитные консультации</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Загрузка файлов до 25 МБ</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Расширенная история консультаций</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Приоритетная поддержка</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Экспорт чатов и диагнозов</span>
                </li>
              </ul>
              
              <button type="button" className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                Выбрать план
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-8">
            * Все планы включают 7-дневный пробный период. Отмена подписки возможна в любой момент.
          </p>
        </div>
      </div>
    </div>
  );
}