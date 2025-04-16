import Image from 'next/image';

export default function LabsSection() {
  return (
    <section className="pb-10 sm:pb-15 md:py-15">
      <div className="max-w-320 mx-auto flex flex-col gap-y-2.5 md:gap-y-6 items-center md:px-4">
        <h2 className="text-base sm:text-lg font-semibold leading-[26.4px]">Работаем с результатами лабораторий</h2>
        <div className="flex md:flex-none md:grid md:grid-cols-5 gap-3.5 overflow-x-auto w-full">
          <div className="min-w-37.5 w-37.5 md:w-auto rounded-lg bg-white overflow-hidden">
            <Image className="w-full h-auto object-cover" src="/img/logos/lab1.png" alt="HELIX" width={150} height={60} />
          </div>
          <div className="min-w-37.5 w-37.5 md:w-auto rounded-lg bg-white overflow-hidden">
            <Image className="w-full h-auto object-cover" src="/img/logos/lab2.png" alt="ГЕМОТЕСТ" width={150} height={60} />
          </div>
          <div className="min-w-37.5 w-37.5 md:w-auto rounded-lg bg-white overflow-hidden">
            <Image className="w-full h-auto object-cover" src="/img/logos/lab3.png" alt="INVITRO" width={150} height={60} />
          </div>
          <div className="min-w-37.5 w-37.5 md:w-auto rounded-lg bg-white overflow-hidden">
            <Image className="w-full h-auto object-cover" src="/img/logos/lab4.png" alt="KDL" width={150} height={60} />
          </div>
          <div className="min-w-37.5 w-37.5 md:w-auto rounded-lg bg-white overflow-hidden">
            <Image className="w-full h-auto object-cover" src="/img/logos/lab5.png" alt="СМ-Клиника" width={150} height={60} />
          </div>
        </div>
      </div>
    </section>
  );
} 