import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/pages/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setPage(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-[60vh] max-w-4xl flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-theme-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-[60vh] max-w-4xl text-center">
        <h1 className="text-4xl font-bebas tracking-wide mb-4 text-white">404</h1>
        <p className="text-gray-400">La página no existe o aún no ha sido configurada.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 min-h-[60vh] max-w-4xl text-gray-300 space-y-6">
      <h1 className="text-5xl font-bebas tracking-wide mb-8 text-white uppercase">{page.title}</h1>
      <div 
        className="dynamic-content max-w-none text-base leading-relaxed space-y-4" 
        dangerouslySetInnerHTML={{ __html: page.content }} 
      />
      <style>{`
        .dynamic-content h1, .dynamic-content h2, .dynamic-content h3, .dynamic-content h4 { 
          color: var(--theme-text-header, #ffffff); 
          font-weight: bold; 
          margin-top: 1.5em; 
          margin-bottom: 0.5em; 
        }
        .dynamic-content h2 { font-size: 1.5rem; }
        .dynamic-content p { 
          color: var(--theme-text-body, #d1d5db); 
          margin-bottom: 1em; 
        }
        .dynamic-content ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
        .dynamic-content li { 
          color: var(--theme-text-body, #d1d5db); 
          margin-bottom: 0.5em; 
        }
        .dynamic-content strong { 
          color: var(--theme-text-header, #ffffff); 
        }
      `}</style>
    </div>
  );
}
