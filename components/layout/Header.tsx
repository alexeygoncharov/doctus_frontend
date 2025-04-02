import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { AvatarContext } from '@/pages/_app'; // Keep if used for UI interactions elsewhere
import { getBackendUrl } from '@/lib/api'; // Keep if used elsewhere
import { getDoctors } from '@/lib/api';
import { Doctor, mapApiDoctorToUi } from '@/lib/doctors';
// import { useAuth } from '@/lib/auth-context'; // Use useSession instead for auth state
import { useSession, signOut } from 'next-auth/react'; // Import useSession and signOut

const Header: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession(); // Get session data and status
  const isLoading = status === 'loading';
  const isLoggedIn = status === 'authenticated';
  const user = session?.user; // User object from session

  // State for UI elements
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // State for avatar URL
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  
  // Load avatar from localStorage on first render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAvatar = localStorage.getItem('userAvatar');
      if (storedAvatar) {
        setLocalAvatarUrl(storedAvatar);
      }
    }
  }, []);
  
  // Update local avatar if user avatar changes in session
  useEffect(() => {
    if (user?.avatar) {
      setLocalAvatarUrl(user.avatar);
    }
  }, [user?.avatar]);

  // Load doctors (keep as is)
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

  // Sticky header logic (keep as is)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => {
        setIsSticky(window.scrollY > 0);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prevState => !prevState);
  };

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
    };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  // Logout function using signOut
  const handleLogout = () => {
      signOut({ callbackUrl: '/auth/login' });
  };

  // Determine the avatar URL from session, localStorage or fallback
  // Use getBackendUrl to handle relative paths if necessary
  const currentAvatarUrl = user?.avatar 
    ? getBackendUrl(user.avatar) 
    : localAvatarUrl 
      ? getBackendUrl(localAvatarUrl)
      : null;
  
  console.log('==== ОТЛАДКА АВАТАР В ХЕДЕРЕ ====');
  console.log('user?.avatar в хедере:', user?.avatar);
  console.log('localAvatarUrl в хедере:', localAvatarUrl);
  console.log('currentAvatarUrl в хедере:', currentAvatarUrl);
  console.log('==== КОНЕЦ ОТЛАДКИ АВАТАРА В ХЕДЕРЕ ====');

  return (
    <header className={`bg-white px-4 ${isSticky ? 'sticky top-0 z-50 shadow-md transition-all' : ''}`}>
      <div className="max-w-320 w-full mx-auto">
        <nav className="flex items-center justify-between py-3.5 sm:py-4 gap-2" aria-label="Global">
          {/* Logo */}
          <div className="flex flex-1 lg:flex-initial">
            <Link href="/" className="flex flex-row items-center gap-1.5 lg:gap-2 header-logo min-w-0 lg:min-w-52">
              <Image className="h-6 sm:h-7.5 lg:h-8 w-auto basis-1/3" src="/img/logo.svg" alt="Logo" width={32} height={32} />
              <span className="text-lg sm:text-xl lg:text-2xl">МедАссистент</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex lg:gap-x-2 xl:max-w-135 max-w-110 w-full justify-between">
             {/* Consultation Dropdown */}
             <li className="has-child relative group/items">
               <Link href="#" className="text-sm xl:text-base py-2 font-medium text-[#1B1B1B] group-hover/items:text-blue-500 transition flex items-center gap-x-2">
                 Консультация
                 {/* SVG Chevron Down */}
                 <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" className="fill-[#1B1B1B] group-hover/items:fill-blue-500 transition">
                   <path d="M4.48091 6.97379C4.22056 7.23413 4.22056 7.65627 4.48091 7.9166L7.74237 11.1749C8.26317 11.6951 9.10704 11.6949 9.62757 11.1745L12.8878 7.9142C13.1482 7.65387 13.1482 7.23173 12.8878 6.97139C12.6274 6.71103 12.2053 6.71103 11.945 6.97139L9.15457 9.7618C8.89424 10.0222 8.4721 10.0221 8.21177 9.7618L5.42372 6.97379C5.16337 6.71344 4.74126 6.71344 4.48091 6.97379Z"/>
                 </svg>
               </Link>
               <ul className="absolute left-1/2 -translate-x-1/2 z-10 w-fit text-nowrap rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-hidden opacity-0 invisible group-hover/items:opacity-100 group-hover/items:visible transition-all">
                 {doctors.length > 0 ? (
                   doctors.map((doctor) => (
                     <li key={doctor.id}>
                       <Link
                         href={`/doctor/${doctor.slug || doctor.id}`}
                         className="text-sm xl:text-base block px-4 py-2 text-sm text-[#1B1B1B] hover:text-blue-500 transition"
                       >
                         {doctor.name}
                       </Link>
                     </li>
                   ))
                 ) : (
                   <li><Link href="/consult" className="text-sm xl:text-base block px-4 py-2 text-sm text-[#1B1B1B] hover:text-blue-500 transition">Все специалисты</Link></li>
                 )}
               </ul>
             </li>
             {/* Other Links */}
            <li className="flex items-center">
              <Link
                href="/analysis"
                className={`text-sm xl:text-base py-2 font-medium hover:text-blue-500 transition ${
                  router.pathname === '/analysis' ? 'text-blue-500' : 'text-[#1B1B1B]'
                }`}
              >
                Расшифровка
              </Link>
            </li>
            <li className="flex items-center">
               <Link
                 href="/plans"
                 className={`text-sm xl:text-base py-2 font-medium hover:text-blue-500 transition ${
                   router.pathname === '/plans' ? 'text-blue-500' : 'text-[#1B1B1B]'
                 }`}
               >
                 Тарифы
               </Link>
             </li>
            <li className="flex items-center">
               <Link
                 href="/about"
                 className={`text-sm xl:text-base py-2 font-medium hover:text-blue-500 transition ${
                   router.pathname === '/about' ? 'text-blue-500' : 'text-[#1B1B1B]'
                 }`}
               >
                 О сервисе
               </Link>
             </li>
             <li className="flex items-center">
               <Link
                 href="/blog"
                 className={`text-sm xl:text-base py-2 font-medium hover:text-blue-500 transition ${
                   router.pathname === '/blog' || router.pathname.startsWith('/blog/') ? 'text-blue-500' : 'text-[#1B1B1B]'
                 }`}
               >
                 Блог
               </Link>
             </li>
          </ul>

          {/* Mobile Auth Buttons (Not Logged In) */}
          {!isLoading && !isLoggedIn && (
            <div className="lg:hidden flex items-center gap-1.5 mr-2">
              <Link
                href="/auth/login"
                className="flex items-center gap-1 text-xs border border-blue-500 text-gray-800 py-1.5 px-2 rounded-md hover:bg-blue-50 transition"
              >
                <span className="text-xs">Войти</span>
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center gap-1 text-xs bg-blue-500 text-white py-1.5 px-2 rounded-md hover:bg-blue-600 transition"
              >
                <span className="text-xs">Регистрация</span>
              </Link>
            </div>
          )}

          {/* Desktop Auth/Premium Buttons */}
          {!isLoading && !isLoggedIn ? (
            // Show Login/Register buttons if not logged in
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 xl:gap-2.5 border border-blue-500 text-gray-800 py-3.5 px-3 xl:px-6 rounded-md hover:bg-blue-50 transition"
              >
                 {/* SVG Login Icon */}
                 <span aria-hidden="true">
                   <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                     <path d="M8.83813 8.5C10.6711 8.5 12.1548 7.01639 12.1548 5.18342C12.1548 3.35045 10.6711 1.86684 8.83813 1.86684C7.00517 1.86684 5.52148 3.35045 5.52148 5.18342C5.52148 7.01639 7.00517 8.5 8.83813 8.5Z" stroke="#3B82F6" strokeWidth="1.4"/>
                     <path d="M2.83813 14.5C2.83813 11.8824 5.53789 9.75 8.83813 9.75C12.1384 9.75 14.8381 11.8824 14.8381 14.5" stroke="#3B82F6" strokeWidth="1.4" strokeLinecap="round"/>
                   </svg>
                 </span>
                 <span className="text-sm">Войти</span>
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center gap-1.5 xl:gap-2.5 bg-blue-500 text-white py-3.5 px-3 xl:px-6 rounded-md hover:bg-blue-600 transition"
              >
                 {/* SVG Register Icon */}
                 <span aria-hidden="true">
                   <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                     <path d="M6.83813 8.5H10.8381" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                     <path d="M8.83813 6.5V10.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                     <path d="M2.83813 8.5C2.83813 3.559 3.89713 2.5 8.83813 2.5C13.7791 2.5 14.8381 3.559 14.8381 8.5C14.8381 13.441 13.7791 14.5 8.83813 14.5C3.89713 14.5 2.83813 13.441 2.83813 8.5Z" stroke="white" strokeWidth="1.4"/>
                   </svg>
                 </span>
                 <span className="text-sm">Регистрация</span>
              </Link>
            </div>
           ) : !isLoading && isLoggedIn ? (
            // Show Premium button if logged in
            <Link
              href="/plans"
              className="hidden lg:flex items-center gap-1.5 xl:gap-2.5 bg-blue-500 text-white py-3.5 px-3 xl:px-6 rounded-md hover:bg-blue-600 transition"
            >
              {/* SVG Premium Icon */}
              <span aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                  <path d="M8.83813 2.5L10.8548 6.58L15.3381 7.345L12.0881 10.52L12.8714 15.0L8.83813 12.905L4.80479 15.0L5.58813 10.52L2.33813 7.345L6.82146 6.58L8.83813 2.5Z" stroke="white" strokeWidth="1.4"/>
                </svg>
              </span>
              <span className="text-sm">Доступ к 20+ докторам</span>
            </Link>
          ) : (
              // Placeholder while loading
              <div className="hidden lg:flex h-[50px] w-[200px]"></div>
          )}

          {/* Hamburger Menu Button (Mobile) */}
          <button
            className="lg:hidden flex items-center justify-center ml-auto"
            onClick={toggleMobileMenu}
            aria-label="Меню"
          >
             {/* SVG Hamburger Icon */}
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <line x1="4" y1="12" x2="20" y2="12"></line>
               <line x1="4" y1="6" x2="20" y2="6"></line>
               <line x1="4" y1="18" x2="20" y2="18"></line>
             </svg>
          </button>

          {/* Mobile Menu Panel */}
          {isMobileMenuOpen && (
             <div className="fixed inset-0 z-50 lg:hidden">
               <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={toggleMobileMenu}></div>
               <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl overflow-y-auto"> {/* Added overflow-y-auto */}
                 {/* Mobile Menu Header */}
                 <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                     <h2 className="text-xl font-medium">Меню</h2>
                     <button onClick={toggleMobileMenu} className="rounded-full p-1 hover:bg-gray-100">
                       {/* SVG Close Icon */}
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                         <line x1="18" y1="6" x2="6" y2="18"></line>
                         <line x1="6" y1="6" x2="18" y2="18"></line>
                       </svg>
                     </button>
                 </div>
                 {/* Mobile Menu Links */}
                  <div className="py-4 px-5">
                    <ul className="space-y-4">
                      <li>
                        <Link href="#" className="block font-medium text-base hover:text-blue-500 transition">
                          Консультация
                        </Link>
                        <ul className="pl-4 mt-2 space-y-2">
                          {doctors.length > 0 ? (
                            doctors.map((doctor) => (
                              <li key={doctor.id}>
                                <Link
                                  href={`/doctor/${doctor.slug || doctor.id}`}
                                  className="block text-sm hover:text-blue-500 transition"
                                >
                                  {doctor.name}
                                </Link>
                              </li>
                            ))
                          ) : (
                            <li><Link href="/consult" className="block text-sm hover:text-blue-500 transition">Все специалисты</Link></li>
                          )}
                        </ul>
                      </li>
                      <li>
                        <Link
                          href="/analysis"
                          className={`block font-medium text-base hover:text-blue-500 transition ${
                            router.pathname === '/analysis' ? 'text-blue-500' : ''
                          }`}
                        >
                          Расшифровка анализов
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/plans"
                          className={`block font-medium text-base hover:text-blue-500 transition ${
                            router.pathname === '/plans' ? 'text-blue-500' : ''
                          }`}
                        >
                          Тарифы
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/about"
                          className={`block font-medium text-base hover:text-blue-500 transition ${
                            router.pathname === '/about' ? 'text-blue-500' : ''
                          }`}
                        >
                          О сервисе
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/blog"
                          className={`block font-medium text-base hover:text-blue-500 transition ${
                            router.pathname === '/blog' || router.pathname.startsWith('/blog/') ? 'text-blue-500' : ''
                          }`}
                        >
                          Блог
                        </Link>
                      </li>
                    </ul>
                  </div>
                 {/* Mobile Menu Auth Footer (Not Logged In) */}
                 {!isLoading && !isLoggedIn && (
                   <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-gray-200 bg-white"> {/* Added bg-white */}
                     <div className="flex flex-col space-y-2">
                       <Link href="/auth/login" className="flex items-center justify-center gap-1.5 w-full border border-blue-500 text-gray-800 py-3 rounded-md hover:bg-blue-50 transition text-sm">Войти</Link>
                       <Link href="/auth/register" className="flex items-center justify-center gap-1.5 w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition text-sm">Регистрация</Link>
                     </div>
                   </div>
                 )}
               </div>
             </div>
           )}

          {/* User Profile Dropdown (Logged In) */}
          {!isLoading && isLoggedIn && (
            <div className="group/profile flex items-center gap-2 bg-blue-50 sm:bg-white pr-3 sm:pr-0 rounded-2xl sm:rounded-none relative">
              <Link href="/settings" className="flex items-center gap-2">
                <div className="size-8.5 min-w-8.5 sm:size-12 sm:min-w-12 rounded-full overflow-hidden">
                  {currentAvatarUrl ? (
                    <Image
                      src={currentAvatarUrl}
                      alt={user?.name || 'Пользователь'}
                      className="object-cover size-full rounded-full"
                      width={48}
                      height={48}
                      // Basic error handling for broken image links
                      onError={(e) => { console.error('Avatar image load error:', e.currentTarget.src); e.currentTarget.style.display = 'none'; /* Hide broken image */ }}
                    />
                  ) : (
                    // Fallback initials
                    <div className="size-full bg-blue-100 flex items-center justify-center text-blue-500 rounded-full">
                      {user?.name?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="hidden sm:flex flex-col gap-0.25">
                  <p className="font-medium text-sm">{user?.name || user?.email || 'Пользователь'}</p> {/* Show email if name is missing */}
                  <span className="text-xs text-[#64748B]">{user?.email}</span>
                </div>
              </Link>
              {/* Dropdown Arrow */}
              <span className="flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 size-4 cursor-pointer transition">
                 <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none">
                   <path d="M0.80464 0.973794C0.544287 1.23413 0.544287 1.65627 0.80464 1.9166L4.0661 5.17487C4.5869 5.69514 5.43077 5.69493 5.9513 5.17447L9.2115 1.9142C9.4719 1.65387 9.4719 1.23173 9.2115 0.971388C8.95117 0.711035 8.52903 0.711035 8.2687 0.971388L5.4783 3.7618C5.21797 4.0222 4.79583 4.02213 4.5355 3.7618L1.74745 0.973794C1.4871 0.713441 1.06499 0.713441 0.80464 0.973794Z" fill="#363748"/>
                 </svg>
              </span>
              {/* Profile Dropdown Menu */}
              <ul className="absolute top-full mt-2 right-0 opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all rounded-md bg-white ring-1 shadow-lg ring-black/5 duration-300 z-20" id="profile-menu"> {/* Added z-20 */}
                  {/* Profile Link */}
                  <li className="px-1 border-b border-solid border-slate-200/60 pt-1">
                    <Link href="/settings" className="flex items-center w-48 group transition text-slate-600 hover:text-blue-500 text-sm py-1.5 px-2 gap-x-2">
                       {/* SVG Profile Icon */}
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="stroke-slate-600 transition group-hover:stroke-blue-500">
                         <g clipPath="url(#clip0_5_4377)"><path d="M12.6663 14V12.6667C12.6663 11.9594 12.3854 11.2811 11.8853 10.781C11.3852 10.281 10.7069 10 9.99967 10H5.99967C5.29243 10 4.61415 10.281 4.11406 10.781C3.61396 11.2811 3.33301 11.9594 3.33301 12.6667V14" strokeWidth="0.666667" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.99967 7.33333C9.47243 7.33333 10.6663 6.13943 10.6663 4.66667C10.6663 3.19391 9.47243 2 7.99967 2C6.52692 2 5.33301 3.19391 5.33301 4.66667C5.33301 6.13943 6.52692 7.33333 7.99967 7.33333Z" strokeWidth="0.666667" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_5_4377"><rect width="16" height="16" fill="white"/></clipPath></defs>
                       </svg>
                       Профиль
                    </Link>
                  </li>
                   {/* Premium Link */}
                  <li className="px-1 border-b border-solid border-slate-200/60">
                    <Link href="/plans" className="flex items-center w-48 group transition text-slate-600 hover:text-blue-500 text-sm py-1.5 px-2 gap-x-2">
                       {/* SVG Premium Icon */}
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="stroke-slate-600 transition group-hover:stroke-blue-500">
                         <g clipPath="url(#clip0_5_4384)"><path d="M8.33366 14.6667H12.0003C12.3539 14.6667 12.6931 14.5262 12.9431 14.2762C13.1932 14.0261 13.3337 13.687 13.3337 13.3334V4.66671L10.0003 1.33337H4.00033C3.6467 1.33337 3.30756 1.47385 3.05752 1.7239C2.80747 1.97395 2.66699 2.31309 2.66699 2.66671V9.00004" strokeWidth="0.666667" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.33301 1.33337V4.00004C9.33301 4.35366 9.47348 4.6928 9.72353 4.94285C9.97358 5.1929 10.3127 5.33337 10.6663 5.33337H13.333" strokeWidth="0.666667" strokeLinecap="round" strokeLinejoin="round"/><path d="M8.91833 10.4173C9.04982 10.2858 9.15413 10.1297 9.2253 9.95789C9.29646 9.78609 9.33309 9.60194 9.33309 9.41598C9.33309 9.23001 9.29646 9.04587 9.2253 8.87406C9.15413 8.70225 9.04982 8.54614 8.91833 8.41464C8.78683 8.28315 8.63072 8.17884 8.45891 8.10767C8.2871 8.03651 8.10296 7.99988 7.91699 7.99988C7.73103 7.99988 7.54688 8.03651 7.37507 8.10767C7.20327 8.17884 7.04716 8.28315 6.91566 8.41464L3.57566 11.756C3.41716 11.9144 3.30114 12.1102 3.23833 12.3253L2.68033 14.2386C2.66359 14.296 2.66259 14.3568 2.67742 14.4147C2.69225 14.4726 2.72237 14.5254 2.76462 14.5677C2.80688 14.6099 2.85971 14.6401 2.9176 14.6549C2.97548 14.6697 3.03629 14.6687 3.09366 14.652L5.00699 14.094C5.2221 14.0312 5.41791 13.9151 5.57633 13.7566L8.91833 10.4173Z" strokeWidth="0.666667" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_5_4384"><rect width="16" height="16" fill="white"/></clipPath></defs>
                       </svg>
                       Premium подписка
                    </Link>
                  </li>
                   {/* Removed Password Reset and Help links as they pointed to # */}
                  {/* Logout Button */}
                  <li className="px-1 pt-1 pb-1"> {/* Removed border-t */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-48 group transition text-slate-600 hover:text-blue-500 text-sm py-1.5 px-2 gap-x-2"
                    >
                      {/* SVG Logout Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="stroke-slate-600 transition group-hover:stroke-blue-500">
                       <g clipPath="url(#clip0_5_4407)"><path d="M10.6663 4H5.33301C3.12387 4 1.33301 5.79086 1.33301 8C1.33301 10.2091 3.12387 12 5.33301 12H10.6663C12.8755 12 14.6663 10.2091 14.6663 8C14.6663 5.79086 12.8755 4 10.6663 4Z" strokeWidth="0.666667" strokeLinecap="round" strokeLinejoin="round"/><path d="M10.6663 9.33329C11.4027 9.33329 11.9997 8.73634 11.9997 7.99996C11.9997 7.26358 11.4027 6.66663 10.6663 6.66663C9.92996 6.66663 9.33301 7.26358 9.33301 7.99996C9.33301 8.73634 9.92996 9.33329 10.6663 9.33329Z" strokeWidth="0.666667" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_5_4407"><rect width="16" height="16" fill="white"/></clipPath></defs>
                       </svg>
                       Выйти
                    </button>
                  </li>
                </ul>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
