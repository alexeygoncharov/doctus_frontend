import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { formatDate, getImageUrl, getPostExcerpt, getResponsiveImageUrl } from '@/lib/blog';
import { BlogPost } from '@/lib/blog';
import MainLayout from '@/components/layout/MainLayout';

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/blog');
        
        if (!response.ok) {
          throw new Error(`Error fetching blog posts: ${response.statusText}`);
        }
        
        const data = await response.json();
        setPosts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Не удалось загрузить статьи блога. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <>
      <Head>
        <title>Блог | МедАссистент</title>
        <meta name="description" content="Медицинский блог с полезной информацией о здоровье, анализах и медицинских исследованиях" />
      </Head>

      <section className="py-6 md:py-15 px-4">
        <div className="max-w-320 mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Блог МедАссистент</h1>
          
          {loading && (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {!loading && !error && (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mt-6">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.id}`} className="flex flex-col group">
                    <div className="rounded-xl overflow-hidden md:min-h-[213px] relative h-[213px]">
                      <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl" />
                      <Image 
                        className="w-full h-full object-cover transition-all duration-300 ease-in-out group-hover:scale-110" 
                        src={getResponsiveImageUrl(post, 800)}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 33vw, 400px"
                        quality={80}
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzY4IiBoZWlnaHQ9IjQzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
                        priority={post.id <= 3} // Prioritize loading for first 3 images
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.opacity = '1';
                        }}
                        style={{ opacity: 0 }}
                      />
                    </div>
                    <p className="text-xl font-semibold leading-[24px] mt-3.5 mb-2 transition group-hover:text-blue-500">
                      {post.title}
                    </p>
                    <p className="grow text-sm text-gray-500">
                      {getPostExcerpt(post, 150)}
                    </p>
                    <span className="mt-2 text-xs text-[#B5B9C0]">
                      {formatDate(post.created_at)}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  Статьи отсутствуют в данный момент. Загляните позже.
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      
      <section className="pt-6 lg:pt-15 pb-10 lg:pb-30 px-4">
        <div className="max-w-320 mx-auto">
          <div className="bg-[#111827] rounded-2xl md:rounded-3xl py-10 lg:py-17.5 px-6.5 lg:px-12">
            <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[44px] lg:leading-[40px] font-semibold text-center text-white">Получите консультацию ИИ доктора прямо сейчас</h2>
            <p className="text-sm md:text-base lg:text-lg text-center text-gray-300 mx-auto mt-3.5 lg:mt-10">Наши AI-специалисты доступны 24/7 и готовы ответить на ваши <br /> вопросы о здоровье в любое время суток</p>
            <div className="flex flex-col md:flex-row items-start md:items-center md:justify-center gap-4 md:gap-6 mt-6 lg:mt-10 max-w-[279px] md:max-w-full mx-auto">
              <div className="flex items-center gap-2">
                <Image src="/images/icons/icon-consult1.svg" alt="Доступно 24/7" width={24} height={24} />
                <span className="text-sm md:text-[15px] leading-6 text-gray-300">Доступно 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <Image src="/images/icons/icon-consult2.svg" alt="Мгновенные ответы" width={24} height={24} />
                <span className="text-sm md:text-[15px] leading-6 text-gray-300">Мгновенные ответы</span>
              </div>
              <div className="flex items-center gap-2">
                <Image src="/images/icons/icon-consult3.svg" alt="Профессиональная консультация" width={24} height={24} />
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
};

export default BlogPage;