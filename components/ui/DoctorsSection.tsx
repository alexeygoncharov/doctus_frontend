import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getDoctors, getBackendUrl } from '@/lib/api';
import { Doctor, mapApiDoctorToUi } from '@/lib/doctors';

export default function DoctorsSection() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setDoctorsError(null);
        const apiDoctors = await getDoctors();
        if (!Array.isArray(apiDoctors)) throw new Error('Получен неверный формат данных для докторов');
        setDoctors(apiDoctors.map(mapApiDoctorToUi));
      } catch (err) {
        setDoctorsError('Не удалось загрузить список докторов');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  return (
    <section className="pb-10 sm:pb-15 md:pb-12 lg:py-15 px-4" id="doctors">
      <div className="max-w-320 mx-auto">
        <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[44px] lg:leading-[60px] font-semibold text-center pl-3 pr-3 text-headerText">Наши ИИ доктора</h2>
        <p className="mx-auto mt-3.5 sm:mt-1 text-sm md:text-base lg:text-lg text-center">Наши AI-ассистенты специализируются в разных областях медицины <br /> и доступны для консультации 24/7.</p>
        <div className="flex overflow-x-auto lg:flex-none lg:grid lg:grid-cols-4 gap-3.5 mt-2.5 lg:mt-10 py-1 lg:py-0">
          {loading ? (
            [...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg min-w-[261px] lg:min-w-0 p-3.5 lg:p-6 flex flex-col gap-3.5 items-center shadow-sm animate-pulse">
                <div className="w-28 h-28 rounded-full bg-gray-200"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mt-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mt-1"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mt-1"></div>
                <div className="h-10 bg-gray-200 rounded w-full mt-3"></div>
              </div>
            ))
          ) : doctorsError ? (
            <div className="col-span-4 text-center text-red-500 py-8">
              {doctorsError} Попробуйте обновить страницу.
            </div>
          ) : (
            doctors.map((doctor, index) => {
              const avatarSrc = getBackendUrl(doctor.avatar) || '/img/doctor-default.png';
              return (
                <div key={doctor.id} className="bg-white rounded-lg min-w-[261px] lg:min-w-0 p-3.5 lg:p-6 flex flex-col gap-3.5 items-center shadow-sm">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full overflow-hidden relative bg-gray-100">
                      <Image
                        alt={doctor.name}
                        src={avatarSrc}
                        width={112}
                        height={112}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/img/doctor-default.png';
                          e.currentTarget.srcset = '';
                        }}
                        priority={index < 4}
                      />
                    </div>
                  </div>
                  <p className="text-lg text-gray-900 font-semibold">{doctor.name}</p>
                  <p className="text-sm leading-4.5 text-gray-500 text-center grow flex items-center">{doctor.description}</p>
                  <Link className="flex items-center justify-center gap-2 border border-solid border-slate-200 rounded-md p-2.5 w-full group hover:bg-blue-500 transition" href={`/doctor/${doctor.slug || doctor.id}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" className="stroke-[#020817] group-hover:stroke-white transition">
                      <path d="M14.25 10.75C14.25 11.1036 14.1095 11.4428 13.8595 11.6928C13.6094 11.9429 13.2703 12.0833 12.9167 12.0833H4.91667L2.25 14.75V4.08333C2.25 3.72971 2.39048 3.39057 2.64052 3.14052C2.89057 2.89048 3.22971 2.75 3.58333 2.75H12.9167C13.2703 2.75 13.6094 2.89048 13.8595 3.14052C14.1095 3.39057 14.25 3.72971 14.25 4.08333V10.75Z" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                    <span className="text-sm font-medium text-[#020817] group-hover:text-white transition">Консультация</span>
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
} 