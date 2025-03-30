import { Brain, Stethoscope, LineChart, Lock, Bot, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            МедАссистент
          </h1>
          
          <div className="max-w-3xl mx-auto mb-12 px-6 py-8 bg-white rounded-xl shadow-sm">
            <p className="text-gray-700 leading-relaxed">
              МедАссистент - это инновационный сервис, разработанный командой экспертов в области медицины и искусственного интеллекта. 
              Мы помогаем пациентам и врачам быстро анализировать медицинские данные, предоставляя точные результаты и рекомендации в понятном формате.
              Наша система использует передовые алгоритмы машинного обучения, обученные на миллионах медицинских записей, что позволяет достигать высокой точности в расшифровке анализов.
              Безопасность и конфиденциальность ваших данных - наш главный приоритет, поэтому мы используем современные методы шифрования и защиты информации.
              Сервис доступен 24/7, что позволяет получить результаты в любое удобное время, а наша служба поддержки всегда готова помочь с любыми вопросами.
            </p>
          </div>

          <p className="text-xl text-gray-600 mb-8">
            Инновационная платформа для анализа медицинских данных с использованием искусственного интеллекта
          </p>

        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Наши возможности</h2>
            <p className="text-xl text-gray-600">Используйте все преимущества современных технологий</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group hover:bg-blue-50 transition-all duration-300 p-6 rounded-xl border border-gray-100 shadow-sm"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const features = [
  {
    icon: <Brain className="w-6 h-6 text-blue-600" />,
    title: "ИИ Анализ",
    description: "Мгновенная расшифровка медицинских анализов с помощью искусственного интеллекта"
  },
  {
    icon: <Stethoscope className="w-6 h-6 text-blue-600" />,
    title: "Консультации",
    description: "Профессиональные консультации от квалифицированных специалистов"
  },
  {
    icon: <LineChart className="w-6 h-6 text-blue-600" />,
    title: "Мониторинг",
    description: "Отслеживание динамики показателей здоровья в реальном времени"
  },
  {
    icon: <Lock className="w-6 h-6 text-blue-600" />,
    title: "Безопасность",
    description: "Надежная защита персональных данных и медицинской информации"
  },
  {
    icon: <Bot className="w-6 h-6 text-blue-600" />,
    title: "Умные алгоритмы",
    description: "Передовые технологии машинного обучения для точных результатов"
  },
  {
    icon: <Users className="w-6 h-6 text-blue-600" />,
    title: "Поддержка 24/7",
    description: "Круглосуточная поддержка пользователей по всем вопросам"
  }
];