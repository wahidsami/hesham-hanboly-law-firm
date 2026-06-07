import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Bookmark, 
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteContent } from '../content/ContentContext';
import { contentClient } from '../content/contentClient';
import type { CMSPublishedPageRecord } from '../types';

interface TeamPageProps {
  onScrollToContact: () => void;
  onBackToHome?: () => void;
}

function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

export default function TeamPage({ onScrollToContact, onBackToHome }: TeamPageProps) {
  const { direction, language, t } = useLanguage();
  const { content } = useSiteContent();
  const siteSettings = content?.siteSettings;
  const [teamCmsPage, setTeamCmsPage] = useState<CMSPublishedPageRecord | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCmsTeam() {
      try {
        const page = await contentClient.getCmsPage('team');
        if (!cancelled) {
          setTeamCmsPage(page);
        }
      } catch {
        if (!cancelled) {
          setTeamCmsPage(null);
        }
      }
    }

    void loadCmsTeam();
    return () => {
      cancelled = true;
    };
  }, []);

  const teamBlocks = useMemo(
    () => teamCmsPage?.blocks?.filter((block) => block.type === 'team') ?? [],
    [teamCmsPage]
  );

  const teamPageBlocks = useMemo(
    () => teamCmsPage?.blocks ?? [],
    [teamCmsPage]
  );

  const teamCtaBlock = useMemo(
    () => teamPageBlocks.find((block) => block.type === 'cta') ?? null,
    [teamPageBlocks]
  );

  const leadership = useMemo(() => {
    const items = Array.isArray(teamBlocks[0]?.data?.items)
      ? (teamBlocks[0].data.items as Array<Record<string, unknown>>)
      : [];
    if (items.length === 0) {
      return [
        {
          name: t('المحامي / هشام بن حسن حنبولي', 'Advocate / Hesham H. Hanboly'),
          role: t('مدير عام الشركة', 'Managing Director of the Firm'),
          desc: t(
            'محامي ومستشار قانوني وعضو الهيئة السعودية للمحامين ومحكم معتمد وعضو لجنة المحامين بالغرفة التجارية بمحافظة جدة. يمتلك خبرة قضائية عريقة في تحصين وصياغة الاستراتيجيات الوقائية للشركات والمجموعات الاستثمارية الكبرى.',
            'Attorney-at-Law, Legal Practitioner, member of the Saudi Bar Association, certified Arbitrator, and board member of the Lawyers’ Committee at the Jeddah Chamber of Commerce. He possesses immense judicial expertise in safeguarding corporate interests and structuring preventative strategies for leading commercial conglomerates.'
          ),
          image: '/src/assets/images/founder_hesham_hanboly_1780491593879.png',
          featured: true,
          credentials: [
            t('عضو لجنة المحامين بالغرفة التجارية بجدة', 'Board Member, Lawyers Committee, Jeddah Chamber of Commerce'),
            t('محكم قضائي معتمد لدى وزارة العدل', 'Certified Arbitrator, Saudi Ministry of Justice'),
            t('عضو الهيئة السعودية للمحامين', 'Member of the Saudi Bar Association (SBA)'),
            t('ممارس قانوني بخبرة تتجاوز العقدين', 'Practicing Attorney with over Two Decades of Legal Tenure')
          ]
        },
        {
          name: t('المحامي / عبد الله هشام حنبولي', 'Advocate / Abdullah Hesham Hanboly'),
          role: t('نائب المدير العام', 'Deputy Managing Director'),
          desc: t(
            'محامي ومستشار قانوني وعضو الهيئة السعودية للمحامين حاصل على بكالوريوس الدراسات القانونية من جامعة جانون بالولايات المتحدة الأمريكية. خبير في الاستشارات الوقائية وصياغة العقود المتطابقة مع الأنظمة المحلية والاتفاقيات الدولية.',
            'Advocate, Legal Advisor, and member of the Saudi Bar Association, holding his Bachelor of Arts in Legal Studies from Gannon University, USA. Specialist in defensive legal counseling and structuring agreements in absolute sync with regional frameworks and international commerce standards.'
          ),
          image: '/src/assets/images/deputy_abdullah_1780495865817.png',
          credentials: [
            t('بكالوريوس الدراسات القانونية - جامعة جانون الأمريكية', 'B.A. in Legal Studies - Gannon University, USA'),
            t('عضو الهيئة السعودية للمحامين', 'Member of the Saudi Bar Association'),
            t('متخصص في صياغة العقود الاستثمارية العابرة للحدود', 'Specialist in Drafting Multi-Jurisdictional Investment Accords')
          ]
        },
        {
          name: t('المحامي / سامي هشام حنبولي', 'Advocate / Sami Hesham Hanboly'),
          role: t('مدير فرع الشركة بالرياض', 'Riyadh Branch Director'),
          desc: t(
            'محامي ومستشار قانوني وعضو الهيئة السعودية للمحامين حاصل على بكالوريوس أنظمة من جامعة الملك عبدالعزيز. يشرف على المرافعة والتمثيل وتوفير الدعم الوقائي والامتثال لشركاء النجاح في العاصمة الرياض.',
            'Advocate, Legal Advisor, and member of the Saudi Bar Association, holding a Bachelor of Laws (LL.B.) from King Abdulaziz University. He oversees proactive litigation, corporate representation, and compliance structures for our partners in Riyadh.'
          ),
          image: '/src/assets/images/manager_sami_1780495881512.png',
          credentials: [
            t('بكالوريوس أنظمة - جامعة الملك عبدالعزيز', 'LL.B. (Bachelor of Laws) - King Abdulaziz University'),
            t('عضو الهيئة السعودية للمحامين', 'Member of the Saudi Bar Association'),
            t('مدير العمليات والتمثيل القضائي لشركائنا بالرياض', 'Director of Litigation Operations & Client Advocacy in Riyadh')
          ]
        }
      ];
    }

    return items.map((item, index) => {
      const credentials = toStringList(item.credentialsAr ?? item.credentialsEn ?? item.credentials);
      return {
        name: language === 'ar' ? toStringValue(item.nameAr, '') : toStringValue(item.nameEn, ''),
        role: language === 'ar' ? toStringValue(item.roleAr, '') : toStringValue(item.roleEn, ''),
        desc: language === 'ar' ? toStringValue(item.bioAr, '') : toStringValue(item.bioEn, ''),
        image: toStringValue(item.imageUrl, index === 0 ? '/src/assets/images/founder_hesham_hanboly_1780491593879.png' : ''),
        featured: index === 0,
        credentials: credentials.length > 0
          ? credentials
          : [language === 'ar' ? toStringValue(item.bioAr, '') : toStringValue(item.bioEn, '')].filter(Boolean),
      };
    });
  }, [language, teamBlocks, t]);

  const consultants = useMemo(() => {
    const items = Array.isArray(teamBlocks[1]?.data?.items)
      ? (teamBlocks[1].data.items as Array<Record<string, unknown>>)
      : [];
    if (items.length === 0) {
      return [
        {
          name: t('المحامي / عبدالرحمن سعد عبدالرحمن المرزوقي', 'Advocate / Abdulrahman S. Al-Marzouqi'),
          role: t('محامٍ ومستشار قانوني', 'Advocate & Legal Consultant'),
          desc: t(
            'عضو الهيئة السعودية للمحامين حاصل على بكالوريوس أنظمة من جامعة الملكعبدالعزيز ومختص بتقديم الحلول القضائية الفعالة.',
            'Member of the Saudi Bar Association, holding detailed expertise with a Bachelor of Laws (LL.B.) from King Abdulaziz University.'
          )
        },
        {
          name: t('المحامية / شروق ياسر عيسى فيومي', 'Advocate / Shouroq Yasser Fayoumi'),
          role: t('محامية ومستشارة قانونية', 'Advocate & Legal Consultant'),
          desc: t(
            'عضو الهيئة السعودية للمحامين حاصلة على بكالوريوس أنظمة من جامعة الملك عبدالعزيز وتتمتع بخبرة رفيعة في المسارات العمالية للمنشآت.',
            'Member of the Saudi Bar Association, holding a Bachelor of Laws (LL.B.) from King Abdulaziz University with emphasis on employment and corporate law.'
          )
        },
        {
          name: t('المحامية / أميرة إبراهيم سليمان الغامدي', 'Advocate / Amira Ibrahim Al-Ghamdi'),
          role: t('محامية ومستشارة قانونية', 'Advocate & Legal Consultant'),
          desc: t(
            'عضو الهيئة السعودية للمحامين حاصلة على بكالوريوس أنظمة من جامعة الملكعبدالعزيز ومتخصصة بالصياغة التعاقدية والاستشارة التجارية.',
            'Member of the Saudi Bar Association, holding a Bachelor of Laws (LL.B.) from King Abdulaziz University and specializing in corporate counseling.'
          )
        },
        {
          name: t('الدكتور / محمود صالح', 'Dr. Mahmoud Saleh'),
          role: t('مستشار قانوني', 'Senior Legal Advisor'),
          desc: t(
            'خبير قانوني متخصص في المنازعات الاستثمارية الدولية والمرافعة أمام اللجان المصرفية والتمويلية بالمملكة.',
            'Elite legal expert specializing in cross-border investment conflicts and advocacy before the Saudi Banking and Financial Committees.'
          )
        },
        {
          name: t('المستشار / محمد كمال كامل محمد', 'Counsel / Mohamed Kamal Kamel'),
          role: t('أخصائي قانوني', 'Senior Legal Specialist'),
          desc: t(
            'أخصائي قانوني متخصص بنظم الشركات الاستثمارية وصاحب بكالوريوس الحقوق من جامعة الزقازيق بالجمهورية المصرية العربية.',
            'Distinguished corporate regulations specialist, holding a Bachelor of Laws from Zagazig University, Egypt.'
          )
        }
      ];
    }

    return items.map((item) => ({
      name: language === 'ar' ? toStringValue(item.nameAr, '') : toStringValue(item.nameEn, ''),
      role: language === 'ar' ? toStringValue(item.roleAr, '') : toStringValue(item.roleEn, ''),
      desc: language === 'ar' ? toStringValue(item.bioAr, '') : toStringValue(item.bioEn, ''),
    }));
  }, [language, teamBlocks, t]);

  const staff = useMemo(() => {
    const items = Array.isArray(teamBlocks[2]?.data?.items)
      ? (teamBlocks[2].data.items as Array<Record<string, unknown>>)
      : [];
    if (items.length === 0) {
      return [
        {
          name: t('المحامية / العنود خالد محمد سعيد', 'Advocate / Alanoud Khaled Saeed'),
          role: t('محامية متدربة', 'Trainee Advocate'),
          desc: t(
            'حاصلة على بكالوريوس أنظمة من جامعة الأميرة نورة بنت عبدالرحمن، وماجستير القانون الجنائي والعلوم الجنائية من جامعة الأمير نايف العربية للعلوم الأمنية.',
            'Holding a Bachelor of Laws (LL.B.) from Princess Nourah bint Abdulrahman University, and a Master\'s in Criminal Law and Criminal Sciences from Naif Arab University for Security Sciences.'
          )
        },
        {
          name: t('الأستاذة / روابي العتيبي', 'Ms. Rawabi Al-Otaibi'),
          role: t('إدارية', 'Corporate Administrator'),
          desc: t(
            'إدارية تسيير وتنسيق ملفات الموكلين ومتابعة مسارات الامتثال والمواعيد لشركاء النجاح.',
            'Oversees case coordination, client archives management, and timing compliance parameters.'
          )
        },
        {
          name: t('الأستاذة / شهد الجريد', 'Ms. Shahad Al-Juraid'),
          role: t('إدارية', 'Relations Administrator'),
          desc: t(
            'إدارية تسيير العلاقات المهنية والبيانات السحابية وضمان تكامل التقارير الدورية.',
            'Manages partner relations, database integrity, and ensures regular compliance reporting flows.'
          )
        }
      ];
    }

    return items.map((item) => ({
      name: language === 'ar' ? toStringValue(item.nameAr, '') : toStringValue(item.nameEn, ''),
      role: language === 'ar' ? toStringValue(item.roleAr, '') : toStringValue(item.roleEn, ''),
      desc: language === 'ar' ? toStringValue(item.bioAr, '') : toStringValue(item.bioEn, ''),
    }));
  }, [language, teamBlocks, t]);

  return (
    <div 
      className="min-h-screen bg-[#F1ECE3] overflow-x-hidden font-sans select-none text-[#1E1E1E]" 
      style={{ direction }}
    >
      
      {/* 1. CINEMATIC TEAM HERO SECTION */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-[#121212] py-28 text-white overflow-hidden border-b border-[#A56A1E]/30">
        
        {/* Luxury Background Layers */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(165,106,30,0.15)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#F1ECE3] to-transparent pointer-events-none opacity-100 z-10" />
        
        {/* Golden floating particle lines */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="10%" y1="0" x2="15%" y2="100%" stroke="#A56A1E" strokeWidth="1.5" />
            <line x1="85%" y1="0" x2="80%" y2="100%" stroke="#A56A1E" strokeWidth="1.5" />
            <line x1="30%" y1="0" x2="45%" y2="100%" stroke="#A56A1E" strokeWidth="0.8" />
            <line x1="70%" y1="0" x2="55%" y2="100%" stroke="#A56A1E" strokeWidth="0.8" />
            <circle cx="20%" cy="30%" r="5" fill="#A56A1E" />
            <circle cx="80%" cy="60%" r="3" fill="#A56A1E" />
          </svg>
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 space-y-6 sm:space-y-8 text-center lg:text-start">
          
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex self-center lg:self-start items-center gap-2 px-3 py-1.5 rounded-full bg-[#A56A1E]/15 border border-[#A56A1E]/30 text-xs text-[#E5D5C5] font-semibold tracking-widest uppercase"
            >
              <span className="w-2 h-2 rounded-full bg-[#A56A1E] animate-pulse" />
              <span>
                {t(
                  siteSettings?.teamHeroBadgeAr || 'فريقنا القضائي الموثوق',
                  siteSettings?.teamHeroBadgeEn || 'OUR TRUSTED JUDICIAL ALLIANCE'
                )}
              </span>
            </motion.div>

            {onBackToHome && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onBackToHome}
                className="inline-flex items-center gap-2 self-center lg:self-auto px-4 py-1.5 rounded-lg border border-white/20 hover:border-white/50 text-white hover:bg-white/5 text-xs font-bold transition-all duration-300 cursor-pointer"
              >
                {direction === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>{t('العودة للرئيسية', 'Back to Home')}</span>
              </motion.button>
            )}
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight"
          >
            {t(
              siteSettings?.teamHeroTitleAr || 'نخبة من المحامين والمستشارين القانونيين',
              siteSettings?.teamHeroTitleEn || 'A Prestige League of Counselors & Attorneys'
            )}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="h-[2px] w-16 bg-[#A56A1E] mx-auto lg:mx-0"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-[#E2DCD3] text-base sm:text-lg lg:text-xl font-light max-w-3xl leading-relaxed text-justify lg:text-start"
          >
            {t(
              siteSettings?.teamHeroDescAr || 'خبرات قانونية متخصصة تجمع بين الكفاءة العلمية والخبرة العملية لتقديم خدمات قانونية احترافية للأفراد والشركات، بأسمى غايات المصداقية والأمان القضائي.',
              siteSettings?.teamHeroDescEn || 'Specialized legal experts uniting deep scholarly wisdom with rich active advocacy to render prestigious counseling for individuals and industries, maintaining ultimate confidentiality and system security.'
            )}
          </motion.p>

        </div>
      </section>


      {/* 3. LEADERSHIP SECTION */}
      <section className="py-20 sm:py-28 bg-[#F1ECE3] relative">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center space-y-3 mb-20 max-w-2xl mx-auto">
            <span className="text-xs font-semibold text-[#A56A1E] uppercase tracking-wider block">
              {t('صناع القرار والسياسة الاستراتيجية', 'DECISION MAKERS & STRATEGIC ADVISORS')}
            </span>
            <h2 className="text-3xl font-extrabold text-[#1E1E1E]">
              {t('الإدارة التنفيذية والقيادة', 'Executive Leadership & Partners')}
            </h2>
            <div className="h-[1.5px] w-12 bg-[#A56A1E] mx-auto mt-4" />
          </div>

          <div className="space-y-16">
            
            {/* Featured Profile: Founder Hesham Hanboli */}
            {leadership.filter(l => l.featured).map((leader, i) => (
              <div 
                key={i}
                className="max-w-4xl mx-auto rounded-3xl p-8 sm:p-12 bg-[#F8F5EF] border border-[#D8D1C7] shadow-md relative overflow-hidden block lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-center"
              >
                
                {/* Picture Area */}
                <div className="lg:col-span-5 relative flex justify-center mb-8 lg:mb-0">
                  <div className={`absolute -top-3 ${language === 'ar' ? '-right-3' : '-left-3'} w-12 h-12 border-t-2 ${language === 'ar' ? 'border-r-2' : 'border-l-2'} border-[#A56A1E] rounded-tr-lg pointer-events-none`} />
                  <div className={`absolute -bottom-3 ${language === 'ar' ? '-left-3' : '-right-3'} w-12 h-12 border-b-2 ${language === 'ar' ? 'border-l-2' : 'border-r-2'} border-[#A56A1E] rounded-bl-lg pointer-events-none`} />
                  
                  <div className="rounded-2xl overflow-hidden aspect-[3/4] w-full max-w-[320px] bg-[#F1ECE3] border border-[#D8D1C7] shadow-md relative group">
                    <img 
                      src={leader.image} 
                      alt={leader.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* Info Text Area */}
                <div className="lg:col-span-7 space-y-6 text-start">
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-extrabold text-[#A56A1E] bg-[#A56A1E]/10 px-3 py-1 rounded-md border border-[#A56A1E]/15 inline-block">
                      {leader.role}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E]">
                      {leader.name}
                    </h3>
                  </div>

                  <p className="text-[#4B4B4B] text-base leading-relaxed font-light text-justify">
                    {leader.desc}
                  </p>

                  <div className="h-[1px] bg-[#D8D1C7]" />

                  {/* Achievements and tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {leader.credentials.map((cred, cIdx) => (
                      <div key={cIdx} className="flex items-center gap-2.5 text-xs text-[#1E1E1E] font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#A56A1E] shrink-0" />
                        <span>{cred}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}

            {/* Other Leadership Rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {leadership.filter(l => !l.featured).map((leader, index) => (
                <div
                  key={index}
                  className="rounded-2xl p-8 bg-[#F8F5EF] border border-[#D8D1C7] hover:border-[#A56A1E]/60 transition-all duration-300 flex flex-col justify-between text-start group"
                >
                  <div className="space-y-6">
                    {/* Role Tag */}
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-mono font-extrabold text-[#7B5A42] bg-[#7B5A42]/10 px-2.5 py-1 rounded-md">
                        {leader.role}
                      </span>
                      <div className="p-2.5 rounded-xl bg-white border border-[#D8D1C7] text-[#A56A1E]">
                        <User className="w-5 h-5 stroke-[1.5]" />
                      </div>
                    </div>

                    {leader.image && (
                      <div className="rounded-xl overflow-hidden aspect-[4/3] w-full bg-[#F1ECE3] border border-[#D8D1C7] relative group/img">
                        <img 
                          src={leader.image} 
                          alt={leader.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover/img:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                      </div>
                    )}

                    <div className="space-y-3">
                      <h3 className="text-xl font-extrabold text-[#1E1E1E] group-hover:text-[#A56A1E] transition-colors duration-300">
                        {leader.name}
                      </h3>
                      <p className="text-sm text-[#5B5B5B] font-light leading-relaxed text-justify">
                        {leader.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#D8D1C7]/50 space-y-2">
                    {leader.credentials.map((cred, credIdx) => (
                      <div key={credIdx} className="flex items-start gap-2 text-xs text-[#4B4B4B]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A56A1E] mt-1.5 shrink-0" />
                        <span className="font-light leading-relaxed text-justify">{cred}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>


      {/* 4. LEGAL CONSULTANTS SECTION */}
      <section className="py-20 sm:py-28 bg-[#F8F5EF] relative border-b border-[#D8D1C7]/45">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-20 max-w-3xl mx-auto">
            <span className="text-xs font-semibold text-[#A56A1E] uppercase tracking-wider block">
              {t('نخبة مستشاري الأنظمة والتمثيل القضائي', 'EMBODIMENT OF SYSTEMIC COUNSEL & LITIGATION')}
            </span>
            <h2 className="text-3xl font-extrabold text-[#1E1E1E]">
              {t('المستشارون القانونيون', 'Legal Consultants & Advisors')}
            </h2>
            <div className="h-[1.5px] w-12 bg-[#A56A1E] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {consultants.map((con, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6, boxShadow: '0 20px 40px -15px rgba(165,106,30,0.1)' }}
                className="rounded-xl p-8 bg-white border border-[#D8D1C7] hover:border-[#A56A1E]/50 transition-all duration-300 flex flex-col justify-between text-start group relative overflow-hidden"
              >
                {/* Background soft glow */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-[#A56A1E]/5 rounded-full blur-xl group-hover:bg-[#A56A1E]/10 transition-all duration-300" />
                
                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-center pb-4 border-b border-[#D8D1C7]/40">
                    <span className="text-xs font-mono font-bold text-[#A56A1E] bg-[#A56A1E]/10 px-2.5 py-1 rounded">
                      {con.role}
                    </span>
                    <Bookmark className="w-4 h-4 text-[#A56A1E]/60 group-hover:text-[#A56A1E] transition-colors" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-[#1E1E1E] group-hover:text-[#A56A1E] transition-colors duration-300 leading-snug">
                      {con.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5B5B5B] font-light leading-relaxed text-justify">
                      {con.desc}
                    </p>
                  </div>
                </div>

                <div className={`h-[2px] w-0 bg-[#A56A1E] absolute bottom-0 ${language === 'ar' ? 'right-0' : 'left-0'} group-hover:w-full transition-all duration-500`} />
              </motion.div>
            ))}
          </div>

        </div>
      </section>


      {/* 5. ADMINISTRATIVE TEAM SECTION */}
      <section className="py-20 bg-[#F1ECE3] relative border-b border-[#D8D1C7]/40">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-16 max-w-2xl mx-auto">
            <span className="text-xs font-semibold text-[#A56A1E] uppercase tracking-wider block">
              {t('العمود الإداري والتكامل التشغيلي للمجموعة', 'ADMINISTRATIVE PILLARS & CORE INTEGRATION')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E]">
              {t('فريق العمل', 'Administrative & Support Staff')}
            </h2>
            <div className="h-[1.5px] w-12 bg-[#A56A1E] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {staff.map((st, i) => (
              <div 
                key={i}
                className="rounded-xl p-6 bg-[#F8F5EF] border border-[#D8D1C7] flex flex-col justify-between text-start hover:bg-white transition-all duration-300 group shadow-xs"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#7B5A42] bg-[#7B5A42]/10 px-2 py-0.5 rounded">
                      {st.role}
                    </span>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#A56A1E] group-hover:scale-125 transition-transform" />
                  </div>
                  <h3 className="text-base font-bold text-[#1E1E1E] group-hover:text-[#A56A1E] transition-colors">
                    {st.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5B5B5B] font-light leading-relaxed text-justify">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* 6. EXECUTIVE CONSULTATION CTA */}
      <section className="relative py-24 bg-[#121212] text-white overflow-hidden text-center lg:text-start">
        {/* Deep luxurious charcoal gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(165,106,30,0.18)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="80%" cy="40%" r="100" stroke="#A56A1E" fill="none" strokeWidth="1" />
            <circle cx="20%" cy="80%" r="50" stroke="#A56A1E" fill="none" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <span className={`text-xs font-bold text-[#A56A1E] tracking-widest uppercase block ${language === 'ar' ? 'border-r-2 pr-3' : 'border-l-2 pl-3'} border-[#A56A1E]`}>
                {t(
                  toStringValue(teamCtaBlock?.data?.subheadingAr, 'خطوة آمنة نحو التميز الاستثماري والقضائي'),
                  toStringValue(teamCtaBlock?.data?.subheadingEn, 'A STRATEGIC MOVE TOWARD CORPORATE COMPLIANCE & EXCELLENCE')
                )}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                {t(
                  toStringValue(teamCtaBlock?.data?.headingAr, 'ابدأ استشارتك القانونية معنا كشريك للنجاح'),
                  toStringValue(teamCtaBlock?.data?.headingEn, 'Initiate Your Consultation with Your Lifetime Legal Partner')
                )}
              </h2>
              <p className="text-sm sm:text-base text-gray-300 font-light max-w-2xl leading-relaxed text-justify lg:text-start">
                {t(
                  toStringValue(teamCtaBlock?.data?.bodyAr, 'فريق قانوني بخبرة احترافية ورؤية استراتيجية لحماية مصالحك وتحقيق أهدافك التجارية وإزالة التبعات والتربص قبل قيام الخلاف المالي أو التعاقدي.'),
                  toStringValue(teamCtaBlock?.data?.bodyEn, 'A legal team with outstanding strategic vision, safeguarding your interests, achieving your commercial goals, and preempting transactional liability before disputes arise.')
                )}
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4 justify-end">
              <button 
                onClick={onScrollToContact}
              className="px-8 py-3.5 rounded-xl bg-[#A56A1E] hover:bg-[#946B4B] text-white text-xs font-bold font-sans transition-all duration-300 shadow-[0_10px_30px_rgba(165,106,30,0.3)] shadow-[#A56A1E]/20 hover:shadow-lg hover:shadow-[#A56A1E]/30 text-center cursor-pointer active:scale-98"
              >
                {t(
                  toStringValue(teamCtaBlock?.data?.ctaPrimaryLabelAr, 'احجز استشارة وقائية فورية'),
                  toStringValue(teamCtaBlock?.data?.ctaPrimaryLabelEn, 'Book Preventative Assessment')
                )}
              </button>
              
              <button 
                onClick={onScrollToContact}
                className="px-8 py-3.5 rounded-xl bg-transparent hover:bg-white/5 text-white border border-white/20 hover:border-white/40 text-xs font-bold font-sans transition-all duration-300 text-center cursor-pointer"
              >
                {t(
                  toStringValue(teamCtaBlock?.data?.ctaSecondaryLabelAr, 'تواصل معنا اليوم'),
                  toStringValue(teamCtaBlock?.data?.ctaSecondaryLabelEn, 'Connect with Us Today')
                )}
              </button>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
