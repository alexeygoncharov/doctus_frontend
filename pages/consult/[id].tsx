import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getDoctors } from '@/lib/api';
import { Doctor, mapApiDoctorToUi } from '@/lib/doctors';
import { DoctorChat } from '@/components/chat/doctor-chat';
import { useEffect, useState } from 'react';

interface ConsultDetailProps {
  doctorId: string | number;
  queryDoctor?: string | number;
}

const ConsultDetail: React.FC<ConsultDetailProps> = ({ doctorId, queryDoctor }) => {
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const apiDoctors = await getDoctors();
        const mappedDoctors = apiDoctors.map(mapApiDoctorToUi);
        
        // Приоритет для doctorId из query параметра, если он передан
        const idToUse = queryDoctor || doctorId;
        const foundDoctor = mappedDoctors.find((d: Doctor) => d.id.toString() === idToUse.toString());
        
        if (foundDoctor) {
          setDoctor(foundDoctor);
        } else {
          setError('Доктор не найден');
        }
      } catch (err) {
        console.error('Ошибка при загрузке доктора:', err);
        setError('Не удалось загрузить информацию о докторе');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId, queryDoctor]);

  if (router.isFallback || loading) {
    return <div className="max-w-320 mx-auto px-4 py-20 text-center">Загрузка...</div>;
  }

  if (error || !doctor) {
    return (
      <div className="max-w-320 mx-auto px-4 py-20 text-center">
        <p className="text-red-500 mb-4">{error || 'Доктор не найден'}</p>
        <Link href="/consult" className="text-blue-500 hover:underline">
          Вернуться к списку специалистов
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Консультация с {doctor.name} | МедАссистент</title>
        <meta name="description" content={`Получите онлайн-консультацию от ${doctor.name}, ИИ специалиста по ${doctor.specialty.toLowerCase()}`} />
      </Head>

      <div className="px-4 py-10 md:py-16">
        <div className="max-w-320 mx-auto">
          <div className="mb-8">
            <Link href="/consult" className="inline-flex items-center text-gray-600 hover:text-blue-500 transition">
              <svg className="mr-2 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Все специалисты
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
              <div className="relative w-36 h-36 md:w-48 md:h-48">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <Image src={doctor.avatar} alt={doctor.name} fill className="object-cover" />
                </div>
                <span className="absolute bottom-2 right-2 rounded-full w-6 h-6 bg-green-500 flex items-center justify-center after:content-[''] after:block after:w-3 after:h-3 after:rounded-full after:bg-green-200"></span>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-semibold mb-2">{doctor.name}</h1>
                <p className="text-gray-600 mb-4">{doctor.specialty}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-700">Обучен на актуальных данных</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    <span className="text-sm text-gray-700">Мгновенные ответы</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm text-gray-700">Высокая точность</span>
                  </div>
                </div>

                <p className="text-sm md:text-base text-gray-700">{doctor.description}</p>
              </div>
            </div>
          </div>

          {/* Чат с доктором */}
          <div className="mb-8">
            <DoctorChat initialDoctorId={queryDoctor || doctorId} />
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  const doctorId = params?.id;
  const queryDoctor = query?.doctor; // Получаем doctor из query параметров
  
  if (!doctorId) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      doctorId,
      queryDoctor: queryDoctor || null
    }
  };
};

export default ConsultDetail;