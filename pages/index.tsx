import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { DoctorChat } from '../components/chat/doctor-chat';
import CapabilitiesSection from '../components/ui/CapabilitiesSection';
import DoctorsSection from '../components/ui/DoctorsSection';
import FAQSection from '../components/ui/FAQSection';
import BlogSection from '../components/ui/BlogSection';
import LabsSection from '../components/ui/LabsSection';
import CTASection from '../components/ui/CTASection';

export default function Home() {
  const handleAccordionAnimation = () => {
    if (typeof window !== 'undefined') {
      const detailsElements = document.querySelectorAll('details');
      detailsElements.forEach(detail => {
        const summary = detail.querySelector('summary');
        const content = detail.querySelector('div');
        if (summary && content) {
          if (!detail.hasAttribute('open')) {
            content.style.maxHeight = '0px';
            content.style.opacity = '0';
          } else {
            content.style.maxHeight = `${content.scrollHeight}px`;
            content.style.opacity = '1';
          }
          detail.addEventListener('toggle', () => {
            if (detail.hasAttribute('open')) {
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
              setTimeout(() => {
                content.style.maxHeight = `${content.scrollHeight}px`;
                content.style.opacity = '1';
              }, 10);
            } else {
              content.style.maxHeight = '0px';
              content.style.opacity = '0';
            }
          });
        }
      });
    }
  };
  
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
          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[44px] lg:leading-[60px] font-semibold text-center pl-3 pr-3 text-headerText">Как ИИ доктор может помочь?</h2>
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
      <CapabilitiesSection />
      <DoctorsSection />
      <FAQSection />
      <BlogSection />
      <CTASection />
      <LabsSection />
    </>
  );
}