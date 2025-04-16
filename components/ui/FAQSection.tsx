export default function FAQSection() {
  return (
    <section className="pb-10 sm:pb-15 md:pb-12 lg:py-15 px-4">
      <div className="max-w-320 mx-auto">
        <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[44px] lg:leading-[60px] font-semibold text-center pl-3 pr-3 text-headerText">Часто задаваемые вопросы</h2>
        <div className="flex flex-col gap-1 md:gap-2.5 mt-6 lg:mt-10">
          <details className="open:shadow-sm bg-white border rounded-[10px] border-[#F6F6F6] py-3.5 md:py-5 px-5 md:px-7.5 cursor-pointer group">
            <summary className="text-base md:text-lg text-[#222222] leading-7 font-semibold flex items-center justify-between select-none">
              Может ли ИИ доктор действительно помочь?
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-[[open]]:rotate-180">
                <path d="M5.99998 9L12.0001 15.0001L18 9" stroke="#3B82F6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </summary>
            <div className="text-sm text-gray-500 mt-2.5 transition-all">Да! Наш ИИ доктор обучен на огромном массиве медицинских данных и научных исследований, что позволяет ему давать точные и актуальные рекомендации прямо сейчас. Он помогает расшифровывать анализы, интерпретировать симптомы и предоставлять информацию по лечению. При этом важно помнить, что ИИ консультация не заменяет очный визит к врачу при серьезных состояниях.</div>
          </details>
          <details className="open:shadow-sm bg-white border rounded-[10px] border-[#F6F6F6] py-3.5 md:py-5 px-5 md:px-7.5 cursor-pointer group">
            <summary className="text-base md:text-lg text-[#222222] leading-7 font-semibold flex items-center justify-between select-none">
              Насколько точны рекомендации ИИ доктора?
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-[[open]]:rotate-180">
                <path d="M5.99998 9L12.0001 15.0001L18 9" stroke="#3B82F6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </summary>
            <div className="text-sm text-gray-500 mt-2.5 transition-all">Точность наших ИИ-докторов превышает 95% при интерпретации медицинских анализов и 90% при оценке распространенных заболеваний. Система постоянно обучается на новейших медицинских исследованиях и клинических рекомендациях. При сложных случаях ИИ всегда указывает на необходимость очной консультации и не дает рекомендаций, если уровень уверенности недостаточно высок.</div>
          </details>
          <details className="open:shadow-sm bg-white border rounded-[10px] border-[#F6F6F6] py-3.5 md:py-5 px-5 md:px-7.5 cursor-pointer group">
            <summary className="text-base md:text-lg text-[#222222] leading-7 font-semibold flex items-center justify-between select-none">
              Как быстро я получу ответ на свой вопрос?
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-[[open]]:rotate-180">
                <path d="M5.99998 9L12.0001 15.0001L18 9" stroke="#3B82F6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </summary>
            <div className="text-sm text-gray-500 mt-2.5 transition-all">Мгновенно! Наш ИИ доктор отвечает за считанные секунды, даже на сложные медицинские вопросы. В отличие от обычных консультаций, где нужно ждать записи или стоять в очереди, наш сервис доступен 24/7 и мгновенно обрабатывает запросы. Даже для анализа загруженных результатов исследований системе требуется всего 10-15 секунд.</div>
          </details>
          <details className="open:shadow-sm bg-white border rounded-[10px] border-[#F6F6F6] py-3.5 md:py-5 px-5 md:px-7.5 cursor-pointer group">
            <summary className="text-base md:text-lg text-[#222222] leading-7 font-semibold flex items-center justify-between select-none">
              Безопасны ли мои медицинские данные?
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-[[open]]:rotate-180">
                <path d="M5.99998 9L12.0001 15.0001L18 9" stroke="#3B82F6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </summary>
            <div className="text-sm text-gray-500 mt-2.5 transition-all">Абсолютно! Мы используем медицинский стандарт шифрования HIPAA для защиты всех ваших данных. Ваша конфиденциальность — наш приоритет. Мы не передаем данные третьим лицам и не используем их в рекламных целях. Вы можете в любой момент запросить полное удаление своих данных из нашей системы.</div>
          </details>
          <details className="open:shadow-sm bg-white border rounded-[10px] border-[#F6F6F6] py-3.5 md:py-5 px-5 md:px-7.5 cursor-pointer group">
            <summary className="text-base md:text-lg text-[#222222] leading-7 font-semibold flex items-center justify-between select-none">
              Сколько стоит консультация ИИ доктора?
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-[[open]]:rotate-180">
                <path d="M5.99998 9L12.0001 15.0001L18 9" stroke="#3B82F6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </summary>
            <div className="text-sm text-gray-500 mt-2.5 transition-all">Мы предлагаем гибкую систему оплаты. Базовая консультация доступна бесплатно, а расширенные возможности и детальная расшифровка анализов доступны в рамках наших доступных тарифных планов. Стоимость полного доступа в 5-10 раз ниже, чем средняя стоимость очной консультации врача. Оплата разовая или по подписке — выбирайте, что удобнее.</div>
          </details>
          <details className="open:shadow-sm bg-white border rounded-[10px] border-[#F6F6F6] py-3.5 md:py-5 px-5 md:px-7.5 cursor-pointer group">
            <summary className="text-base md:text-lg text-[#222222] leading-7 font-semibold flex items-center justify-between select-none">
              Могу ли я показать ИИ доктору свои анализы?
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-[[open]]:rotate-180">
                <path d="M5.99998 9L12.0001 15.0001L18 9" stroke="#3B82F6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </summary>
            <div className="text-sm text-gray-500 mt-2.5 transition-all">Да, это основная функция сервиса! Просто загрузите фото ваших анализов или PDF-файл, и ИИ мгновенно расшифрует все показатели, выделит отклонения от нормы и предоставит понятные объяснения. Система работает с результатами всех основных лабораторий, включая Инвитро, Гемотест, Хеликс, КДЛ и другие.</div>
          </details>
          <details className="open:shadow-sm bg-white border rounded-[10px] border-[#F6F6F6] py-3.5 md:py-5 px-5 md:px-7.5 cursor-pointer group">
            <summary className="text-base md:text-lg text-[#222222] leading-7 font-semibold flex items-center justify-between select-none">
              Заменяет ли ИИ доктор настоящего врача?
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-[[open]]:rotate-180">
                <path d="M5.99998 9L12.0001 15.0001L18 9" stroke="#3B82F6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </summary>
            <div className="text-sm text-gray-500 mt-2.5 transition-all">ИИ доктор — это мощный инструмент для первичной консультации, расшифровки анализов и получения медицинской информации, но он не заменяет полностью очного врача. В экстренных случаях или при серьезных заболеваниях система всегда рекомендует обратиться к специалисту. ИИ доктор идеален для предварительной оценки состояния, мониторинга хронических заболеваний и проверки результатов анализов.</div>
          </details>
        </div>
      </div>
    </section>
  );
} 