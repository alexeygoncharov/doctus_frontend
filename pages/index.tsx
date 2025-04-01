import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { DoctorChat } from '../components/chat/doctor-chat';
import { getBlogPosts, formatDate, getImageUrl, getPostExcerpt, getResponsiveImageUrl } from '@/lib/blog';
import { BlogPost } from '@/lib/blog';

const BlogCardPreview = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/blog');
        
        if (!response.ok) {
          throw new Error(`Error fetching blog posts: ${response.statusText}`);
        }
        
        const data = await response.json();
        // Only show the latest 3 posts
        setPosts(data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching blog posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <>
        {[1, 2, 3].map(i => (
          <div key={i} className="flex flex-col animate-pulse">
            <div className="rounded-xl bg-gray-200 h-[213px]"></div>
            <div className="mt-3.5 h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="mt-2 h-4 bg-gray-200 rounded w-full"></div>
            <div className="mt-1 h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="mt-2 h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="col-span-3 text-center py-8">
        Статьи отсутствуют в данный момент. Загляните позже.
      </div>
    );
  }

  return (
    <>
      {posts.map((post) => (
        <Link key={post.id} href={`/blog/${post.id}`} className="flex flex-col group">
          <div className="rounded-xl overflow-hidden md:min-h-[213px] relative h-[213px]">
            <Image 
              className="w-full h-full object-cover transition duration-400 group-hover:scale-110" 
              src={getResponsiveImageUrl(post, 600)}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px"
              quality={80}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzY4IiBoZWlnaHQ9IjQzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
              priority={post.id <= 3} // Prioritize loading for first 3 images
            />
          </div>
          <p className="text-xl font-semibold leading-[24px] mt-3.5 mb-2 transition group-hover:text-blue-500">
            {post.title}
          </p>
          <p className="grow text-sm text-gray-500">
            {getPostExcerpt(post, 100)}
          </p>
          <span className="mt-2 text-xs text-[#B5B9C0]">
            {formatDate(post.created_at)}
          </span>
        </Link>
      ))}
    </>
  );
};

export default function Home() {
  const handleAccordionAnimation = () => {
    // Добавление скрипта для анимации аккордеонов
    if (typeof window !== 'undefined') {
      const detailsElements = document.querySelectorAll('details');
      
      detailsElements.forEach(detail => {
        const summary = detail.querySelector('summary');
        const content = detail.querySelector('div');
        
        if (summary && content) {
          // Начальные стили для закрытых элементов
          if (!detail.hasAttribute('open')) {
            content.style.maxHeight = '0px';
            content.style.opacity = '0';
          } else {
            content.style.maxHeight = `${content.scrollHeight}px`;
            content.style.opacity = '1';
          }
          
          // Обработчик события toggle
          detail.addEventListener('toggle', () => {
            // Если открыт - применяем стили для открытого состояния
            if (detail.hasAttribute('open')) {
              // Закрываем все остальные аккордеоны
              detailsElements.forEach(otherDetail => {
                if (otherDetail !== detail && otherDetail.hasAttribute('open')) {
                  const otherContent = otherDetail.querySelector('div');
                  if (otherContent) {
                    otherContent.style.maxHeight = '0px';
                    otherContent.style.opacity = '0';
                    
                    setTimeout(() => {
                      otherDetail.removeAttribute('open');
                    }, 300);
                  }
                }
              });
              
              // Установка высоты для текущего элемента
              setTimeout(() => {
                content.style.maxHeight = `${content.scrollHeight}px`;
                content.style.opacity = '1';
              }, 10);
            } else {
              // Если закрыт - применяем стили для закрытого состояния
              content.style.maxHeight = '0px';
              content.style.opacity = '0';
            }
          });
        }
      });
    }
  };
  
  // Запускаем скрипт после загрузки страницы
  useEffect(() => {
    setTimeout(handleAccordionAnimation, 100);
  }, []);

  return (
    <>
      <Head>
        <title>Онлайн консультация ИИ доктора</title>
        <meta name="description" content="Онлайн консультация ИИ доктора - задайте вопрос, загрузите анализы и фото, получите рекомендации" />
      </Head>

      <section className="px-0 md:px-2">
        <div className="pt-6 md:pt-15 pb-10 md:pb-20 px-4 md:rounded-2xl lg:rounded-5 bg-linear-to-b from-[#EAF1FC] to-slate-50">
          <div className="max-w-320 mx-auto flex flex-col gap-y-6 md:gap-y-8 lg:gap-y-10 items-center">
            <div className="bg-white flex items-center gap-4 md:gap-1 rounded-3xl py-2 px-4 md:px-5 max-w-64.5 md:max-w-full">
              <Image src="/img/icons/stars.svg" alt="Start" width={24} height={24} />
              <span className="text-xs md:text-sm">Интеллектуальный анализ медицинских показателей с поддержкой ИИ</span>
            </div>
            <h1 className="text-center text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold max-w-227.5">Онлайн консультация <br /> ИИ доктора</h1>
            <p className="text-center max-w-227.5 text-sm sm:text-base md:text-lg lg:text-[21px] lg:-md-4 lg:-mt-5">Задайте вопрос ИИ доктору, загрузите ваши анализы, фото и получите подробную расшифровку с рекомендациями от искусственного интеллекта</p>
            <div className="flex items-center max-w-105.5 py-1 pl-1 pr-5 sm:pr-7 bg-[#DFEBFB] rounded-[72px] gap-3.5 sm:gap-5">
              <div className="flex items-center rounded-[72px] bg-white px-4.5 py-1 sm:py-1.5 gap-2.5">
                <span className="font-semibold text-base sm:text-xl leading-relaxed">5.0</span>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <img alt="Star" loading="lazy" width="20" height="20" decoding="async" data-nimg="1" className="w-3.5 sm:w-5" src="/icons/icon-star.svg" style={{ color: 'transparent' }} />
                  <img alt="Star" loading="lazy" width="20" height="20" decoding="async" data-nimg="1" className="w-3.5 sm:w-5" src="/icons/icon-star.svg" style={{ color: 'transparent' }} />
                  <img alt="Star" loading="lazy" width="20" height="20" decoding="async" data-nimg="1" className="w-3.5 sm:w-5" src="/icons/icon-star.svg" style={{ color: 'transparent' }} />
                  <img alt="Star" loading="lazy" width="20" height="20" decoding="async" data-nimg="1" className="w-3.5 sm:w-5" src="/icons/icon-star.svg" style={{ color: 'transparent' }} />
                  <img alt="Star" loading="lazy" width="20" height="20" decoding="async" data-nimg="1" className="w-3.5 sm:w-5" src="/icons/icon-star.svg" style={{ color: 'transparent' }} />
                </div>
              </div>
              <p className="text-[13px] sm:text-[15px] font-medium">2000+ пользователей</p>
            </div>
            <div className="w-full mt-1 md:mt-2 lg:pb-10">
              <DoctorChat />
            </div>
          </div>
        </div>
      </section>

      <section className="pb-10 sm:pb-15 md:pb-12 lg:py-15 px-4">
        <div className="max-w-320 mx-auto flex flex-col gap-y-6 md:gap-y-8 lg:gap-y-10 items-center">
          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[44px] lg:leading-[60px] font-semibold text-center pl-3 pr-3 text-headerText">Как ИИ гастроэнтеролог может помочь?</h2>
          <div className="flex flex-col gap-6 lg-gap-10 w-full">
            <div className="flex flex-col-reverse lg:flex-row lg:even:flex-row-reverse lg:items-center justify-between gap-3.5 lg:gap-6">
              <div className="lg:max-w-131">
                <p className="text-lg md:text-[28px] leading-[32px] font-semibold mb-2 lg:mb-4">Медицинская экспертиза</p>
                <p className="text-gray-600 text-sm md:text-base">Получите точную и надежную медицинскую информацию по различным вопросам здоровья. Наш ИИ-терапевт обладает обширными знаниями и предоставляет персонализированные рекомендации с учетом ваших конкретных симптомов и состояния.</p>
              </div>
              <div className="w-full max-w-full lg:max-w-150 w-full flex rounded-xl overflow-hidden">
                <Image src="/img/consult1.jpg" alt="Фото" className="w-full h-auto" width={500} height={300} />
              </div>
            </div>
            <div className="flex flex-col-reverse lg:flex-row lg:even:flex-row-reverse lg:items-center justify-between gap-3.5 lg:gap-6">
              <div className="lg:max-w-131">
                <p className="text-lg md:text-[28px] leading-[32px] font-semibold mb-2 lg:mb-4">Анализ медицинских документов</p>
                <p className="text-gray-600 text-sm md:text-base">Нужна помощь в расшифровке результатов анализов или медицинских заключений? Наш ИИ-терапевт поможет вам разобраться в медицинской документации, объяснит значение показателей и предоставит понятные комментарии.</p>
              </div>
              <div className="w-full max-w-full lg:max-w-150 w-full flex rounded-xl overflow-hidden">
                <Image src="/img/consult2.jpg" alt="Фото" className="w-full h-auto" width={500} height={300} />
              </div>
            </div>
            <div className="flex flex-col-reverse lg:flex-row lg:even:flex-row-reverse lg:items-center justify-between gap-3.5 lg:gap-6">
              <div className="lg:max-w-131">
                <p className="text-lg md:text-[28px] leading-[32px] font-semibold mb-2 lg:mb-4">Медицинские исследования</p>
                <p className="text-gray-600 text-sm md:text-base">Получите доступ к актуальной медицинской информации! Наш ИИ- терапевт использует обширную базу медицинских знаний, включая последние исследования, протоколы лечения и рекомендации для предоставления точных и современных медицинских консультаций.</p>
              </div>
              <div className="w-full max-w-full lg:max-w-150 w-full flex rounded-xl overflow-hidden">
                <Image src="/img/consult3.jpg" alt="Фото" className="w-full h-auto" width={500} height={300} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-10 sm:pb-15 md:pb-12 lg:py-15 px-4" id="capabilities">
        <div className="max-w-320 mx-auto flex flex-col gap-y-6 md:gap-y-8 lg:gap-y-10 items-center">
          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[44px] lg:leading-[60px] font-semibold text-center pl-3 pr-3 text-headerText">Наши возможности</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3.5 w-full">
            <div className="bg-white rounded-xl shadow-sm py-4 px-6 sm:p-6">
              <Image src="/img/icons/possibility1.svg" alt="Доступность 24/7" width={48} height={48} />
              <p className="my-2 sm:my-3.5 text-base sm:text-lg font-semibold">Доступность 24/7</p>
              <p className="text-sm sm:text-base text-gray-600 max-w-80">Получайте медицинские консультации <br /> в любое время суток, без очередей и ожидания</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Image src="/img/icons/possibility2.svg" alt="Точность анализа" width={48} height={48} />
              <p className="my-2 sm:my-3.5 text-base sm:text-lg font-semibold">Точность анализа</p>
              <p className="text-sm sm:text-base text-gray-600 max-w-80">Используем передовые алгоритмы ИИ для обеспечения высокой точности медицинских рекомендаций</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Image src="/img/icons/possibility3.svg" alt="Персонализация" width={48} height={48} />
              <p className="my-2 sm:my-3.5 text-base sm:text-lg font-semibold">Персонализация</p>
              <p className="text-sm sm:text-base text-gray-600 max-w-80">Индивидуальный подход к каждому пациенту с учетом личной медицинской истории</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Image src="/img/icons/possibility1.svg" alt="Доступность 24/7" width={48} height={48} />
              <p className="my-2 sm:my-3.5 text-base sm:text-lg font-semibold">Доступность 24/7</p>
              <p className="text-sm sm:text-base text-gray-600 max-w-80">Получайте медицинские консультации <br /> в любое время суток, без очередей и ожидания</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Image src="/img/icons/possibility2.svg" alt="Точность анализа" width={48} height={48} />
              <p className="my-2 sm:my-3.5 text-base sm:text-lg font-semibold">Точность анализа</p>
              <p className="text-sm sm:text-base text-gray-600 max-w-80">Используем передовые алгоритмы ИИ для обеспечения высокой точности медицинских рекомендаций</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Image src="/img/icons/possibility3.svg" alt="Персонализация" width={48} height={48} />
              <p className="my-2 sm:my-3.5 text-base sm:text-lg font-semibold">Персонализация</p>
              <p className="text-sm sm:text-base text-gray-600 max-w-80">Индивидуальный подход к каждому пациенту с учетом личной медицинской истории</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-10 sm:pb-15 md:pb-12 lg:py-15 px-4">
        <div className="max-w-320 mx-auto">
          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[44px] lg:leading-[60px] font-semibold text-center pl-3 pr-3 text-headerText">Наши ИИ доктора</h2>
          <p className="mx-auto mt-3.5 sm:mt-1 text-sm md:text-base lg:text-lg text-center">Наши AI-ассистенты специализируются в разных областях медицины <br /> и доступны для консультации 24/7.</p>
          <div className="flex overflow-x-auto lg:flex-none lg:grid lg:grid-cols-4 gap-3.5 mt-2.5 lg:mt-10 py-1 lg:py-0">
            <div className="bg-white rounded-lg min-w-[261px] lg:min-w-0 p-3.5 lg:p-6 flex flex-col gap-3.5 items-center shadow-sm">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden relative">
                  <Image src="/img/doc1.jpg" alt="Кардиолог" className="w-full h-full object-cover" width={112} height={112} />
                </div>
                <span className="absolute bottom-0 right-3.5 rounded-full w-6 h-6 bg-green-500 flex items-center justify-center after:content-[''] after:block after:w-3 after:h-3 after:rounded-full after:bg-green-200"></span>
              </div>
              <p className="text-lg text-gray-900 font-semibold">Кардиолог</p>
              <p className="text-sm leading-4.5 text-gray-500 text-center grow flex items-center">Консультации по сердечно-сосудистой системе</p>
              <Link href="#" className="flex items-center justify-center gap-2 border border-solid border-slate-200 rounded-md p-2.5 w-full group hover:bg-blue-500 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" className="stroke-[#020817] group-hover:stroke-white transition">
                  <path d="M14.25 10.75C14.25 11.1036 14.1095 11.4428 13.8595 11.6928C13.6094 11.9429 13.2703 12.0833 12.9167 12.0833H4.91667L2.25 14.75V4.08333C2.25 3.72971 2.39048 3.39057 2.64052 3.14052C2.89057 2.89048 3.22971 2.75 3.58333 2.75H12.9167C13.2703 2.75 13.6094 2.89048 13.8595 3.14052C14.1095 3.39057 14.25 3.72971 14.25 4.08333V10.75Z" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm font-medium text-[#020817] group-hover:text-white transition">Консультация</span>
              </Link>
            </div>
            <div className="bg-white rounded-lg min-w-[261px] lg:min-w-0 p-3.5 lg:p-6 flex flex-col gap-3.5 items-center shadow-sm">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden relative">
                  <Image src="/img/doc2.jpg" alt="Уролог" className="w-full h-full object-cover" width={112} height={112} />
                </div>
                <span className="absolute bottom-0 right-3.5 rounded-full w-6 h-6 bg-green-500 flex items-center justify-center after:content-[''] after:block after:w-3 after:h-3 after:rounded-full after:bg-green-200"></span>
              </div>
              <p className="text-lg text-gray-900 font-semibold">Уролог</p>
              <p className="text-sm leading-4.5 text-gray-500 text-center grow flex items-center">Вопросы урологического здоровья</p>
              <Link href="#" className="flex items-center justify-center gap-2 border border-solid border-slate-200 rounded-md p-2.5 w-full group hover:bg-blue-500 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" className="stroke-[#020817] group-hover:stroke-white transition">
                  <path d="M14.25 10.75C14.25 11.1036 14.1095 11.4428 13.8595 11.6928C13.6094 11.9429 13.2703 12.0833 12.9167 12.0833H4.91667L2.25 14.75V4.08333C2.25 3.72971 2.39048 3.39057 2.64052 3.14052C2.89057 2.89048 3.22971 2.75 3.58333 2.75H12.9167C13.2703 2.75 13.6094 2.89048 13.8595 3.14052C14.1095 3.39057 14.25 3.72971 14.25 4.08333V10.75Z" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm font-medium text-[#020817] group-hover:text-white transition">Консультация</span>
              </Link>
            </div>
            <div className="bg-white rounded-lg min-w-[261px] lg:min-w-0 p-3.5 lg:p-6 flex flex-col gap-3.5 items-center shadow-sm">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden relative">
                  <Image src="/img/doc3.jpg" alt="Гинеколог" className="w-full h-full object-cover" width={112} height={112} />
                </div>
                <span className="absolute bottom-0 right-3.5 rounded-full w-6 h-6 bg-green-500 flex items-center justify-center after:content-[''] after:block after:w-3 after:h-3 after:rounded-full after:bg-green-200"></span>
              </div>
              <p className="text-lg text-gray-900 font-semibold">Гинеколог</p>
              <p className="text-sm leading-4.5 text-gray-500 text-center grow flex items-center">Женское здоровье</p>
              <Link href="#" className="flex items-center justify-center gap-2 border border-solid border-slate-200 rounded-md p-2.5 w-full group hover:bg-blue-500 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" className="stroke-[#020817] group-hover:stroke-white transition">
                  <path d="M14.25 10.75C14.25 11.1036 14.1095 11.4428 13.8595 11.6928C13.6094 11.9429 13.2703 12.0833 12.9167 12.0833H4.91667L2.25 14.75V4.08333C2.25 3.72971 2.39048 3.39057 2.64052 3.14052C2.89057 2.89048 3.22971 2.75 3.58333 2.75H12.9167C13.2703 2.75 13.6094 2.89048 13.8595 3.14052C14.1095 3.39057 14.25 3.72971 14.25 4.08333V10.75Z" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm font-medium text-[#020817] group-hover:text-white transition">Консультация</span>
              </Link>
            </div>
            <div className="bg-white rounded-lg min-w-[261px] lg:min-w-0 p-3.5 lg:p-6 flex flex-col gap-3.5 items-center shadow-sm">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden relative">
                  <Image src="/img/doc4.jpg" alt="Невролог" className="w-full h-full object-cover" width={112} height={112} />
                </div>
                <span className="absolute bottom-0 right-3.5 rounded-full w-6 h-6 bg-green-500 flex items-center justify-center after:content-[''] after:block after:w-3 after:h-3 after:rounded-full after:bg-green-200"></span>
              </div>
              <p className="text-lg text-gray-900 font-semibold">Невролог</p>
              <p className="text-sm leading-4.5 text-gray-500 text-center grow flex items-center">Нервная система и головной мозг</p>
              <Link href="#" className="flex items-center justify-center gap-2 border border-solid border-slate-200 rounded-md p-2.5 w-full group hover:bg-blue-500 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" className="stroke-[#020817] group-hover:stroke-white transition">
                  <path d="M14.25 10.75C14.25 11.1036 14.1095 11.4428 13.8595 11.6928C13.6094 11.9429 13.2703 12.0833 12.9167 12.0833H4.91667L2.25 14.75V4.08333C2.25 3.72971 2.39048 3.39057 2.64052 3.14052C2.89057 2.89048 3.22971 2.75 3.58333 2.75H12.9167C13.2703 2.75 13.6094 2.89048 13.8595 3.14052C14.1095 3.39057 14.25 3.72971 14.25 4.08333V10.75Z" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm font-medium text-[#020817] group-hover:text-white transition">Консультация</span>
              </Link>
            </div>
            <div className="bg-white rounded-lg min-w-[261px] lg:min-w-0 p-3.5 lg:p-6 flex flex-col gap-3.5 items-center shadow-sm">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden relative">
                  <Image src="/img/doc5.jpg" alt="Эндокринолог" className="w-full h-full object-cover" width={112} height={112} />
                </div>
                <span className="absolute bottom-0 right-3.5 rounded-full w-6 h-6 bg-green-500 flex items-center justify-center after:content-[''] after:block after:w-3 after:h-3 after:rounded-full after:bg-green-200"></span>
              </div>
              <p className="text-lg text-gray-900 font-semibold">Эндокринолог</p>
              <p className="text-sm leading-4.5 text-gray-500 text-center grow flex items-center">Гормональная система</p>
              <Link href="#" className="flex items-center justify-center gap-2 border border-solid border-slate-200 rounded-md p-2.5 w-full group hover:bg-blue-500 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" className="stroke-[#020817] group-hover:stroke-white transition">
                  <path d="M14.25 10.75C14.25 11.1036 14.1095 11.4428 13.8595 11.6928C13.6094 11.9429 13.2703 12.0833 12.9167 12.0833H4.91667L2.25 14.75V4.08333C2.25 3.72971 2.39048 3.39057 2.64052 3.14052C2.89057 2.89048 3.22971 2.75 3.58333 2.75H12.9167C13.2703 2.75 13.6094 2.89048 13.8595 3.14052C14.1095 3.39057 14.25 3.72971 14.25 4.08333V10.75Z" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm font-medium text-[#020817] group-hover:text-white transition">Консультация</span>
              </Link>
            </div>
            <div className="bg-white rounded-lg min-w-[261px] lg:min-w-0 p-3.5 lg:p-6 flex flex-col gap-3.5 items-center shadow-sm">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden relative">
                  <Image src="/img/doc6.jpg" alt="Гастроэнтеролог" className="w-full h-full object-cover" width={112} height={112} />
                </div>
                <span className="absolute bottom-0 right-3.5 rounded-full w-6 h-6 bg-green-500 flex items-center justify-center after:content-[''] after:block after:w-3 after:h-3 after:rounded-full after:bg-green-200"></span>
              </div>
              <p className="text-lg text-gray-900 font-semibold">Гастроэнтеролог</p>
              <p className="text-sm leading-4.5 text-gray-500 text-center grow flex items-center">Пищеварительная система</p>
              <Link href="#" className="flex items-center justify-center gap-2 border border-solid border-slate-200 rounded-md p-2.5 w-full group hover:bg-blue-500 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" className="stroke-[#020817] group-hover:stroke-white transition">
                  <path d="M14.25 10.75C14.25 11.1036 14.1095 11.4428 13.8595 11.6928C13.6094 11.9429 13.2703 12.0833 12.9167 12.0833H4.91667L2.25 14.75V4.08333C2.25 3.72971 2.39048 3.39057 2.64052 3.14052C2.89057 2.89048 3.22971 2.75 3.58333 2.75H12.9167C13.2703 2.75 13.6094 2.89048 13.8595 3.14052C14.1095 3.39057 14.25 3.72971 14.25 4.08333V10.75Z" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm font-medium text-[#020817] group-hover:text-white transition">Консультация</span>
              </Link>
            </div>
            <div className="bg-white rounded-lg min-w-[261px] lg:min-w-0 p-3.5 lg:p-6 flex flex-col gap-3.5 items-center shadow-sm">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden relative">
                  <Image src="/img/doc7.jpg" alt="Дерматолог" className="w-full h-full object-cover" width={112} height={112} />
                </div>
                <span className="absolute bottom-0 right-3.5 rounded-full w-6 h-6 bg-green-500 flex items-center justify-center after:content-[''] after:block after:w-3 after:h-3 after:rounded-full after:bg-green-200"></span>
              </div>
              <p className="text-lg text-gray-900 font-semibold">Дерматолог</p>
              <p className="text-sm leading-4.5 text-gray-500 text-center grow flex items-center">Кожные заболевания</p>
              <Link href="#" className="flex items-center justify-center gap-2 border border-solid border-slate-200 rounded-md p-2.5 w-full group hover:bg-blue-500 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" className="stroke-[#020817] group-hover:stroke-white transition">
                  <path d="M14.25 10.75C14.25 11.1036 14.1095 11.4428 13.8595 11.6928C13.6094 11.9429 13.2703 12.0833 12.9167 12.0833H4.91667L2.25 14.75V4.08333C2.25 3.72971 2.39048 3.39057 2.64052 3.14052C2.89057 2.89048 3.22971 2.75 3.58333 2.75H12.9167C13.2703 2.75 13.6094 2.89048 13.8595 3.14052C14.1095 3.39057 14.25 3.72971 14.25 4.08333V10.75Z" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm font-medium text-[#020817] group-hover:text-white transition">Консультация</span>
              </Link>
            </div>
            <div className="bg-white rounded-lg min-w-[261px] lg:min-w-0 p-3.5 lg:p-6 flex flex-col gap-3.5 items-center shadow-sm">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden relative">
                  <Image src="/img/doc8.jpg" alt="Терапевт" className="w-full h-full object-cover" width={112} height={112} />
                </div>
                <span className="absolute bottom-0 right-3.5 rounded-full w-6 h-6 bg-green-500 flex items-center justify-center after:content-[''] after:block after:w-3 after:h-3 after:rounded-full after:bg-green-200"></span>
              </div>
              <p className="text-lg text-gray-900 font-semibold">Терапевт</p>
              <p className="text-sm leading-4.5 text-gray-500 text-center grow flex items-center">Общие медицинские вопросы</p>
              <Link href="#" className="flex items-center justify-center gap-2 border border-solid border-slate-200 rounded-md p-2.5 w-full group hover:bg-blue-500 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" className="stroke-[#020817] group-hover:stroke-white transition">
                  <path d="M14.25 10.75C14.25 11.1036 14.1095 11.4428 13.8595 11.6928C13.6094 11.9429 13.2703 12.0833 12.9167 12.0833H4.91667L2.25 14.75V4.08333C2.25 3.72971 2.39048 3.39057 2.64052 3.14052C2.89057 2.89048 3.22971 2.75 3.58333 2.75H12.9167C13.2703 2.75 13.6094 2.89048 13.8595 3.14052C14.1095 3.39057 14.25 3.72971 14.25 4.08333V10.75Z" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm font-medium text-[#020817] group-hover:text-white transition">Консультация</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-10 sm:pb-15 md:pb-12 lg:py-15 px-4">
        <div className="max-w-320 mx-auto">
          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[44px] lg:leading-[60px] font-semibold text-center pl-3 pr-3 text-headerText">Часто задаваемые вопросы</h2>
          <div className="flex flex-col gap-1 md:gap-2.5 mt-6 lg:mt-10">
            <details className="open:shadow-sm bg-white border rounded-[10px] border-[#F6F6F6] py-3.5 md:py-5 px-5 md:px-7.5 cursor-pointer group">
              <summary className="text-base md:text-lg text-[#222222] leading-7 font-semibold flex items-center justify-between select-none">
                Может ли ИИ доктор действительно помочь?
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-[[open]]:rotate-180">
                  <path d="M5.99998 9L12.0001 15.0001L18 9" stroke="#3B82F6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <div className="text-sm text-gray-500 mt-2.5 transition-all">Да! Наш ИИ доктор обучен на огромном массиве медицинских данных и научных исследований, что позволяет ему давать точные и актуальные рекомендации прямо сейчас. Он помогает расшифровывать анализы, интерпретировать симптомы и предоставлять информацию по лечению. При этом важно помнить, что ИИ консультация не заменяет очный визит к врачу при серьезных состояниях.</div>
            </details>
            <details className="open:shadow-sm bg-white border rounded-[10px] border-[#F6F6F6] py-3.5 md:py-5 px-5 md:px-7.5 cursor-pointer group">
              <summary className="text-base md:text-lg text-[#222222] leading-7 font-semibold flex items-center justify-between select-none">
                Насколько точны рекомендации ИИ доктора?
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-[[open]]:rotate-180">
                  <path d="M5.99998 9L12.0001 15.0001L18 9" stroke="#3B82F6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <div className="text-sm text-gray-500 mt-2.5 transition-all">Точность наших ИИ-докторов превышает 95% при интерпретации медицинских анализов и 90% при оценке распространенных заболеваний. Система постоянно обучается на новейших медицинских исследованиях и клинических рекомендациях. При сложных случаях ИИ всегда указывает на необходимость очной консультации и не дает рекомендаций, если уровень уверенности недостаточно высок.</div>
            </details>
            <details className="open:shadow-sm bg-white border rounded-[10px] border-[#F6F6F6] py-3.5 md:py-5 px-5 md:px-7.5 cursor-pointer group">
              <summary className="text-base md:text-lg text-[#222222] leading-7 font-semibold flex items-center justify-between select-none">
                Как быстро я получу ответ на свой вопрос?
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-[[open]]:rotate-180">
                  <path d="M5.99998 9L12.0001 15.0001L18 9" stroke="#3B82F6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <div className="text-sm text-gray-500 mt-2.5 transition-all">Мгновенно! Наш ИИ доктор отвечает за считанные секунды, даже на сложные медицинские вопросы. В отличие от обычных консультаций, где нужно ждать записи или стоять в очереди, наш сервис доступен 24/7 и мгновенно обрабатывает запросы. Даже для анализа загруженных результатов исследований системе требуется всего 10-15 секунд.</div>
            </details>
            <details className="open:shadow-sm bg-white border rounded-[10px] border-[#F6F6F6] py-3.5 md:py-5 px-5 md:px-7.5 cursor-pointer group">
              <summary className="text-base md:text-lg text-[#222222] leading-7 font-semibold flex items-center justify-between select-none">
                Безопасны ли мои медицинские данные?
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-[[open]]:rotate-180">
                  <path d="M5.99998 9L12.0001 15.0001L18 9" stroke="#3B82F6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <div className="text-sm text-gray-500 mt-2.5 transition-all">Абсолютно! Мы используем медицинский стандарт шифрования HIPAA для защиты всех ваших данных. Ваша конфиденциальность — наш приоритет. Мы не передаем данные третьим лицам и не используем их в рекламных целях. Вы можете в любой момент запросить полное удаление своих данных из нашей системы.</div>
            </details>
            <details className="open:shadow-sm bg-white border rounded-[10px] border-[#F6F6F6] py-3.5 md:py-5 px-5 md:px-7.5 cursor-pointer group">
              <summary className="text-base md:text-lg text-[#222222] leading-7 font-semibold flex items-center justify-between select-none">
                Сколько стоит консультация ИИ доктора?
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-[[open]]:rotate-180">
                  <path d="M5.99998 9L12.0001 15.0001L18 9" stroke="#3B82F6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <div className="text-sm text-gray-500 mt-2.5 transition-all">Мы предлагаем гибкую систему оплаты. Базовая консультация доступна бесплатно, а расширенные возможности и детальная расшифровка анализов доступны в рамках наших доступных тарифных планов. Стоимость полного доступа в 5-10 раз ниже, чем средняя стоимость очной консультации врача. Оплата разовая или по подписке — выбирайте, что удобнее.</div>
            </details>
            <details className="open:shadow-sm bg-white border rounded-[10px] border-[#F6F6F6] py-3.5 md:py-5 px-5 md:px-7.5 cursor-pointer group">
              <summary className="text-base md:text-lg text-[#222222] leading-7 font-semibold flex items-center justify-between select-none">
                Могу ли я показать ИИ доктору свои анализы?
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-[[open]]:rotate-180">
                  <path d="M5.99998 9L12.0001 15.0001L18 9" stroke="#3B82F6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <div className="text-sm text-gray-500 mt-2.5 transition-all">Да, это основная функция сервиса! Просто загрузите фото ваших анализов или PDF-файл, и ИИ мгновенно расшифрует все показатели, выделит отклонения от нормы и предоставит понятные объяснения. Система работает с результатами всех основных лабораторий, включая Инвитро, Гемотест, Хеликс, КДЛ и другие.</div>
            </details>
            <details className="open:shadow-sm bg-white border rounded-[10px] border-[#F6F6F6] py-3.5 md:py-5 px-5 md:px-7.5 cursor-pointer group">
              <summary className="text-base md:text-lg text-[#222222] leading-7 font-semibold flex items-center justify-between select-none">
                Заменяет ли ИИ доктор настоящего врача?
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-[[open]]:rotate-180">
                  <path d="M5.99998 9L12.0001 15.0001L18 9" stroke="#3B82F6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <div className="text-sm text-gray-500 mt-2.5 transition-all">ИИ доктор — это мощный инструмент для первичной консультации, расшифровки анализов и получения медицинской информации, но он не заменяет полностью очного врача. В экстренных случаях или при серьезных заболеваниях система всегда рекомендует обратиться к специалисту. ИИ доктор идеален для предварительной оценки состояния, мониторинга хронических заболеваний и проверки результатов анализов.</div>
            </details>
          </div>
        </div>
      </section>

      <section className="pb-10 sm:pb-15 md:pt-15">
        <div className="max-w-320 mx-auto px-4">
          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[44px] lg:leading-[60px] font-semibold text-center pl-3 pr-3 text-headerText mb-10">Статьи нашего блога</h2>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mb-10">
            {/* Blog posts will be loaded dynamically from the API */}
            <BlogCardPreview />
          </div>
          <div className="flex justify-center">
            <Link href="/blog" className="px-6 py-3 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition">
              Посмотреть все статьи
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-10 sm:pb-15 md:py-15">
        <div className="max-w-320 mx-auto flex flex-col gap-y-2.5 md:gap-y-6 items-center md:px-4">
          <h2 className="text-base sm:text-lg font-semibold leading-[26.4px]">Работаем с результатами лабораторий</h2>
          <div className="flex md:flex-none md:grid md:grid-cols-5 gap-3.5 overflow-x-auto w-full">
            <div className="min-w-37.5 w-37.5 md:w-auto rounded-lg bg-white overflow-hidden">
              <Image className="w-full h-auto object-cover" src="/img/logos/lab1.png" alt="HELIX" width={150} height={60} />
            </div>
            <div className="min-w-37.5 w-37.5 md:w-auto rounded-lg bg-white overflow-hidden">
              <Image className="w-full h-auto object-cover" src="/img/logos/lab2.png" alt="ГЕМОТЕСТ" width={150} height={60} />
            </div>
            <div className="min-w-37.5 w-37.5 md:w-auto rounded-lg bg-white overflow-hidden">
              <Image className="w-full h-auto object-cover" src="/img/logos/lab3.png" alt="INVITRO" width={150} height={60} />
            </div>
            <div className="min-w-37.5 w-37.5 md:w-auto rounded-lg bg-white overflow-hidden">
              <Image className="w-full h-auto object-cover" src="/img/logos/lab4.png" alt="KDL" width={150} height={60} />
            </div>
            <div className="min-w-37.5 w-37.5 md:w-auto rounded-lg bg-white overflow-hidden">
              <Image className="w-full h-auto object-cover" src="/img/logos/lab5.png" alt="СМ-Клиника" width={150} height={60} />
            </div>
          </div>
        </div>
      </section>

      <section className="pt-6 lg:pt-15 pb-10 lg:pb-30 px-4">
        <div className="max-w-320 mx-auto">
          <div className="bg-[#111827] rounded-2xl md:rounded-3xl py-[2.5rem] px-[2.5rem]">
            <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[44px] lg:leading-[40px] font-semibold text-center text-white">Получите консультацию ИИ доктора прямо сейчас</h2>
            <p className="text-sm md:text-base lg:text-lg text-center text-gray-300 mx-auto mt-3.5 lg:mt-10">Наши AI-специалисты доступны 24/7 и готовы ответить на ваши <br /> вопросы о здоровье в любое время суток</p>
            <div className="flex flex-col md:flex-row items-center md:items-center md:justify-center gap-4 md:gap-6 mt-6 lg:mt-10 max-w-[279px] md:max-w-full mx-auto">
              <div className="flex items-center gap-2">
                <Image src="/img/icons/icon-consult1.svg" alt="Доступно 24/7" width={24} height={24} />
                <span className="text-sm md:text-[15px] leading-6 text-gray-300">Доступно 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <Image src="/img/icons/icon-consult2.svg" alt="Мгновенные ответы" width={24} height={24} />
                <span className="text-sm md:text-[15px] leading-6 text-gray-300">Мгновенные ответы</span>
              </div>
              <div className="flex items-center gap-2">
                <Image src="/img/icons/icon-consult3.svg" alt="Профессиональная консультация" width={24} height={24} />
                <span className="text-sm md:text-[15px] leading-6 text-gray-300">Профессиональная консультация</span>
              </div>
            </div>
            <div className="flex justify-center mt-6 md:mt-10 gap-4">
              <Link href="/consult" className="bg-blue-500 rounded-md flex items-center gap-2 h-12 px-8 hover:bg-blue-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                  <path d="M17.5 13.375C17.5 13.817 17.3244 14.241 17.0118 14.5535C16.6993 14.8661 16.2754 15.0417 15.8333 15.0417H5.83333L2.5 18.375V5.04167C2.5 4.59964 2.67559 4.17572 2.98816 3.86316C3.30072 3.55059 3.72464 3.375 4.16667 3.375H15.8333C16.2754 3.375 16.6993 3.55059 17.0118 3.86316C17.3244 4.17572 17.5 4.59964 17.5 5.04167V13.375Z" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-white text-sm font-medium">Начать консультацию</span>
              </Link>
              <Link href="/analysis" className="border border-blue-500 bg-transparent text-blue-500 rounded-md flex items-center gap-2 h-12 px-8 hover:bg-blue-50 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                  <path d="M10 6.55833V13.625M6.66667 9.89167H13.3333M17.5 13.625C17.5 14.0671 17.3244 14.491 17.0118 14.8035C16.6993 15.1161 16.2754 15.2917 15.8333 15.2917H4.16667C3.72464 15.2917 3.30072 15.1161 2.98816 14.8035C2.67559 14.491 2.5 14.0671 2.5 13.625V6.55833C2.5 6.11631 2.67559 5.69239 2.98816 5.37982C3.30072 5.06726 3.72464 4.89167 4.16667 4.89167H15.8333C16.2754 4.89167 16.6993 5.06726 17.0118 5.37982C17.3244 5.69239 17.5 6.11631 17.5 6.55833V13.625Z" stroke="#3B82F6" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-blue-500 text-sm font-medium">Расшифровать анализы</span>
              </Link>
            </div>
            <div className="flex flex-col md:flex-row items-center md:justify-center gap-2 md:gap-8.5 mt-6 md:mt-10">
              <p className="text-xs md:text-sm text-gray-400 after:content-[''] after:block after:w-10 after:h-[1px] after:border-t after:border-solid after:border-[#475467] flex flex-col md:flex-row items-center gap-2 md:gap-8.5 last:after:content-none">Безопасно и конфиденциально</p>
              <p className="text-xs md:text-sm text-gray-400 after:content-[''] after:block after:w-10 after:h-[1px] after:border-t after:border-solid after:border-[#475467] flex flex-col md:flex-row items-center gap-2 md:gap-8.5 last:after:content-none">Без ожидания</p>
              <p className="text-xs md:text-sm text-gray-400 after:content-[''] after:block after:w-10 after:h-[1px] after:border-t after:border-solid after:border-[#475467] flex flex-col md:flex-row items-center gap-2 md:gap-8.5 last:after:content-none">Доступно из любой точки мира</p>
            </div>
          </div>
        </div>
      </section>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', () => {
              const toggleClasses = (el, classesToAdd, classesToRemove) => {
                classesToAdd.forEach(cls => el.classList.add(cls));
                classesToRemove.forEach(cls => el.classList.remove(cls));
              };
            });
          `,
        }}
      />
    </>
  );
}