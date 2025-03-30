import { useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CameraModal } from '../components/chat/camera-modal';

// Импорт API функций для работы с файлами и чатами
import { analyzeFile, analyzeMultipleFiles, uploadChatFiles, createChat, sendMessage } from '../lib/api';

export default function Analysis() {
  const router = useRouter();
  const [isFileHover, setIsFileHover] = useState(false);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Обработчик загрузки файлов
  const handleFileChange = async (event) => {
    if (event.target.files?.length > 0) {
      try {
        setIsUploading(true);
        setUploadProgress(10);
        
        // Получаем файлы из input
        const selectedFiles = Array.from(event.target.files);
        
        // Анализируем файлы
        setUploadProgress(40);
        const analyzedFiles = await analyzeMultipleFiles(selectedFiles);
        setUploadProgress(70);
        
        // Устанавливаем файлы в state
        setFiles(analyzedFiles);
        setUploadProgress(100);
        
        // Переходим к расшифровке
        setTimeout(() => {
          handleStartAnalysis(analyzedFiles);
        }, 500);
      } catch (error) {
        setUploadError("Произошла ошибка при загрузке файлов. Пожалуйста, повторите попытку.");
        console.error("Error uploading files:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Обработчик перетаскивания файлов
  const handleFileDrop = async (event) => {
    event.preventDefault();
    setIsFileHover(false);
    
    if (event.dataTransfer.files?.length > 0) {
      try {
        setIsUploading(true);
        setUploadProgress(10);
        
        // Получаем файлы из drop
        const droppedFiles = Array.from(event.dataTransfer.files);
        
        // Анализируем файлы
        setUploadProgress(40);
        const analyzedFiles = await analyzeMultipleFiles(droppedFiles);
        setUploadProgress(70);
        
        // Устанавливаем файлы в state
        setFiles(analyzedFiles);
        setUploadProgress(100);
        
        // Переходим к расшифровке
        setTimeout(() => {
          handleStartAnalysis(analyzedFiles);
        }, 500);
      } catch (error) {
        setUploadError("Произошла ошибка при загрузке файлов. Пожалуйста, повторите попытку.");
        console.error("Error handling dropped files:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Обработчик для камеры - открытие модального окна
  const handleCameraClick = () => {
    setIsCameraOpen(true);
  };

  // Обработчик для полученных фотографий с камеры
  const handleCapturedImages = async (capturedImages) => {
    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      if (capturedImages.length > 0) {
        // Для каждого изображения получаем File из URL
        const imageFiles = await Promise.all(capturedImages.map(async (img, index) => {
          const response = await fetch(img.url);
          const blob = await response.blob();
          const file = new File([blob], `camera_image_${index+1}.jpg`, { type: 'image/jpeg' });
          return file;
        }));
        
        // Анализируем файлы
        setUploadProgress(40);
        const analyzedFiles = await analyzeMultipleFiles(imageFiles);
        setUploadProgress(70);
        
        // Устанавливаем файлы в state
        setFiles(analyzedFiles);
        setUploadProgress(100);
        
        // Переходим к расшифровке
        setTimeout(() => {
          handleStartAnalysis(analyzedFiles);
        }, 500);
      }
    } catch (error) {
      setUploadError("Произошла ошибка при обработке фотографий. Пожалуйста, повторите попытку.");
      console.error("Error handling captured images:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Обработчик для начала анализа и перехода в чат
  const handleStartAnalysis = async (fileList) => {
    try {
      setIsUploading(true);
      
      // Создаем новый чат с доктором "Расшифровка" (ID 20)
      const doctorId = 20; // ID доктора "Расшифровка"
      const chat = await createChat(doctorId);
      
      // Получаем ID файлов для отправки в сообщении
      const fileIds = fileList.map(file => file.id);
      
      console.log("Sending message with files:", {
        doctorId,
        chatId: chat.id,
        fileIds,
        fileNames: fileList.map(file => file.name)
      });
      
      // Сохраняем файлы в localStorage для восстановления в чате
      try {
        // Преобразуем объекты файлов в сериализуемый формат
        const filesForStorage = fileList.map(file => ({
          id: file.id,
          name: file.name,
          size: file.size,
          type: file.type,
          url: file.url || "",
        }));
        
        // Сохраняем в глобальной переменной для прямого доступа
        if (typeof window !== 'undefined') {
          window._lastUploadedFiles = filesForStorage;
        }
        
        // Сохраняем в localStorage для долгосрочного хранения
        localStorage.setItem(`chat_${chat.id}_files`, JSON.stringify(filesForStorage));
        localStorage.setItem('last_chat_id', chat.id.toString());
        console.log(`Saved ${filesForStorage.length} files to global variable and localStorage for chat ${chat.id}`);
      } catch (storageError) {
        console.error("Error saving files to storage:", storageError);
      }
      
      // Отправляем сообщение с файлами
      const message = "Здравствуйте! Я загрузил свои анализы/медицинские изображения. Пожалуйста, расшифруйте их и объясните результаты.";
      await sendMessage(doctorId, message, fileIds, chat.id);
      
      // Переходим в чат и устанавливаем параметр для активации нужного доктора
      router.push(`/consult/${chat.id}?doctor=20`);
    } catch (error) {
      setUploadError("Произошла ошибка при создании чата. Пожалуйста, повторите попытку.");
      console.error("Error starting analysis:", error);
      setIsUploading(false);
    }
  };

  return (
    <>
      <Head>
        <title>МедАссистент | Расшифровка анализов</title>
        <meta name="description" content="Мгновенная расшифровка медицинских анализов с помощью ИИ - загрузите анализы и получите подробные рекомендации" />
      </Head>

      <section className="px-0 md:px-2">
        <div className="pt-6 md:pt-15 pb-10 md:pb-20 px-4 md:rounded-2xl lg:rounded-5 bg-linear-to-b from-[#EAF1FC] to-slate-50">
          <div className="max-w-320 mx-auto flex flex-col gap-y-6 md:gap-y-8 lg:gap-y-10 items-center">
            <div className="bg-white flex items-center gap-4 md:gap-1 rounded-3xl py-2 px-4 md:px-5 max-w-64.5 md:max-w-full">
              <Image src="/icons/stars.svg" alt="Star" width={24} height={24} />
              <span className="text-xs md:text-sm">Умные советы для быстрых и достоверных результатов</span>
            </div>
            <h1 className="text-center text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold max-w-227.5">Мгновенная расшифровка медицинских анализов</h1>
            <p className="text-center max-w-227.5 text-sm sm:text-base md:text-lg lg:text-[21px] lg:-md-4 lg:-mt-5">Задайте вопрос доктору, загрузите ваши анализы, фото и получите подробную расшифровку с рекомендациями от искусственного интеллекта</p>
            <div className="flex items-center max-w-105.5 py-1 pl-1 pr-5 sm:pr-7 bg-[#DFEBFB] rounded-[72px] gap-3.5 sm:gap-5">
              <div className="flex items-center rounded-[72px] bg-white px-4.5 py-1 sm:py-1.5 gap-2.5">
                <span className="font-semibold text-base sm:text-xl leading-relaxed">5.0</span>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Image key={i} className="w-3.5 sm:w-5" src="/icons/icon-star.svg" alt="Star" width={20} height={20} />
                  ))}
                </div>
              </div>
              <p className="text-[13px] sm:text-[15px] font-medium">2000+ пользователей</p>
            </div>

            <form 
              id="form-uploads" 
              className={`bg-white rounded-xl w-full p-3.5 sm:p-6 border border-solid border-slate-200 relative ${isFileHover ? 'bg-blue-50' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsFileHover(true);
              }}
              onDragLeave={() => setIsFileHover(false)}
              onDrop={handleFileDrop}
              onSubmit={(e) => e.preventDefault()}
            >
              <p className="text-xl sm:text-2xl leading-4 font-medium">Загрузка анализов</p>
              <p className="mt-1.5 text-sm text-[#64748B]">Загрузите PDF файл или сделайте фото ваших анализов</p>
              
              {uploadError && (
                <div className="mt-3 p-2 bg-red-50 text-red-700 rounded-md text-sm">
                  {uploadError}
                </div>
              )}
              
              {isUploading ? (
                <div className="border border-dashed border-blue-500/36 py-6 sm:py-8.5 px-8.5 flex flex-col items-center gap-4 sm:gap-3 rounded-[10px] mt-3.5">
                  <div className="text-center">
                    <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-3 text-sm font-medium">Загрузка и обработка файлов...</p>
                    <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 mt-2 mb-4">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-blue-500/36 py-6 sm:py-8.5 px-8.5 flex flex-col items-center gap-4 sm:gap-3 rounded-[10px] mt-3.5">
                  <Image src="/icons/icon-upload.svg" alt="Upload" width={48} height={48} />
                  <p className="text-sm text-gray-600 text-center hidden md:block">Перетащите файлы или изображения сюда или</p>
                  <div className="flex flex-col sm:flex-row items-center gap-[5px] sm:gap-3 max-w-103">
                    <label className="flex items-center gap-4.5 rounded-md bg-[#363748] px-6 py-3.5 cursor-pointer transition-all hover:bg-blue-600">
                      <input 
                        ref={fileInputRef}
                        id="file" 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange}
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.txt"
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="stroke-slate-50">
                        <g clipPath="url(#clip0_2001_265)">
                        <path d="M7.99479 14.6666C11.6767 14.6666 14.6615 11.6818 14.6615 7.99992C14.6615 4.31802 11.6767 1.33325 7.99479 1.33325C4.31289 1.33325 1.32812 4.31802 1.32812 7.99992C1.32812 11.6818 4.31289 14.6666 7.99479 14.6666Z" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5.32812 8H10.6615" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7.99512 5.33325V10.6666" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                        </g>
                        <defs>
                        <clipPath id="clip0_2001_265">
                        <rect width="16" height="16" fill="white" transform="translate(-0.00488281)"/>
                        </clipPath>
                        </defs>
                      </svg>
                      <span className="text-slate-50 text-sm font-medium">Выберите файлы</span>
                    </label>
                    <button 
                      type="button"
                      onClick={handleCameraClick}
                      className="flex items-center gap-4.5 rounded-md bg-[#363748] px-6 py-3.5 cursor-pointer transition-all hover:bg-blue-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="stroke-slate-50">
                        <g clipPath="url(#clip0_2001_273)">
                        <path d="M9.66146 2.66675H6.32813L4.66146 4.66675H2.66146C2.30784 4.66675 1.9687 4.80722 1.71865 5.05727C1.4686 5.30732 1.32813 5.64646 1.32812 6.00008V12.0001C1.32813 12.3537 1.4686 12.6928 1.71865 12.9429C1.9687 13.1929 2.30784 13.3334 2.66146 13.3334H13.3281C13.6817 13.3334 14.0209 13.1929 14.2709 12.9429C14.521 12.6928 14.6615 12.3537 14.6615 12.0001V6.00008C14.6615 5.64646 14.521 5.30732 14.2709 5.05727C14.0209 4.80722 13.6817 4.66675 13.3281 4.66675H11.3281L9.66146 2.66675Z" stroke="#F8FAFC" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7.99512 10.6667C9.09969 10.6667 9.99512 9.77132 9.99512 8.66675C9.99512 7.56218 9.09969 6.66675 7.99512 6.66675C6.89055 6.66675 5.99512 7.56218 5.99512 8.66675C5.99512 9.77132 6.89055 10.6667 7.99512 10.6667Z" stroke="#F8FAFC" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                        </g>
                        <defs>
                        <clipPath id="clip0_2001_273">
                        <rect width="16" height="16" fill="white" transform="translate(-0.00488281)"/>
                        </clipPath>
                        </defs>
                      </svg>
                      <span className="text-slate-50 text-sm font-medium">Сделайте фото</span>
                    </button>
                  </div>
                  <p className="text-[#96A4BF] text-xs max-w-[171px] sm:max-w-full mx-auto text-center">Поддерживаемые форматы: PDF, JPG, PNG, GIF, WEBP</p>
                </div>
              )}
            </form>
            
            {/* Модальное окно камеры */}
            <CameraModal
              open={isCameraOpen}
              onClose={() => setIsCameraOpen(false)}
              onCapture={handleCapturedImages}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 w-full mt-5 md:mt-0">
              <div className="bg-white border border-solid border-slate-200 rounded-lg p-4.5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Image src="/icons/icon-home-step1.svg" alt="Загрузите результаты" width={24} height={24} />
                  <span className="font-semibold text-base sm:text-lg leading-4">Загрузите результаты</span>
                </div>
                <p className="mt-2 sm:mt-4 text-sm text-gray-600">Получите результаты расшифровки в течение <br /> нескольких минут</p>
              </div>
              <div className="bg-white border border-solid border-slate-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Image src="/icons/icon-home-step2.svg" alt="Получите ценные рекомендации" width={24} height={24} />
                  <span className="font-semibold text-base sm:text-lg leading-4">Получите ценные рекомендации</span>
                </div>
                <p className="mt-2 sm:mt-4 text-sm text-gray-600">Задайте вопросы специалисту и получите <br /> профессиональные рекомендации</p>
              </div>
              <div className="bg-white border border-solid border-slate-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Image src="/icons/icon-home-step3.svg" alt="Получите расширенный отчёт" width={24} height={24} />
                  <span className="font-semibold text-base sm:text-lg leading-4">Получите расширенный отчёт</span>
                </div>
                <p className="mt-2 sm:mt-4 text-sm text-gray-600">Отслеживайте динамику показателей вашего <br /> здоровья</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-10 sm:pb-15 md:py-15">
        <div className="max-w-320 mx-auto flex flex-col gap-y-2.5 md:gap-y-6 items-center md:px-4">
          <h2 className="text-base sm:text-lg font-semibold leading-[26.4px]">Работаем с результатами лабораторий</h2>
          <div className="flex md:flex-none md:grid md:grid-cols-5 gap-3.5 overflow-x-auto w-full">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="min-w-37.5 w-37.5 md:w-auto rounded-lg bg-white overflow-hidden">
                <Image className="w-full h-auto object-cover" src={`/images/logos/lab${num}.png`} alt={`Lab ${num}`} width={150} height={60} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-10 sm:pb-15 md:pb-12 lg:py-15 px-4" id="decoding">
        <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[44px] lg:leading-[60px] font-semibold text-center pl-3 pr-3 text-headerText">
          Что даёт расшифровка анализов онлайн
        </h2>
        <div className="max-w-320 mx-auto flex flex-col gap-y-10 md:gap-y-20 lg:gap-y-30 items-center mt-6 md:mt-10">
          <div className="flex flex-col flex-col-reverse md:flex-row md:even:flex-row-reverse justify-between items-start w-full gap-5 md:gap-4">
            <div className="max-w-154">
              <h4 className="md:text-xl lg:text-[28px] font-semibold leading-[24px] lg:leading-[46px] mb-2.5">Детальная расшифровка анализов</h4>
              <p className="text-sm lg:text-base mb-6 lg:mb-9.5">Получайте подробные отчеты о лабораторных исследованиях <br /> для лучшего понимания и проактивного управления здоровьем. Каждый отчет включает:</p>
              <ul className="flex flex-col gap-3.5 lg:gap-6 mb-6 lg:mb-9">
                <li className="flex items-start gap-3.5">
                  <Image src="/icons/icon-list.svg" alt="Icon" width={20} height={20} />
                  <div className="flex flex-col gap-1 lg:gap-2.5">
                    <span className="text-base lg:text-5 lg:leading-7.5 font-semibold">Подробная расшифровка</span>
                    <span className="text-sm lg:text-base lg:leading-[26px]">Понимание значений результатов ваших анализов с понятными объяснениями.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <Image src="/icons/icon-list.svg" alt="Icon" width={20} height={20} />
                  <div className="flex flex-col gap-1 lg:gap-2.5">
                    <span className="text-base lg:text-5 lg:leading-7.5 font-semibold">Влияние на здоровье</span>
                    <span className="text-sm lg:text-base lg:leading-[26px]">Поймите, что означают ваши результаты и на какие показатели стоит обратить особое внимание для поддержания здоровья.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <Image src="/icons/icon-list.svg" alt="Icon" width={20} height={20} />
                  <div className="flex flex-col gap-1 lg:gap-2.5">
                    <span className="text-base lg:text-5 lg:leading-7.5 font-semibold">Рекомендации</span>
                    <span className="text-sm lg:text-base lg:leading-[26px]">Получите практические советы на основе ваших лабораторных <br /> результатов для контроля и улучшения здоровья.</span>
                  </div>
                </li>
              </ul>
              <div className="flex">
                <Link href="/report" className="w-full sm:w-auto flex items-center justify-center gap-2.5 py-3.5 px-5 lg:py-5 lg:px-11 text-base text-slate-50 font-medium bg-[#363748] hover:bg-blue-500 transition rounded-lg">
                  <Image src="/icons/icon-pdf.svg" alt="PDF" width={24} height={24} />
                  Получить отчёт
                </Link>
              </div>
            </div>
            <div className="max-w-full md:max-w-90 lg:max-w-126 rounded-xl overflow-hidden">
              <Image className="w-full h-auto object-cover" src="/images/decoding-analyse1.jpg" alt="Детальная расшифровка анализов" width={500} height={375} />
            </div>
          </div>
          
          <div className="flex flex-col flex-col-reverse md:flex-row-reverse justify-between items-start w-full gap-5 md:gap-4">
            <div className="max-w-154">
              <h4 className="md:text-xl lg:text-[28px] font-semibold leading-[24px] lg:leading-[46px] mb-2.5">Консультация с доктором</h4>
              <p className="text-sm lg:text-base mb-6 lg:mb-9.5">Задайте любые вопросы о ваших анализах и получите:</p>
              <ul className="flex flex-col gap-3.5 lg:gap-6 mb-6 lg:mb-9">
                <li className="flex items-start gap-3.5">
                  <Image src="/icons/icon-list.svg" alt="Icon" width={20} height={20} />
                  <div className="flex flex-col gap-1 lg:gap-2.5">
                    <span className="text-base lg:text-5 lg:leading-7.5 font-semibold">Понятное объяснение</span>
                    <span className="text-sm lg:text-base lg:leading-[26px]">Ответим на все вопросы об анализах простым языком, <br /> без сложных медицинских терминов.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <Image src="/icons/icon-list.svg" alt="Icon" width={20} height={20} />
                  <div className="flex flex-col gap-1 lg:gap-2.5">
                    <span className="text-base lg:text-5 lg:leading-7.5 font-semibold">Рекомендации лично для вас</span>
                    <span className="text-sm lg:text-base lg:leading-[26px]">Подскажем, что конкретно вам нужно делать <br /> для улучшения здоровья.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <Image src="/icons/icon-list.svg" alt="Icon" width={20} height={20} />
                  <div className="flex flex-col gap-1 lg:gap-2.5">
                    <span className="text-base lg:text-5 lg:leading-7.5 font-semibold">Рекомендации</span>
                    <span className="text-sm lg:text-base lg:leading-[26px]">Составим пошаговый план, чтобы вы знали, что делать дальше для заботы о здоровье.</span>
                  </div>
                </li>
              </ul>
              <div className="flex">
                <Link href="/decode" className="w-full sm:w-auto flex items-center justify-center gap-2.5 py-3.5 px-5 lg:py-5 lg:px-11 text-base text-slate-50 font-medium bg-[#363748] hover:bg-blue-500 transition rounded-lg">
                  <Image src="/icons/icon-decoding-analise.svg" alt="Расшифровать анализы" width={24} height={24} />
                  Расшифровать анализы
                </Link>
              </div>
            </div>
            <div className="max-w-full md:max-w-90 lg:max-w-126 rounded-xl overflow-hidden">
              <Image className="w-full h-auto object-cover" src="/images/decoding-analyse2.jpg" alt="Консультация с доктором" width={500} height={375} />
            </div>
          </div>
        </div>
      </section>

      <section className="pb-10 sm:pb-15 md:pb-12 lg:py-15 px-4" id="capabilities">
        <div className="max-w-320 mx-auto flex flex-col gap-y-6 md:gap-y-8 lg:gap-y-10 items-center">
          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[44px] lg:leading-[60px] font-semibold text-center pl-3 pr-3 text-headerText">Наши возможности</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3.5 w-full">
            <div className="bg-white rounded-xl shadow-sm py-4 px-6 sm:p-6">
              <Image src="/icons/possibility1.svg" alt="Доступность 24/7" width={48} height={48} />
              <p className="my-2 sm:my-3.5 text-base sm:text-lg font-semibold">Доступность 24/7</p>
              <p className="text-sm sm:text-base text-gray-600 max-w-80">Получайте медицинские консультации <br /> в любое время суток, без очередей и ожидания</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Image src="/icons/possibility2.svg" alt="Точность анализа" width={48} height={48} />
              <p className="my-2 sm:my-3.5 text-base sm:text-lg font-semibold">Точность анализа</p>
              <p className="text-sm sm:text-base text-gray-600 max-w-80">Используем передовые алгоритмы ИИ для обеспечения высокой точности медицинских рекомендаций</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Image src="/icons/possibility3.svg" alt="Персонализация" width={48} height={48} />
              <p className="my-2 sm:my-3.5 text-base sm:text-lg font-semibold">Персонализация</p>
              <p className="text-sm sm:text-base text-gray-600 max-w-80">Индивидуальный подход к каждому пациенту с учетом личной медицинской истории</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Image src="/icons/possibility1.svg" alt="Доступность 24/7" width={48} height={48} />
              <p className="my-2 sm:my-3.5 text-base sm:text-lg font-semibold">Доступность 24/7</p>
              <p className="text-sm sm:text-base text-gray-600 max-w-80">Получайте медицинские консультации <br /> в любое время суток, без очередей и ожидания</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Image src="/icons/possibility2.svg" alt="Точность анализа" width={48} height={48} />
              <p className="my-2 sm:my-3.5 text-base sm:text-lg font-semibold">Точность анализа</p>
              <p className="text-sm sm:text-base text-gray-600 max-w-80">Используем передовые алгоритмы ИИ для обеспечения высокой точности медицинских рекомендаций</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Image src="/icons/possibility3.svg" alt="Персонализация" width={48} height={48} />
              <p className="my-2 sm:my-3.5 text-base sm:text-lg font-semibold">Персонализация</p>
              <p className="text-sm sm:text-base text-gray-600 max-w-80">Индивидуальный подход к каждому пациенту с учетом личной медицинской истории</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="pb-10 sm:pb-15 md:pb-12 lg:py-15 px-4">
        <div className="max-w-320 mx-auto">
          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[44px] lg:leading-[60px] font-semibold text-center pl-3 pr-3 text-headerText">Какие анализы можно расшифровать</h2>
          <p className="mt-6 sm:mt-1 text-sm md:text-base lg:text-lg text-center">Ознакомьтесь с разнообразием лабораторных исследований, которые мы анализируем и интерпретируем, помогая пациентам получать правильную медицинскую помощь.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 lg:mt-10">
            <div className="bg-white rounded-xl shadow-sm py-6 px-6 xl:px-8.5">
              <Image src="/icons/icon-what1.svg" alt="Исследования крови" width={48} height={48} />
              <p className="text-lg sm:text-5 sm:leading-9 font-semibold my-2">Исследования крови</p>
              <ul>
                <li><span className="text-sm leading-[24px] sm:leading-7 text-gray-500">Клинические исследования</span></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Общий анализ крови</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Биохимический анализ</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Анализ на гормоны</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Липидограмма</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Коагулограмма</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Анализ электролитов</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Анализ на витамины</a></li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-sm py-6 px-6 xl:px-8.5">
              <Image src="/icons/icon-what2.svg" alt="Инфекции" width={48} height={48} />
              <p className="text-lg sm:text-5 sm:leading-9 font-semibold my-2">Инфекции</p>
              <ul>
                <li><span className="text-sm leading-[24px] sm:leading-7 text-gray-500">Клинические исследования</span></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">ПЦР-тесты</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Анализы на антитела</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Бактериальные посевы</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Анализы на ЗППП</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Тесты на вирусные инфекции</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Тесты на туберкулез</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Анализы на гепатиты</a></li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-sm py-6 px-6 xl:px-8.5">
              <Image src="/icons/icon-what3.svg" alt="Аллергии" width={48} height={48} />
              <p className="text-lg sm:text-5 sm:leading-9 font-semibold my-2">Аллергии</p>
              <ul>
                <li><span className="text-sm leading-[24px] sm:leading-7 text-gray-500">Клинические исследования</span></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Определение IgE</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Анализы на пищевые аллергены</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Тесты на бытовые аллергены</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Тесты на пыльцевые аллергены</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Анализы на аллергию на лекарства</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Тесты на аллергию на животных</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Комплексные аллергопанели</a></li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-sm py-6 px-6 xl:px-8.5">
              <Image src="/icons/icon-what4.svg" alt="Онкология" width={48} height={48} />
              <p className="text-lg sm:text-5 sm:leading-9 font-semibold my-2">Онкология</p>
              <ul>
                <li><span className="text-sm leading-[24px] sm:leading-7 text-gray-500">Клинические исследования</span></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Онкомаркеры</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">ПСА (простатспецифический антиген)</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">СА-125</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">СА 15-3</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">РЭА (раково-эмбриональный антиген)</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Альфа-фетопротеин</a></li>
                <li><a className="text-sm leading-[24px] sm:leading-7 text-gray-500 hover:text-blue-500 transition" href="#">Комплексные онкопрофили</a></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-6 lg:pt-15 pb-10 lg:pb-30 px-4">
        <div className="max-w-320 mx-auto">
          <div className="bg-[#111827] rounded-2xl md:rounded-3xl py-10 lg:py-17.5 px-6.5 lg:px-12">
            <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[44px] lg:leading-[40px] font-semibold text-center text-white">Получите консультацию ИИ доктора прямо сейчас</h2>
            <p className="text-sm md:text-base lg:text-lg text-center text-gray-300 mx-auto mt-3.5 lg:mt-10">Наши AI-специалисты доступны 24/7 и готовы ответить на ваши <br /> вопросы о здоровье в любое время суток</p>
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
              <Link href="/consult" className="bg-blue-500 rounded-md flex items-center gap-2 h-12 px-8 hover:bg-blue-600 transition">
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
      </section>
    </>
  );
}