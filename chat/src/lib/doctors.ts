export interface Doctor {
  avatar: string;
  description: string;
  id: string;
  isPremium?: boolean;
  modelId: string;
  name: string;
  specialty: string;
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