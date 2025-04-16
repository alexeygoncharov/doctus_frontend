import Image from 'next/image';
import Link from 'next/link';

export default function CTASection() {
  return (
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
          <div className="flex flex-col md:flex-row justify-center mt-6 md:mt-10 gap-4">
            <Link href="/consult" className="bg-blue-500 rounded-md flex items-center justify-center gap-2 h-12 px-8 hover:bg-blue-600 transition w-full md:w-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                <path d="M17.5 13.375C17.5 13.817 17.3244 14.241 17.0118 14.5535C16.6993 14.8661 16.2754 15.0417 15.8333 15.0417H5.83333L2.5 18.375V5.04167C2.5 4.59964 2.67559 4.17572 2.98816 3.86316C3.30072 3.55059 3.72464 3.375 4.16667 3.375H15.8333C16.2754 3.375 16.6993 3.55059 17.0118 3.86316C17.3244 4.17572 17.5 4.59964 17.5 5.04167V13.375Z" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-white text-sm font-medium">Начать консультацию</span>
            </Link>
            <Link href="/analysis" className="border border-blue-500 bg-transparent text-blue-500 rounded-md flex items-center justify-center gap-2 h-12 px-8 hover:bg-blue-50 transition w-full md:w-auto">
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
  );
} 