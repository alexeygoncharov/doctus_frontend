import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getDoctors } from '@/lib/api';
import { Doctor, mapApiDoctorToUi } from '@/lib/doctors';

const Footer: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Загружаем список докторов
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const apiDoctors = await getDoctors();
        const mappedDoctors = apiDoctors.map(mapApiDoctorToUi);
        setDoctors(mappedDoctors);
      } catch (error) {
        console.error('Ошибка при загрузке докторов:', error);
      }
    };
    
    fetchDoctors();
  }, []);

  useEffect(() => {
    // Инициализация стилей для футера при монтировании компонента
    const initializeFooter = () => {
      document.querySelectorAll('.footer-item').forEach(item => {
        const list = item.querySelector('ul');
        if (list && window.innerWidth < 640) { // 640px - это sm breakpoint в Tailwind
          list.style.maxHeight = '0px';
          list.style.opacity = '0';
        } else if (list) {
          // На десктопе всегда показываем
          list.style.maxHeight = `${list.scrollHeight}px`;
          list.style.opacity = '1';
        }
      });
    };

    // Инициализация при первой загрузке
    initializeFooter();

    // Обработчик клика для элементов футера
    const handleFooterItemClick = (event: MouseEvent) => {
      const target = event.currentTarget as HTMLElement;
      const parent = target.parentElement;
      
      if (parent) {
        // Получаем ссылку на список (ul) внутри footer-item
        const list = parent.querySelector('ul');
        if (list) {
          // Если элемент уже активен (открыт)
          if (parent.classList.contains('active')) {
            // Анимация закрытия
            list.style.maxHeight = '0px';
            list.style.opacity = '0';
            
            // Удаляем класс active после завершения анимации
            setTimeout(() => {
              parent.classList.remove('active');
            }, 300);
          } else {
            // Анимация открытия
            parent.classList.add('active');
            
            // Задержка для применения стилей после добавления класса
            setTimeout(() => {
              list.style.maxHeight = `${list.scrollHeight}px`;
              list.style.opacity = '1';
            }, 10);
          }
        } else {
          // Если список не найден, просто переключаем класс
          parent.classList.toggle('active');
        }
      }
    };

    // Добавляем обработчики клика для элементов футера
    const footerItems = document.querySelectorAll('.footer-item>p');
    footerItems.forEach(item => {
      item.addEventListener('click', handleFooterItemClick as EventListener);
    });

    // Обработчик изменения размера окна
    const handleResize = () => {
      initializeFooter();
    };

    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', handleResize);

    // Удаляем обработчик при размонтировании компонента
    return () => {
      window.removeEventListener('resize', handleResize);
      footerItems.forEach(item => {
        item.removeEventListener('click', handleFooterItemClick as EventListener);
      });
    };
  }, []);

  return (
    <footer className="footer bg-gray-900 py-6 md:py-14 px-4">
      <div className="max-w-320 mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-4 lg:gap-16">
          <div className="md:max-w-64">
            <Link href="/" className="flex flex-row items-center justify-center md:justify-start gap-1.5 lg:gap-2 header-logo min-w-0 lg:min-w-52">
              <Image className="h-7.5 lg:h-8 w-auto" src="/img/logo.png" alt="Logo" width={32} height={32} />
              <span className="text-xl lg:text-2xl text-white">МедАссистент</span>
            </Link>
            <p className="text-xs md:text-sm lg:text-base text-gray-300 text-center md:text-left mt-3.5 md:mt-6">
              МедАссистент - ваш надежный помощник в вопросах здоровья и медицинской информации.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 grow gap-3.5 sm:gap-2 w-full md:w-auto">
            <div className="footer-item group">
              <p className="text-base lg:text-lg text-white font-semibold lg:mb-4 flex cursor-pointer sm:cursor-text items-center justify-between sm:block">
                Полезные ссылки
                <svg className="group-[.active]:rotate-180 block sm:hidden" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect width="16" height="16" rx="8" fill="#2A3650"/>
                  <path d="M3.80464 6.47404C3.54429 6.73438 3.54429 7.15651 3.80464 7.41685L7.0661 10.6751C7.5869 11.1954 8.43077 11.1952 8.9513 10.6747L12.2115 7.41445C12.4719 7.15411 12.4719 6.73198 12.2115 6.47163C11.9512 6.21128 11.529 6.21128 11.2687 6.47163L8.4783 9.26205C8.21797 9.52245 7.79583 9.52238 7.5355 9.26205L4.74745 6.47404C4.4871 6.21369 4.06499 6.21369 3.80464 6.47404Z" fill="white"/>
                </svg>
              </p>
              <ul className="hidden group-[.active]:flex sm:flex md:flex flex-col gap-2 mt-2 sm:mt-3.5 lg:mt-0">
                <li className="flex">
                  <Link href="/blog" className="text-xs lg:text-base text-gray-300 transition hover:text-blue-500">Блог</Link>
                </li>
                <li className="flex">
                  <Link href="/about" className="text-xs lg:text-base text-gray-300 transition hover:text-blue-500">О сервисе</Link>
                </li>
                <li className="flex">
                  <Link href="/plans" className="text-xs lg:text-base text-gray-300 transition hover:text-blue-500">Тарифы</Link>
                </li>
              </ul>
            </div>
            <div className="footer-item group">
              <p className="text-base lg:text-lg text-white font-semibold lg:mb-4 flex cursor-pointer sm:cursor-text items-center justify-between sm:block">
                Консультация с ИИ
                <svg className="group-[.active]:rotate-180 block sm:hidden" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect width="16" height="16" rx="8" fill="#2A3650"/>
                  <path d="M3.80464 6.47404C3.54429 6.73438 3.54429 7.15651 3.80464 7.41685L7.0661 10.6751C7.5869 11.1954 8.43077 11.1952 8.9513 10.6747L12.2115 7.41445C12.4719 7.15411 12.4719 6.73198 12.2115 6.47163C11.9512 6.21128 11.529 6.21128 11.2687 6.47163L8.4783 9.26205C8.21797 9.52245 7.79583 9.52238 7.5355 9.26205L4.74745 6.47404C4.4871 6.21369 4.06499 6.21369 3.80464 6.47404Z" fill="white"/>
                </svg>
              </p>
              <ul className="hidden group-[.active]:flex sm:flex md:flex flex-col gap-2 mt-2 sm:mt-3.5 lg:mt-0">
                {doctors && doctors.length > 0 ? (
                  doctors.map((doctor) => (
                    <li key={doctor.id} className="flex">
                      <Link 
                        href={`/doctor/${doctor.slug || doctor.id}`} 
                        className="text-xs lg:text-base text-gray-300 transition hover:text-blue-500"
                      >
                        {doctor.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex">
                      <Link href="/doctor/uro-doc" className="text-xs lg:text-base text-gray-300 transition hover:text-blue-500">Консультация с урологом</Link>
                    </li>
                    <li className="flex">
                      <Link href="/doctor/gastro-doc" className="text-xs lg:text-base text-gray-300 transition hover:text-blue-500">Гастроэнтеролог</Link>
                    </li>
                    <li className="flex">
                      <Link href="/doctor/gen-doc" className="text-xs lg:text-base text-gray-300 transition hover:text-blue-500">ИИ терапевт</Link>
                    </li>
                    <li className="flex">
                      <Link href="/doctor/cardio-doc" className="text-xs lg:text-base text-gray-300 transition hover:text-blue-500">Кардиолог</Link>
                    </li>
                    <li className="flex">
                      <Link href="/doctor/neuro-doc" className="text-xs lg:text-base text-gray-300 transition hover:text-blue-500">Невролог</Link>
                    </li>
                    <li className="flex">
                      <Link href="/doctor/endo-doc" className="text-xs lg:text-base text-gray-300 transition hover:text-blue-500">Эндокринолог</Link>
                    </li>
                    <li className="flex">
                      <Link href="/doctor/derm-doc" className="text-xs lg:text-base text-gray-300 transition hover:text-blue-500">Дерматолог</Link>
                    </li>
                    <li className="flex">
                      <Link href="/doctor/psych-doc" className="text-xs lg:text-base text-gray-300 transition hover:text-blue-500">Психиатр</Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
            <div className="footer-item group">
              <p className="text-base lg:text-lg text-white font-semibold lg:mb-4 flex cursor-pointer sm:cursor-text items-center justify-between sm:block">
                Документы
                <svg className="group-[.active]:rotate-180 block sm:hidden" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect width="16" height="16" rx="8" fill="#2A3650"/>
                  <path d="M3.80464 6.47404C3.54429 6.73438 3.54429 7.15651 3.80464 7.41685L7.0661 10.6751C7.5869 11.1954 8.43077 11.1952 8.9513 10.6747L12.2115 7.41445C12.4719 7.15411 12.4719 6.73198 12.2115 6.47163C11.9512 6.21128 11.529 6.21128 11.2687 6.47163L8.4783 9.26205C8.21797 9.52245 7.79583 9.52238 7.5355 9.26205L4.74745 6.47404C4.4871 6.21369 4.06499 6.21369 3.80464 6.47404Z" fill="white"/>
                </svg>
              </p>
              <ul className="hidden group-[.active]:flex sm:flex md:flex flex-col gap-2 mt-2 sm:mt-3.5 lg:mt-0">
                <li className="flex">
                  <Link href="/policy" className="text-xs lg:text-base text-gray-300 transition hover:text-blue-500">Политика конфиденциальности</Link>
                </li>
                <li className="flex">
                  <Link href="/rules" className="text-xs lg:text-base text-gray-300 transition hover:text-blue-500">Условия использования</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 md:pt-11 border-t border-solid border-gray-700">
          <p className="mx-auto text-left md:text-center max-w-190.5 w-full text-xs leading-4.5 text-gray-400">
            Внимание: Сервис МедАссистент предоставляет исключительно информационные услуги и не является заменой консультации с квалифицированным медицинским специалистом. Информация, предоставляемая сервисом, не является медицинской консультацией или диагнозом. Для получения медицинской помощи и конкретных рекомендаций по лечению обязательно обратитесь к врачу.
          </p>
          <p className="mt-7.5 md:mt-11 text-white md:text-center text-sm leading-6 md:text-base">© 2026 МедАссистент. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;