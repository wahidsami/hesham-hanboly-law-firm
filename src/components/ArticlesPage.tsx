import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  User, 
  Calendar, 
  ArrowLeft, 
  ArrowRight,
  ChevronLeft, 
  X, 
  Clock, 
  Bookmark, 
  Share2, 
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteContent } from '../content/ContentContext';

interface ArticlesPageProps {
  onScrollToContact?: () => void;
  onSelectArticle?: (id: string) => void;
}

interface Article {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string[];
  image: string;
  author: string;
  date: string;
  readTime: string;
}

export default function ArticlesPage({ onScrollToContact, onSelectArticle }: ArticlesPageProps) {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const { language } = useLanguage();
  const { content } = useSiteContent();

  // Smooth scroll back to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const articles: Article[] = (content?.articles || [])
    .filter((article) => article.published)
    .sort((left, right) => left.order - right.order)
    .map((article) => ({
      id: article.slug,
      title: language === 'ar' ? article.titleAr : article.titleEn,
      category: language === 'ar' ? article.categoryAr : article.categoryEn,
      description: language === 'ar' ? article.excerptAr : article.excerptEn,
      author: language === 'ar' ? article.authorAr : article.authorEn,
      date: article.date,
      readTime: language === 'ar' ? article.readTimeAr : article.readTimeEn,
      image: article.image,
      content: (language === 'ar' ? article.bodyAr : article.bodyEn)
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
    }));

  const selectedArticle = articles.find((article) => article.id === selectedArticleId) || null;

  const handleSaveToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedArticles.includes(id)) {
      setSavedArticles(prev => prev.filter(item => item !== id));
    } else {
      setSavedArticles(prev => [...prev, id]);
    }
  };

  const handleShare = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: title,
        url: window.location.href
      }).catch(err => console.log(err));
    } else {
      setShareFeedback(`تم نسخ رابط المقالة: "${title}" لمشاركته بنجاح.`);
      setTimeout(() => setShareFeedback(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1ECE3] overflow-x-hidden font-sans relative" style={{ direction: 'rtl' }}>
      
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[65vh] flex items-center justify-center bg-[#121212] py-28 text-white text-right overflow-hidden border-b border-[#A56A1E]/30">
        
        {/* Editorial-style background patterns and lighting ambient glows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(165,106,30,0.22)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#F1ECE3] to-transparent pointer-events-none z-10" />
        
        {/* Subtle geometric line overlay representing book spines or law scales */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="5%" y1="0" x2="15%" y2="100%" stroke="#A56A1E" strokeWidth="1.5" />
            <line x1="95%" y1="0" x2="85%" y2="100%" stroke="#A56A1E" strokeWidth="1.5" />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#A56A1E" strokeWidth="0.5" strokeDasharray="5 5" />
          </svg>
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 space-y-6">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#A56A1E]/15 border border-[#A56A1E]/30 text-xs text-[#E5D5C5] font-semibold uppercase tracking-wider"
          >
            <span className="w-2 h-2 rounded-full bg-[#A56A1E]" />
            <span>المقالات القانونية والمدونة</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight"
          >
            رؤى قانونية متخصصة ومقالات احترافية
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '4rem' }}
            transition={{ duration: 1, delay: 0.4 }}
            className="h-[2px] bg-[#A56A1E] block"
          />

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-[#E2DCD3] text-base sm:text-lg lg:text-xl font-light max-w-3xl leading-relaxed text-justify sm:text-right"
          >
            مرجع قانوني متجدد يغطي الأنظمة والتشريعات والقضايا القانونية في المملكة العربية السعودية بمحتوى احترافي موثوق يكتبه نخبة من مستشارينا المعتمدين والمحامين المتمرسين.
          </motion.p>

        </div>
      </section>


      {/* 2. EDITORIAL INTRODUCTION BLOCK */}
      <section className="py-16 bg-[#F8F5EF] relative border-b border-[#D8D1C7]/30">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#D8D1C7]/60 shadow-[0_4px_25px_-5px_rgba(30,30,30,0.03)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#A56A1E]/3 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-transparent border-l border-b border-[#A56A1E]/10 rounded-bl-3xl w-8 h-8 pointer-events-none" />
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 text-[#A56A1E] border-r-2 border-[#A56A1E] pr-3">
                <BookOpen className="w-5 h-5 stroke-[1.5]" />
                <span className="font-extrabold text-sm uppercase tracking-wider">الرسالة المعرفية للشركة</span>
              </div>
              
              <p className="text-[#1E1E1E] text-sm sm:text-base leading-loose font-normal text-justify">
                تعتبر مدونة شركة هشام حسن حنبولي الدولية للاستشارات القانونية والمحاماة مرجعًا أساسيًا لكل من يبحث عن معلومات قانونية مفيدة ومتخصصة، وتضم المدونة مقالات متنوعة ومحدثة بانتظام تغطي مجموعة واسعة من المواضيع القانونية المهمة والمتعلقة بالقوانين والتشريعات في المملكة العربية السعودية وخارجها وأي استشارات قانونية قد تحتاج إليها.
              </p>

              <p className="text-[#5B5B5B] text-sm leading-loose font-light text-justify pt-1 border-t border-[#D8D1C7]/20">
                سواء كنت محاميًا محترفًا أو فردًا يبحث عن استشارات قانونية، ستجد في هذه المدونة الإجابات والتوجيهات التي تحتاج إليها لحماية حقوقك وتحقيق تماسك منشآتك واستثماراتك بأرقى مستويات الفقه والتحليل النظامي.
              </p>
            </div>
          </div>

        </div>
      </section>


      {/* 3. FEATURED ARTICLES SECTION */}
      <section className="py-20 sm:py-28 bg-[#F1ECE3] relative">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-16 border-b border-[#D8D1C7]/40 pb-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#A56A1E] tracking-widest block">الدراسات والأبحاث والمقالات المنشورة</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E]">رؤى قانونية من كبار الشركاء والمحامين</h2>
            </div>
            
            <div className="text-xs font-mono font-bold text-[#7B5A42] bg-[#A56A1E]/10 px-3 py-1.5 rounded-lg border border-[#A56A1E]/20">
              تصفح {articles.length} منشورات رئيسية
            </div>
          </div>

          {/* Luxury Editorial Grid of exactly 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((item, index) => {
              const isSaved = savedArticles.includes(item.id);
              return (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, boxShadow: '0 25px 45px -20px rgba(165,106,30,0.12)' }}
                  className="rounded-2xl bg-white border border-[#D8D1C7] flex flex-col justify-between overflow-hidden shadow-xs relative group/card transition-all duration-300"
                >
                  
                  {/* Aspect Ratio 16/9 Featured Image */}
                  <div className="relative aspect-video w-full overflow-hidden bg-[#F8F5EF] border-b border-[#D8D1C7]/30">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Floating Category Badge and Quick Tools */}
                    <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-auto">
                      <span className="px-3 py-1 text-[11px] font-bold text-white bg-[#A56A1E] rounded-full shadow-xs border border-[#A56A1E]/20">
                        {item.category}
                      </span>

                      <div className="flex gap-2">
                        {/* Save item Button */}
                        <button
                          onClick={(e) => handleSaveToggle(item.id, e)}
                          className={`w-8 h-8 rounded-full border bg-white/95 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer ${
                            isSaved 
                              ? 'border-[#A56A1E] text-[#A56A1E]' 
                              : 'border-[#D8D1C7]/60 text-gray-500 hover:text-[#A56A1E] hover:border-[#A56A1E]'
                          }`}
                          title={isSaved ? "إلغاء حفظ المقال" : "حفظ المقال للرجوع إليه لاحقاً"}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#A56A1E]' : ''}`} />
                        </button>

                        {/* Share item Button */}
                        <button
                          onClick={(e) => handleShare(item.title, e)}
                          className="w-8 h-8 rounded-full border border-[#D8D1C7]/60 bg-white/95 backdrop-blur-md flex items-center justify-center text-gray-500 hover:text-[#A56A1E] hover:border-[#A56A1E] transition-all cursor-pointer"
                          title="مشاركة المقال"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Content body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4 text-right">
                    
                    <div className="space-y-2">
                      {/* Metadata Row */}
                      <div className="flex items-center gap-4 text-[11px] text-gray-500 font-medium">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-[#A56A1E]/70" />
                          <span>{item.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#A56A1E]/70" />
                          <span>{item.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#A56A1E]/70" />
                          <span>{item.readTime}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-bold text-[#1E1E1E] leading-snug group-hover/card:text-[#A56A1E] transition-colors duration-300">
                        {item.title}
                      </h3>

                      {/* Short Description */}
                      <p className="text-xs text-[#5B5B5B] font-light leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    {/* Bottom Action CTA */}
                    <div className="pt-4 border-t border-[#D8D1C7]/30 flex items-center justify-between">
                      <button
                        onClick={() => {
                          if (onSelectArticle) {
                            onSelectArticle(item.id);
                          } else {
                            setSelectedArticleId(item.id);
                          }
                        }}
                        className="text-[#A56A1E] text-xs font-bold hover:text-[#946B4B] flex items-center gap-1.5 transition-all group/btn cursor-pointer"
                      >
                        <span>إقرأ المزيد</span>
                        <ChevronLeft className="w-3.5 h-3.5 transition-transform duration-300 transform group-hover/btn:-translate-x-1" />
                      </button>

                      <span className="text-[10px] text-gray-400 font-mono">
                        #{item.id}
                      </span>
                    </div>

                  </div>

                </motion.article>
              );
            })}
          </div>

          {/* 4. LOAD MORE / FUTURE CMS PAGINATION SEC */}
          <div className="mt-20 text-center">
            <div className="inline-flex flex-col items-center gap-3">
              <div className="h-[1px] w-24 bg-[#D8D1C7]/80" />
              <p className="text-xs sm:text-sm text-gray-500 font-light tracking-wide italic">
                المزيد من المقالات والدراسات والبحوث النخبوية قريباً
              </p>
              <div className="flex gap-2 mt-2">
                <button 
                  disabled
                  className="w-10 h-10 rounded-full border border-gray-300/65 flex items-center justify-center text-gray-400 cursor-not-allowed"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  disabled
                  className="w-10 h-10 rounded-full border border-gray-300/65 flex items-center justify-center text-gray-400 cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* 5. EXECUTIVE CONSULTATION CTA */}
      <section className="relative py-24 bg-[#121212] text-white overflow-hidden text-center sm:text-right">
        
        {/* Abstract legal textures / floating gold particle system */}
        <div className="absolute inset-0 bg-[#121212] opacity-100" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(165,106,30,0.18)_0%,transparent_60%)] pointer-events-none" />
        
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20%" cy="30%" r="200" fill="#A56A1E" filter="blur(70px)" />
            <circle cx="80%" cy="70%" r="250" fill="#7B5A42" filter="blur(90px)" />
          </svg>
        </div>

        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-right">
            
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-bold text-[#A56A1E] tracking-widest uppercase block border-r-2 border-[#A56A1E] pr-3">
                التميز المهني والملاءمة الإستراتيجية لمصالحكم
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                هل تحتاج إلى استشارة قانونية متخصصة؟
              </h2>
              <p className="text-sm sm:text-base text-gray-300 font-light max-w-2xl leading-relaxed text-justify sm:text-right">
                فريقنا القانوني جاهز لتقديم الدعم والاستشارات القانونية الاحترافية للأفراد والشركات بمختلف القوانين والمنازعات الكبرى بالمملكة.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4 justify-end">
              <button 
                onClick={onScrollToContact}
                className="px-8 py-3.5 rounded-xl bg-[#A56A1E] hover:bg-[#946B4B] text-white text-xs font-bold font-sans transition-all duration-300 shadow-[0_10px_35px_rgba(165,106,30,0.3)] shadow-[#A56A1E]/25 text-center cursor-pointer active:scale-98"
              >
                احجز استشارة
              </button>
              
              <button 
                onClick={onScrollToContact}
                className="px-8 py-3.5 rounded-xl bg-transparent hover:bg-white/5 text-white border border-white/20 hover:border-white/40 text-xs font-bold font-sans transition-all duration-300 text-center cursor-pointer"
              >
                تواصل معنا
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Share item toast/notification popup overlay */}
      {shareFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121212] text-white text-sm py-3 px-5 rounded-xl border border-[#A56A1E]/40 flex items-center gap-3 shadow-lg max-w-md animate-fade-in-up">
          <div className="w-5 h-5 rounded-full bg-[#A56A1E]/20 flex items-center justify-center text-[#A56A1E]">
            <CheckCircle className="w-3.5 h-3.5" />
          </div>
          <span>{shareFeedback}</span>
        </div>
      )}

      {/* 6. FULL READING DRAWER MODAL OVERLAY */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 md:p-8"
            style={{ direction: 'rtl' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[#F8F5EF] border border-[#D8D1C7] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative block"
            >
              
              {/* Header sticky tools bar */}
              <div className="sticky top-0 bg-[#F8F5EF]/95 backdrop-blur-md px-6 sm:px-8 py-4 border-b border-[#D8D1C7]/40 flex justify-between items-center z-30">
                <span className="text-xs font-bold text-[#A56A1E] font-mono tracking-widest uppercase bg-[#A56A1E]/10 px-3 py-1 rounded">
                  المطبوعات القانونية المعتمدة
                </span>

                <button 
                  onClick={() => setSelectedArticleId(null)}
                  className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black border border-[#D8D1C7]/40 transition-colors cursor-pointer"
                  title="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cover Art Banner Image */}
              <div className="relative aspect-[21/9] w-full bg-[#121212] overflow-hidden border-b border-[#D8D1C7]/30">
                <img 
                  src={selectedArticle.image} 
                  alt={selectedArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#F8F5EF] via-transparent to-black/30" />
              </div>

              {/* Main reading content body */}
              <div className="p-6 sm:p-10 space-y-8 text-right">
                
                {/* Taxonomy and author info header */}
                <div className="space-y-4">
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 bg-[#A56A1E] text-white font-extrabold text-[10px] sm:text-xs rounded-full">
                      {selectedArticle.category}
                    </span>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-xs text-gray-500 font-medium">زمن القراءة المقدر: {selectedArticle.readTime}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] leading-normal">
                    {selectedArticle.title}
                  </h2>

                  {/* Metadata cards */}
                  <div className="flex flex-wrap items-center gap-6 py-3 border-y border-[#D8D1C7]/40 text-xs text-gray-500 font-medium font-sans">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#A56A1E]/10 flex items-center justify-center text-[#A56A1E]">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-light">الكاتب المعتمد</span>
                        <span className="font-extrabold text-[#1E1E1E]">{selectedArticle.author}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#A56A1E]/10 flex items-center justify-center text-[#A56A1E]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-light">تاريخ النشر</span>
                        <span className="font-extrabold text-[#1E1E1E]">{selectedArticle.date}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Editorial text blocks */}
                <div className="space-y-6 text-sm sm:text-base text-[#1E1E1E] leading-loose text-justify font-light">
                  {selectedArticle.content.map((paragraph, pIdx) => (
                    <p key={pIdx} className="first-letter:font-extrabold first-letter:text-[#A56A1E]">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Bottom interactive footer panel */}
                <div className="pt-8 border-t border-[#D8D1C7]/40 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-xs text-gray-500 italic max-w-md text-right leading-relaxed">
                    * يسعدنا في شركة هشام حسن حنبولي الدولية توفير نخبة الاستشارات والتحليلات الائتمانية والوقائية لحماية أصولكم وأعمالكم الاستثمارية.
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        setSelectedArticleId(null);
                        if (onScrollToContact) onScrollToContact();
                      }}
                      className="px-6 py-2.5 rounded-xl bg-[#A56A1E] hover:bg-[#946B4B] text-white text-xs font-bold transition-all shadow-md cursor-pointer text-center"
                    >
                      طلب استشارة بخصوص هذا الموضوع
                    </button>
                    
                    <button 
                      onClick={() => setSelectedArticleId(null)}
                      className="px-6 py-2.5 rounded-xl bg-transparent hover:bg-gray-200 border border-gray-300 text-gray-700 text-xs font-semibold transition-all cursor-pointer text-center"
                    >
                      إغلاق القراءة
                    </button>
                  </div>
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
