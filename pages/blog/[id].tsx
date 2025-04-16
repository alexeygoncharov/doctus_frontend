import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BlogPost as BlogPostType, formatDate, getImageUrl, getPostContent, getResponsiveImageUrl } from '@/lib/blog';

interface BlogPostProps {
  post: BlogPostType | null;
}

const BlogPost: React.FC<BlogPostProps> = ({ post }) => {
  const router = useRouter();

  if (router.isFallback || !post) {
    return <div className="max-w-320 mx-auto px-4 py-20 text-center">Загрузка...</div>;
  }

  // Extract content and other attributes from the post
  const title = post.title;
  const content = getPostContent(post);
  const category = 'Здоровье'; // Default category 
  const publishedDate = formatDate(post.created_at);
  const imageUrl = getImageUrl(post);

  return (
    <>
      <Head>
        <title>{title} | Доктус</title>
        <meta name="description" content={post.summary || content.substring(0, 160)} />
      </Head>

      <section className="py-3.5 lg:py-10 px-4">
        <div className="max-w-320 mx-auto">
          <ul className="flex justify-center gap-3 md:gap-5 mb-6 text-nowrap overflow-x-auto">
            <li className="flex items-center gap-3 md:gap-5 items-center first:before:content-[none] before:content-[''] before:block before:w-5 before:h-[1px] before:bg-gray-300">
              <Link className="text-sm text-gray-500 hover:text-blue-500 transition" href="/">Главная</Link>
            </li>
            <li className="flex gap-3 md:gap-5 items-center first:before:content-[none] before:content-[''] before:block before:w-5 before:h-[1px] before:bg-gray-300">
              <Link className="text-sm text-gray-500 hover:text-blue-500 transition" href="/blog">Блог</Link>
            </li>
            <li className="flex gap-3 md:gap-5 items-center first:before:content-[none] before:content-[''] before:block before:w-5 before:h-[1px] before:bg-gray-300">
              <span className="text-sm text-gray-500">{title}</span>
            </li>
          </ul>
          
          <h1 className="text-2xl leading-[28px] sm:text-3xl sm:leading-none md:text-4xl lg:text-[44px] lg:leading-[48px] font-semibold">{title}</h1>
          
          <div className="flex gap-6 items-center mt-6 md:mt-3.5 mb-6">
            <span className="flex items-center gap-6 text-sm text-gray-500 first:before:content-[none] before:content-[''] before:block before:w-[1px] before:h-[15px] before:bg-gray-300">{publishedDate}</span>
            <span className="flex items-center gap-6 text-sm text-gray-500 first:before:content-[none] before:content-[''] before:block before:w-[1px] before:h-[15px] before:bg-gray-300">{category}</span>
          </div>
          
          <div className="rounded-lg overflow-hidden flex">
            {imageUrl && (
              <div className="relative w-full h-72 md:h-96">
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
                <Image 
                  className="w-full h-auto object-cover transition-all duration-300 ease-in-out" 
                  src={getResponsiveImageUrl(post, 1200)}
                  alt={title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 1200px"
                  quality={90}
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmVyc2lvbj0iMS4xIi8+"
                  priority
                  onLoad={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.opacity = '1';
                  }}
                  style={{ opacity: 0 }}
                />
              </div>
            )}
          </div>
          
          <div className="max-w-[993px] p-3.5 lg:px-11 lg:py-8.5 bg-white rounded-lg mt-6 lg:-mt-27 mx-auto relative">
            <div className="prose prose-lg max-w-none">
              {content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-base leading-[22px] lg:leading-[28px] mb-5">
                  {paragraph}
                </p>
              ))}
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

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const id = params?.id as string;
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/blog/${id}`);
    
    if (!response.ok) {
      return {
        notFound: true, // Return 404 page
      };
    }
    
    const post = await response.json();
    
    return {
      props: {
        post,
      },
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return {
      notFound: true,
    };
  }
};

export default BlogPost;