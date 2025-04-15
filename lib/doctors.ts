import { getBackendUrl } from "./api"; // Import the helper function

export interface Doctor {
  id: number | string;
  name: string;
  specialty: string;
  description: string;
  avatar: string;
  is_premium?: boolean;
  isPremium?: boolean;
  model_id?: string;
  modelId?: string;
  system_prompt?: string;
  page_title?: string;
  page_description?: string;
  slug?: string;
}

export function mapApiDoctorToUi(doctor: any): Doctor {
  let avatarPath = '/avatars/doctor-default.png'; // Устанавливаем дефолтное значение сразу

  // Проверяем сначала avatar_url, затем avatar
  const potentialPaths = [doctor.avatar_url, doctor.avatar];
  
  for (const path of potentialPaths) {
    if (path && typeof path === 'string') {
       // Проверяем, является ли путь валидным относительным путем или локальным
       if (path.startsWith('/uploads/') || path.startsWith('/avatars/') || path.startsWith('/img/')) {
         avatarPath = path;
         break; // Нашли валидный путь, выходим из цикла
       } else if (path.startsWith('http')) {
         try {
           const url = new URL(path);
           if (url.pathname.startsWith('/uploads/')) {
              avatarPath = url.pathname;
              break;
           }
         } catch (e) { /* Игнорируем ошибки парсинга URL */ }
       } else {
         // Логируем неожиданный формат, но продолжаем поиск в potentialPaths
         // console.warn(`Doctor ${doctor.id}: Unexpected avatar path format: ${path}`);
       }
    }
  }

  // Если после проверки обоих полей avatarPath все еще дефолтный, значит, валидного пути не найдено.
  // if (avatarPath === '/avatars/doctor-default.png' && (doctor.avatar_url || doctor.avatar)) {
  //     console.warn(`Doctor ${doctor.id}: Neither avatar_url ('${doctor.avatar_url}') nor avatar ('${doctor.avatar}') provided a valid relative path. Using default.`);
  // }

  return {
    id: doctor.id,
    name: doctor.name,
    specialty: doctor.specialty,
    description: doctor.description,
    avatar: avatarPath, // Сохраняем найденный относительный путь (или дефолтный)
    isPremium: doctor.is_premium,
    is_premium: doctor.is_premium,
    modelId: doctor.model_id,
    model_id: doctor.model_id,
    system_prompt: doctor.system_prompt,
    page_title: doctor.page_title,
    page_description: doctor.page_description,
    slug: doctor.slug
  };
}

export const doctors: Doctor[] = [
  {
    id: "cardio-doc",
    name: "Кардиолог",
    specialty: "Сердечно-сосудистая система",
    avatar: "/avatars/doctor-1.png",
    description: "Диагностика и лечение заболеваний сердца и сосудов",
    modelId: "claude-3-opus-20240229",
    isPremium: true
  },
  {
    id: "neuro-doc",
    name: "Невролог",
    specialty: "Нервная система",
    avatar: "/avatars/doctor-2.png",
    description: "Лечение болезней головного и спинного мозга, нервной системы",
    modelId: "claude-3-sonnet-20240229"
  },
  {
    id: "gen-doc",
    name: "Терапевт",
    specialty: "Общая практика",
    avatar: "/avatars/doctor-3.png",
    description: "Первичная диагностика и лечение распространенных заболеваний",
    modelId: "claude-3-haiku-20240307"
  },
  {
    id: "psych-doc",
    name: "Психиатр",
    specialty: "Психическое здоровье",
    avatar: "/avatars/doctor-4.png",
    description: "Лечение психических расстройств и эмоциональных проблем",
    modelId: "claude-3-sonnet-20240229",
    isPremium: true
  },
  {
    id: "derm-doc",
    name: "Дерматолог",
    specialty: "Кожные заболевания",
    avatar: "/avatars/doctor-5.png",
    description: "Диагностика и лечение заболеваний кожи, волос и ногтей",
    modelId: "claude-3-haiku-20240307",
    isPremium: true
  },
  {
    id: "ortho-doc",
    name: "Ортопед",
    specialty: "Опорно-двигательный аппарат",
    avatar: "/avatars/doctor-6.png",
    description: "Лечение травм и заболеваний костей, суставов и мышц",
    modelId: "claude-3-sonnet-20240229",
    isPremium: true
  },
  {
    id: "pedia-doc",
    name: "Педиатр",
    specialty: "Детское здоровье",
    avatar: "/avatars/doctor-7.png",
    description: "Наблюдение за здоровьем и развитием детей от рождения до 18 лет",
    modelId: "claude-3-opus-20240229",
    isPremium: true
  },
  {
    id: "gastro-doc",
    name: "Гастроэнтеролог",
    specialty: "Пищеварительная система",
    avatar: "/avatars/doctor-8.png",
    description: "Диагностика и лечение заболеваний желудка, кишечника и печени",
    modelId: "claude-3-haiku-20240307",
    isPremium: true
  },
  {
    id: "endo-doc",
    name: "Эндокринолог",
    specialty: "Эндокринная система",
    avatar: "/avatars/doctor-9.png",
    description: "Лечение нарушений работы желез внутренней секреции и гормонов",
    modelId: "claude-3-sonnet-20240229",
    isPremium: true
  },
  {
    id: "pulmo-doc",
    name: "Пульмонолог",
    specialty: "Дыхательная система",
    avatar: "/avatars/doctor-10.png",
    description: "Диагностика и лечение заболеваний легких и органов дыхания",
    modelId: "claude-3-opus-20240229",
    isPremium: true
  },
  {
    id: "onco-doc",
    name: "Онколог",
    specialty: "Онкологические заболевания",
    avatar: "/avatars/doctor-11.png",
    description: "Диагностика и лечение злокачественных опухолей и рака",
    modelId: "claude-3-haiku-20240307",
    isPremium: true
  },
  {
    id: "oph-doc",
    name: "Офтальмолог",
    specialty: "Органы зрения",
    avatar: "/avatars/doctor-12.png",
    description: "Лечение заболеваний глаз и нарушений зрения",
    modelId: "claude-3-sonnet-20240229",
    isPremium: true
  },
  {
    id: "obgyn-doc",
    name: "Гинеколог",
    specialty: "Женское здоровье",
    avatar: "/avatars/doctor-13.png",
    description: "Диагностика и лечение заболеваний женской репродуктивной системы",
    modelId: "claude-3-opus-20240229",
    isPremium: true
  },
  {
    id: "uro-doc",
    name: "Уролог",
    specialty: "Мочеполовая система",
    avatar: "/avatars/doctor-14.png",
    description: "Лечение заболеваний мочевыделительной системы и мужских половых органов",
    modelId: "claude-3-haiku-20240307",
    isPremium: true
  },
  {
    id: "rheum-doc",
    name: "Ревматолог",
    specialty: "Суставы и соединительные ткани",
    avatar: "/avatars/doctor-15.png",
    description: "Лечение аутоиммунных болезней и воспалительных заболеваний суставов",
    modelId: "claude-3-sonnet-20240229",
    isPremium: true
  }
];