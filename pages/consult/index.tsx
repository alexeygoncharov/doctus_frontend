import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

interface DoctorCard {
  id: string;
  name: string;
  specialty: string;
  description: string;
  image: string;
  status: 'online' | 'offline';
}

const ConsultPage = () => {
  const doctors: DoctorCard[] = [
    {
      id: 'cardiologist',
      name: 'Кардиолог',
      specialty: 'Кардиолог',
      description: 'Консультации по сердечно-сосудистой системе',
      image: '/images/doc1.jpg',
      status: 'online'
    },
    {
      id: 'urologist',
      name: 'Уролог',
      specialty: 'Уролог',
      description: 'Вопросы урологического здоровья',
      image: '/images/doc2.jpg',
      status: 'online'
    },
    {
      id: 'gynecologist',
      name: 'Гинеколог',
      specialty: 'Гинеколог',
      description: 'Женское здоровье',
      image: '/images/doc3.jpg',
      status: 'online'
    },
    {
      id: 'neurologist',
      name: 'Невролог',
      specialty: 'Невролог',
      description: 'Нервная система и головной мозг',
      image: '/images/doc4.jpg',
      status: 'online'
    },
    {
      id: 'endocrinologist',
      name: 'Эндокринолог',
      specialty: 'Эндокринолог',
      description: 'Гормональная система',
      image: '/images/doc5.jpg',
      status: 'online'
    },
    {
      id: 'gastroenterologist',
      name: 'Гастроэнтеролог',
      specialty: 'Гастроэнтеролог',
      description: 'Пищеварительная система',
      image: '/images/doc6.jpg',
      status: 'online'
    },
    {
      id: 'dermatologist',
      name: 'Дерматолог',
      specialty: 'Дерматолог',
      description: 'Кожные заболевания',
      image: '/images/doc7.jpg',
      status: 'online'
    },
    {
      id: 'therapist',
      name: 'Терапевт',
      specialty: 'Терапевт',
      description: 'Общие медицинские вопросы',
      image: '/images/doc8.jpg',
      status: 'online'
    }
  ];

  return (
    <>
      <Head>
        <title>Консультации с ИИ докторами | МедАссистент</title>
        <meta name="description" content="Получите онлайн-консультацию от ИИ специалистов по различным медицинским вопросам" />
      </Head>

      <div className="px-4 py-10 md:py-16">
        <div className="max-w-320 mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-[44px] lg:leading-[60px] font-semibold">Проконсультируйтесь С ИИ доктором</h1>
            <p className="mx-auto mt-3.5 sm:mt-1 text-sm md:text-base lg:text-lg">
              Наши AI-ассистенты специализируются в разных областях медицины <br className="hidden md:block" />
              и доступны для консультации 24/7.
            </p>

            <div className="flex flex-col md:flex-row items-start md:items-center md:justify-center gap-4 md:gap-6 mt-6 lg:mt-10 max-w-[279px] md:max-w-full mx-auto">
              <div className="flex items-center gap-2">
                <Image src="/icons/icon-consult1.svg" alt="Доступно 24/7" width={24} height={24} />
                <span className="text-sm md:text-[15px] leading-6 text-gray-600">Доступно 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <Image src="/icons/icon-consult2.svg" alt="Мгновенные ответы" width={24} height={24} />
                <span className="text-sm md:text-[15px] leading-6 text-gray-600">Мгновенные ответы</span>
              </div>
              <div className="flex items-center gap-2">
                <Image src="/icons/icon-consult3.svg" alt="Профессиональная консультация" width={24} height={24} />
                <span className="text-sm md:text-[15px] leading-6 text-gray-600">Профессиональная консультация</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-lg p-3.5 lg:p-6 flex flex-col gap-3.5 items-center shadow-sm">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full overflow-hidden relative">
                    <Image src={doctor.image} alt={doctor.name} fill className="object-cover" />
                  </div>
                  <span className="absolute bottom-0 right-3.5 rounded-full w-6 h-6 bg-green-500 flex items-center justify-center after:content-[''] after:block after:w-3 after:h-3 after:rounded-full after:bg-green-200"></span>
                </div>
                <p className="text-lg text-gray-900 font-semibold">{doctor.specialty}</p>
                <p className="text-sm leading-4.5 text-gray-500 text-center grow flex items-center">{doctor.description}</p>
                <Link href={`/doctor/${doctor.id}`} className="flex items-center justify-center gap-2 border border-solid border-slate-200 rounded-md p-2.5 w-full group hover:bg-blue-500 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" className="stroke-[#020817] group-hover:stroke-white transition">
                    <path d="M14.25 10.75C14.25 11.1036 14.1095 11.4428 13.8595 11.6928C13.6094 11.9429 13.2703 12.0833 12.9167 12.0833H4.91667L2.25 14.75V4.08333C2.25 3.72971 2.39048 3.39057 2.64052 3.14052C2.89057 2.89048 3.22971 2.75 3.58333 2.75H12.9167C13.2703 2.75 13.6094 2.89048 13.8595 3.14052C14.1095 3.39057 14.25 3.72971 14.25 4.08333V10.75Z" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-sm font-medium text-[#020817] group-hover:text-white transition">Консультация</span>
                </Link>
              </div>
            ))}
          </div>
          
          <div className="mt-16 lg:mt-24 bg-[#111827] rounded-2xl md:rounded-3xl py-10 lg:py-17.5 px-6.5 lg:px-12">
            <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[44px] lg:leading-[40px] font-semibold text-center text-white">Получите консультацию ИИ доктора прямо сейчас</h2>
            <p className="text-sm md:text-base lg:text-lg text-center text-gray-300 mx-auto mt-3.5 lg:mt-10">Наши AI-специалисты доступны 24/7 и готовы ответить на ваши <br className="hidden md:block" /> вопросы о здоровье в любое время суток</p>
            <div className="flex flex-col md:flex-row items-start md:items-center md:justify-center gap-4 md:gap-6 mt-6 lg:mt-10 max-w-[279px] md:max-w-full mx-auto">
              <div className="flex items-center gap-2">
                <Image src="/icons/icon-consult1.svg" alt="Доступно 24/7" width={24} height={24} />
                <span className="text-sm md:text-[15px] leading-6 text-gray-300">Доступно 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <Image src="/icons/icon-consult2.svg" alt="Мгновенные ответы" width={24} height={24} />
                <span className="text-sm md:text-[15px] leading-6 text-gray-300">Мгновенные ответы</span>
              </div>
              <div className="flex items-center gap-2">
                <Image src="/icons/icon-consult3.svg" alt="Профессиональная консультация" width={24} height={24} />
                <span className="text-sm md:text-[15px] leading-6 text-gray-300">Профессиональная консультация</span>
              </div>
            </div>
            <div className="flex justify-center mt-6 md:mt-10">
              <Link href="/doctor/therapist" className="bg-blue-500 rounded-md flex items-center gap-2 h-12 px-8 hover:bg-blue-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                  <path d="M17.5 13.375C17.5 13.817 17.3244 14.241 17.0118 14.5535C16.6993 14.8661 16.2754 15.0417 15.8333 15.0417H5.83333L2.5 18.375V5.04167C2.5 4.59964 2.67559 4.17572 2.98816 3.86316C3.30072 3.55059 3.72464 3.375 4.16667 3.375H15.8333C16.2754 3.375 16.6993 3.55059 17.0118 3.86316C17.3244 4.17572 17.5 4.59964 17.5 5.04167V13.375Z" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-white text-sm font-medium">Начать консультацию</span>
              </Link>
            </div>
            <div className="flex flex-col md:flex-row items-center md:justify-center gap-2 md:gap-8.5 mt-6 md:mt-10">
              <p className="text-xs md:text-sm text-gray-400 after:content-[''] after:block after:w-10 after:h-[1px] after:border-t after:border-solid after:border-[#475467] flex flex-col md:flex-row items-center gap-2 md:gap-8.5 last:after:content-none">Безопасно и конфиденциально</p>
              <p className="text-xs md:text-sm text-gray-400 after:content-[''] after:block after:w-10 after:h-[1px] after:border-t after:border-solid after:border-[#475467] flex flex-col md:flex-row items-center gap-2 md:gap-8.5 last:after:content-none">Без ожидания</p>
              <p className="text-xs md:text-sm text-gray-400 after:content-[''] after:block after:w-10 after:h-[1px] after:border-t after:border-solid after:border-[#475467] flex flex-col md:flex-row items-center gap-2 md:gap-8.5 last:after:content-none">Доступно из любой точки мира</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConsultPage;