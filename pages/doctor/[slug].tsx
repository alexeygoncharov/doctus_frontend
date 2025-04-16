import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { DoctorChat } from '../../components/chat/doctor-chat';
import { getDoctorBySlug } from '@/lib/api';
import { Doctor } from '@/lib/doctors';
import CapabilitiesSection from '../../components/ui/CapabilitiesSection';
import DoctorsSection from '../../components/ui/DoctorsSection';
import FAQSection from '../../components/ui/FAQSection';
import BlogSection from '../../components/ui/BlogSection';
import LabsSection from '../../components/ui/LabsSection';
import CTASection from '../../components/ui/CTASection';

export default function DoctorPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const data = await getDoctorBySlug(slug as string);
        setDoctor(data);
      } catch (err) {
        console.error('Ошибка при загрузке доктора:', err);
        setError('Не удалось загрузить информацию о докторе');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen px-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Ошибка</h1>
        <p className="text-gray-700 mb-6">{error || 'Доктор не найден'}</p>
        <Link href="/" className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  // Используем page_title и page_description из доктора, если они есть, иначе используем стандартные
  const pageTitle = doctor.page_title || `Онлайн консультация ИИ ${doctor.name.toLowerCase()}`;
  const pageDescription = doctor.page_description || `Задайте вопрос ИИ доктору, загрузите ваши анализы, фото и получите подробную расшифровку с рекомендациями от искусственного интеллекта`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Head>

      <section className="px-0 md:px-2">
        <div className="pt-6 md:pt-15 pb-10 md:pb-20 px-4 md:rounded-2xl lg:rounded-5 bg-linear-to-b from-[#EAF1FC] to-slate-50">
          <div className="max-w-320 mx-auto flex flex-col gap-y-6 md:gap-y-8 lg:gap-y-10 items-center">
            <div className="bg-white flex items-center gap-4 md:gap-1 rounded-3xl py-2 px-4 md:px-5 max-w-64.5 md:max-w-full">
              <Image src="/img/icons/stars.svg" alt="Start" width={24} height={24} />
              <span className="text-xs md:text-sm">Интеллектуальный анализ медицинских показателей с поддержкой ИИ</span>
            </div>
            <h1 className="text-center text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold max-w-227.5">{pageTitle}</h1>
            <p className="text-center max-w-227.5 text-sm sm:text-base md:text-lg lg:text-[21px] lg:-md-4 lg:-mt-5">{pageDescription}</p>
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
              <DoctorChat initialDoctorId={doctor.id} />
            </div>
          </div>
        </div>
      </section>

      <section className="pb-10 sm:pb-15 md:pb-12 lg:py-15 px-4">
        <div className="max-w-320 mx-auto flex flex-col gap-y-6 md:gap-y-8 lg:gap-y-10 items-center">
          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[44px] lg:leading-[60px] font-semibold text-center pl-3 pr-3 text-headerText">Как ИИ {doctor.name.toLowerCase()} может помочь?</h2>
          <div className="flex flex-col gap-6 lg-gap-10 w-full">
            <div className="flex flex-col-reverse lg:flex-row lg:even:flex-row-reverse lg:items-center justify-between gap-3.5 lg:gap-6">
              <div className="lg:max-w-131">
                <p className="text-lg md:text-[28px] leading-[32px] font-semibold mb-2 lg:mb-4">Медицинская экспертиза</p>
                <p className="text-gray-600 text-sm md:text-base">Получите точную и надежную медицинскую информацию по различным вопросам здоровья. Наш ИИ-{doctor.name.toLowerCase()} обладает обширными знаниями и предоставляет персонализированные рекомендации с учетом ваших конкретных симптомов и состояния.</p>
              </div>
              <div className="w-full max-w-full lg:max-w-150 w-full flex rounded-xl overflow-hidden">
                <Image src="/img/consult1.jpg" alt="Фото" className="w-full h-auto" width={500} height={300} />
              </div>
            </div>
            <div className="flex flex-col-reverse lg:flex-row lg:even:flex-row-reverse lg:items-center justify-between gap-3.5 lg:gap-6">
              <div className="lg:max-w-131">
                <p className="text-lg md:text-[28px] leading-[32px] font-semibold mb-2 lg:mb-4">Анализ медицинских документов</p>
                <p className="text-gray-600 text-sm md:text-base">Нужна помощь в расшифровке результатов анализов или медицинских заключений? Наш ИИ-{doctor.name.toLowerCase()} поможет вам разобраться в медицинской документации, объяснит значение показателей и предоставит понятные комментарии.</p>
              </div>
              <div className="w-full max-w-full lg:max-w-150 w-full flex rounded-xl overflow-hidden">
                <Image src="/img/consult2.jpg" alt="Фото" className="w-full h-auto" width={500} height={300} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <CapabilitiesSection />

      <DoctorsSection />

      <FAQSection />

      <BlogSection />

      <LabsSection />

      <CTASection />

      {/* Следующая секция: CTA */}
    </>
  );
} 