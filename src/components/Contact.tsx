import React, { useState } from 'react';
import { MapPin, Phone, Mail, CheckCircle, Send, Bell } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteContent } from '../content/ContentContext';

export default function Contact() {
  const { language, direction, t } = useLanguage();
  const { content } = useSiteContent();
  const siteSettings = content?.siteSettings;

  const serviceCategories = [
    t('الاستشارات القانونية للشركات والأفراد', 'Legal Consultations for Companies & Individuals'),
    t('القضايا وتسوية النزاعات والتحكيم', 'Litigation, Conflict Resolution & Arbitration'),
    t('إتمام المعاملات الصعبة وتأسيس الكيانات والاستثمار الأجنبي', 'FDI, Complex Transactions & Corporate Incorps'),
    t('صياغة العقود وتدقيق الاتفاقيات التجارية', 'Contract Drafting & Commercial Auditing'),
    t('الملكية الفكرية وبراءات الاختراع', 'Intellectual Property & Patents'),
    t('أخرى', 'Other'),
  ];

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    serviceType: serviceCategories[0] || 'الاستشارات القانونية للشركات والأفراد',
    message: '',
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.email) {
      alert(t('الرجاء تعبئة الحقول الأساسية (الاسم، الجوال، والبريد الإلكتروني)', 'Please fill in the required fields (Name, Phone, and Email)'));
      return;
    }
    setFormSubmitted(true);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubmitted(true);
  };

  return (
    <div id="contact" className="space-y-0" style={{ direction }}>
      
      {/* CONTACT FORM AND OFFICE DETAILS BLOCK */}
      <section className="py-20 sm:py-28 bg-[#F8F5EF] relative border-b border-[#D8D1C7]/45">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Title */}
          <div className="text-start space-y-4 mb-16 max-w-3xl">
            <span className="text-xs font-semibold text-[#A56A1E] uppercase tracking-wider block">
              {t(
                siteSettings?.contactSectionBadgeAr || 'نحن جاهزون لمساندتك بكفاءة مهنية مطلقة',
                siteSettings?.contactSectionBadgeEn || 'WE ARE READY TO SUPPORT YOU WITH SUPREME PROFESSIONALISM'
              )}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E1E1E] tracking-tight">
              {t(
                siteSettings?.contactSectionTitleAr || 'تواصل معنا',
                siteSettings?.contactSectionTitleEn || 'CONTACT US'
              )}
            </h2>
            <p className="text-base text-[#4B4B4B] font-light leading-relaxed max-w-2xl">
              {t(
                siteSettings?.contactSectionDescAr || 'يسعدنا التوجيه والإجابة على كافة استفساراتكم القانونية بدقة وسرية تامة.',
                siteSettings?.contactSectionDescEn || 'We are pleased to guide and answer all your legal inquiries with precision and utter confidentiality.'
              )}
            </p>
            <div className="h-[2px] w-16 bg-[#A56A1E] mt-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Right: Direct Addresses information column (5 cols) */}
            <div className="lg:col-span-5 space-y-8 text-start">
              
              <div className="rounded-xl p-8 bg-[#F1ECE3] border border-[#D8D1C7] space-y-8">
                <h3 className="text-xl font-bold text-[#1E1E1E]">
                  {t(
                    siteSettings?.contactSectionOfficeTitleAr || 'مقر الإدارة والاتصال الموحد',
                    siteSettings?.contactSectionOfficeTitleEn || 'HEADQUARTERS & UNIFIED CHANNELS'
                  )}
                </h3>
                
                {/* Unified Main Headquarters */}
                <div className="space-y-3 group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#A56A1E]/10 flex items-center justify-center text-[#A56A1E]">
                      <MapPin className="w-5 h-5 stroke-[1.5]" />
                    </div>
                  <h4 className="text-base font-extrabold text-[#1E1E1E]">
                    {t(
                      siteSettings?.contactSectionAddressHeadAr || 'المقر الرئيسي',
                      siteSettings?.contactSectionAddressHeadEn || 'Main Headquarters'
                    )}
                  </h4>
                  </div>
                  <p className="text-sm text-[#1E1E1E] font-medium pr-13">
                    {t('جدة - الروضة', 'Jeddah - Al-Rawdah')}
                  </p>
                  <p className="text-sm text-[#4B4B4B] font-light pr-13">
                    {t('شارع نهضة العلم', 'Nahdat Al-Elm Street')}
                  </p>
                  <p className="text-xs text-[#A56A1E] font-medium pr-13">
                    {t('مكتب المملكة المرخص بمزاولة المحاماة بوزارة العدل', 'Licensed Practice for Advocacy & Consultations, Ministry of Justice')}
                  </p>
                </div>

                {/* Global Contact Info */}
                <div className="space-y-3 pt-6 border-t border-[#D8D1C7]/60">
                  <a href="tel:920004713" className="flex items-center gap-3 text-sm text-[#1E1E1E] hover:text-[#A56A1E] justify-start transition-colors select-all">
                    <Phone className="w-4.5 h-4.5 text-[#A56A1E]" />
                    <span className="font-mono">
                      920004713 • {t(
                        siteSettings?.contactSectionPhoneLabelAr || 'الهاتف الموحد',
                        siteSettings?.contactSectionPhoneLabelEn || 'Unified Number'
                      )}
                    </span>
                  </a>
                  <a href="mailto:mec_law@hotmail.com" className="flex items-center gap-3 text-sm text-[#1E1E1E] hover:text-[#A56A1E] justify-start transition-colors select-all">
                    <Mail className="w-4.5 h-4.5 text-[#A56A1E]" />
                    <span className="font-mono">
                      mec_law@hotmail.com • {t(
                        siteSettings?.contactSectionEmailLabelAr || 'البريد الرئيسي',
                        siteSettings?.contactSectionEmailLabelEn || 'Corporate Email'
                      )}
                    </span>
                  </a>
                </div>

              </div>

              {/* Security Badge */}
              <div className="p-6 rounded-lg border border-[#D8D1C7]/60 bg-white/50 text-start">
                <p className="text-xs text-[#4B4B4B] font-light leading-relaxed">
                  {t(
                    siteSettings?.contactSectionSecurityAr || '* كشريك مرخص ومقيد بوزارة العدل السعودية، تخضع كل رسالة ومكالمة لضمانة السرية المهنية وتوافق المعايير المنصوص عليها بمجلس حماية البيانات والمحاماة بالمملكة.',
                    siteSettings?.contactSectionSecurityEn || '* As a licensed practice under the Saudi Ministry of Justice, all communications are fully guarded under professional client confidentiality standards & Saudi data security regulations.'
                  )}
                </p>
              </div>

            </div>

            {/* Left: Contact form (7 cols) */}
            <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-xl border border-[#D8D1C7] relative overflow-hidden shadow-sm text-start">
              
              {formSubmitted ? (
                <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-[#A56A1E]/15 flex items-center justify-center text-[#A56A1E] animate-bounce">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1E1E1E]">{t('تم استلام رسالتك الاستشارية بنجاح', 'Your Inquiry Has Been Received Successfully')}</h3>
                  <p className="text-sm text-[#4B4B4B] max-w-md mx-auto leading-relaxed">
                    {t(
                      'شكراً لثقتك بالاستعانة بنا، يا {name}. لقد تم إرسال طلبك إلى الكادر المختص بشركة هشام حسن حنبولي الدولية وسيتصل بك أحد كبار المحامين لدينا لمناقشة التفاصيل خلال 24 ساعة عمل كحد أقصى.',
                      'Thank you for your trust, {name}. Your inquiry has been forwarded directly to the expert counsels of Hesham H. Hanboly International Firm. A senior attorney will connect with you to discuss details within a maximum of 24 operating hours.'
                    ).replace('{name}', formData.fullName)}
                  </p>
                  
                  <button
                    onClick={() => {
                      setFormData({
                        fullName: '',
                        phone: '',
                        email: '',
                        serviceType: serviceCategories[0] || 'الاستشارات القانونية للشركات والأفراد',
                        message: '',
                      });
                      setFormSubmitted(false);
                    }}
                    className="px-6 py-2.5 rounded-lg bg-[#7B5A42] hover:bg-[#946B4B] text-white text-xs font-bold transition-all"
                  >
                    {t('إرسال استفسار آخر', 'Submit Another Inquiry')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-lg font-bold text-[#1E1E1E] border-b border-[#D8D1C7]/40 pb-3">
                    {t(
                      siteSettings?.contactSectionFormTitleAr || 'تقديم استفسار قانوني آمن',
                      siteSettings?.contactSectionFormTitleEn || 'Submit a Secure Case Assessment'
                    )}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5B5B5B] font-light">
                    {t(
                      siteSettings?.contactSectionFormDescAr || 'أرسل استفسارك القانوني الآن وسيقوم مستشارنا القانوني بالرد والاتصال بكم.',
                      siteSettings?.contactSectionFormDescEn || 'Send us your legal inquiry now and one of our legal consultants will respond and contact you.'
                    )}
                  </p>
                  
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-xs font-semibold text-[#1E1E1E] block">{t('الاسم الكريم', 'Full Name')} <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      required
                      placeholder={t('أدخل اسمك الكريم بالكامل', 'Enter your full name')}
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-[#F5F2EC] border border-[#D9D2C8] focus:border-[#A56A1E] focus:outline-none text-sm text-[#1E1E1E] transition-all"
                    />
                  </div>

                  {/* Phone & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone Number */}
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-xs font-semibold text-[#1E1E1E] block">{t('رقم الجوال', 'Phone Number')} <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        placeholder="05xxxxxxxx"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg bg-[#F5F2EC] border border-[#D9D2C8] focus:border-[#A56A1E] focus:outline-none text-sm text-[#1E1E1E] transition-all text-left font-mono"
                        style={{ direction: 'ltr' }}
                      />
                    </div>

                    {/* Email address */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-xs font-semibold text-[#1E1E1E] block">{t('البريد الإلكتروني', 'Email Address')} <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        placeholder="example@domain.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg bg-[#F5F2EC] border border-[#D9D2C8] focus:border-[#A56A1E] focus:outline-none text-sm text-[#1E1E1E] transition-all text-left font-mono"
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                  </div>

                  {/* Category Options */}
                  <div className="space-y-2">
                    <label htmlFor="serviceType" className="text-xs font-semibold text-[#1E1E1E] block">{t('نوع الخدمة المطلوبة', 'Required Service Type')}</label>
                    <div className="relative">
                      <select
                        id="serviceType"
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg bg-[#F5F2EC] border border-[#D9D2C8] focus:border-[#A56A1E] focus:outline-none text-sm text-[#1E1E1E] transition-all appearance-none cursor-pointer"
                      >
                        {serviceCategories.map((cat, idx) => (
                           <option key={idx} value={cat}>
                             {cat}
                           </option>
                        ))}
                      </select>
                      <div className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 pointer-events-none text-[#A56A1E]`}>
                        ▾
                      </div>
                    </div>
                  </div>

                  {/* Details message box */}
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-xs font-semibold text-[#1E1E1E] block">{t('تفاصيل الرسالة الاستشارية', 'Case Assessment Details')}</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      placeholder={t('اكتب هنا تفاصيل المشكلة أو الاستفسار وعناوين القضية المطلوبة بدقة...', 'Please describe your request, main concerns, and background details with absolute precision...')}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-[#F5F2EC] border border-[#D9D2C8] focus:border-[#A56A1E] focus:outline-none text-sm text-[#1E1E1E] transition-all text-justify font-light"
                    />
                  </div>

                  {/* Action button */}
                  <div className={language === 'ar' ? 'pt-2 text-left' : 'pt-2 text-right'}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[#7B5A42] hover:bg-[#946B4B] text-white font-extrabold text-sm transition-all duration-300 shadow hover:shadow-lg cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{t('إرسال الرسالة', 'Submit Secure Request')}</span>
                    </button>
                  </div>

                </form>
              )}

            </div>

          </div>
        </div>
      </section>

      {/* LUXURY NEWSLETTER SUBSCRIPTION COMPONENT */}
      <section className="py-16 bg-[#F1ECE3] relative overflow-hidden border-b border-[#D8D1C7]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="inline-flex p-2.5 rounded-full bg-[#A56A1E]/10 text-[#A56A1E] justify-center mx-auto">
              <Bell className="w-5 h-5 animate-swing" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-[#1E1E1E]">{t('اشترك في نشرتنا القانونية الوقائية', 'Subscribe to Our Preventative Legal Newsletter')}</h3>
            <p className="text-sm text-[#4B4B4B] font-light leading-relaxed max-w-md mx-auto">
              {t(
                'تلقّ تحديثات النظم والتشريعات الصادرة حديثاً بالمملكة وتوجيهات الامتثال من كادر شركائنا مباشرة.',
                'Receive instant compliance updates, newly announced Saudi royal decrees, and key regulatory guidelines authored directly by our partners.'
              )}
            </p>

            {newsletterSubmitted ? (
              <div className="p-4 bg-white/60 border border-[#D8D1C7] rounded-lg text-sm text-[#A56A1E] font-medium max-w-md mx-auto">
                {t('تم الاشتراك بنجاح! شكراً جزيلاً لانضمامك إلى قائمتنا البريدية الخاصة.', 'Successfully subscribed! Thank you for joining our exclusive corporate compliance mailing list.')}
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  placeholder={t('أدخل بريدك الإلكتروني هنا', 'Enter your business email here')}
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full sm:flex-grow px-4 py-3 rounded-lg bg-white border border-[#D8D1C7] focus:border-[#A56A1E] focus:outline-none text-sm text-[#1E1E1E] transition-all text-left font-mono"
                  style={{ direction: 'ltr' }}
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg bg-[#7B5A42] hover:bg-[#946B4B] text-white font-extrabold text-xs transition-all duration-300 hover:shadow-sm"
                >
                  {t('اشتراك', 'Subscribe')}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
