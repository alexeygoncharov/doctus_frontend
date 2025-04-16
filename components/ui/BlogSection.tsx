import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost, formatDate, getPostExcerpt, getResponsiveImageUrl } from '@/lib/blog';

// Переименовываем компонент из index.tsx в BlogPreview
const BlogPreview = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/blog');
        if (!response.ok) throw new Error(`Error fetching blog posts: ${response.statusText}`);
        const data = await response.json();
        setPosts(data.slice(0, 3)); // Показываем только 3 поста
      } catch (err) {
        console.error('Error fetching blog posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <>
        {[1, 2, 3].map(i => (
          <div key={i} className="flex flex-col animate-pulse">
            <div className="rounded-xl bg-gray-200 h-[213px]"></div>
            <div className="mt-3.5 h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="mt-2 h-4 bg-gray-200 rounded w-full"></div>
            <div className="mt-1 h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="mt-2 h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="col-span-3 text-center py-8">
        Статьи отсутствуют в данный момент. Загляните позже.
      </div>
    );
  }

  return (
    <>
      {posts.map((post) => (
        <Link key={post.id} href={`/blog/${post.id}`} className="flex flex-col group">
          <div className="rounded-xl overflow-hidden md:min-h-[213px] relative h-[213px]">
            <Image 
              className="w-full h-full object-cover transition duration-400 group-hover:scale-110" 
              src={getResponsiveImageUrl(post, 600)}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px"
              quality={80}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzY4IiBoZWlnaHQ9IjQzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
              priority={post.id <= 3}
            />
          </div>
          <p className="text-xl font-semibold leading-[24px] mt-3.5 mb-2 transition group-hover:text-blue-500">
            {post.title}
          </p>
          <p className="grow text-sm text-gray-500">
            {getPostExcerpt(post, 100)}
          </p>
          <span className="mt-2 text-xs text-[#B5B9C0]">
            {formatDate(post.created_at)}
          </span>
        </Link>
      ))}
    </>
  );
};

export default function BlogSection() {
  return (
    <section className="pb-10 sm:pb-15 md:pb-12 lg:py-15 px-4 bg-gradient-to-b from-[#f9fafb] to-white">
      <div className="max-w-320 mx-auto flex flex-col gap-y-6 md:gap-y-8 lg:gap-y-10 items-center">
        <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[44px] lg:leading-[60px] font-semibold text-center text-headerText">
          Блог о здоровье
        </h2>
        <p className="text-center max-w-227.5 text-sm sm:text-base md:text-lg text-gray-600">
          Узнайте больше о здоровье, профилактике и современных методах лечения в наших статьях.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full mt-4">
           <BlogPreview />
        </div>
        <Link href="/blog" className="mt-4 inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-300">
           Все статьи блога
          <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
          </svg>
        </Link>
      </div>
    </section>
  );
} 