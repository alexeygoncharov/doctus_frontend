import Image from 'next/image';

export default function CapabilitiesSection() {
  return (
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
        </div>
      </div>
    </section>
  );
} 