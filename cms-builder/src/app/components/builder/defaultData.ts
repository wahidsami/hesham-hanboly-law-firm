import type { Block, BlockType, BuilderPage } from './types';

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function defaultDataForType(type: BlockType): Record<string, any> {
  switch (type) {
    case 'hero': return {
      headingEn: 'Expert Legal Counsel You Can Trust',
      headingAr: 'مستشار قانوني خبير يمكنك الثقة به',
      subheadingEn: 'We provide comprehensive legal services across the Gulf region with over 25 years of experience.',
      subheadingAr: 'نقدم خدمات قانونية شاملة في منطقة الخليج بخبرة تمتد لأكثر من 25 عاماً.',
      ctaPrimaryLabelEn: 'Book a Consultation',
      ctaPrimaryLabelAr: 'احجز استشارة',
      ctaPrimaryUrl: '/contact',
      ctaSecondaryLabelEn: 'Our Services',
      ctaSecondaryLabelAr: 'خدماتنا',
      ctaSecondaryUrl: '/services',
      bgColor: '#12131C',
      imageUrl: 'https://images.unsplash.com/photo-1486406716246-fecf0b352a5d?w=1400&h=800&fit=crop&auto=format',
    };
    case 'rich-text': return {
      headingEn: 'Our Approach to Legal Excellence',
      headingAr: 'نهجنا في التميز القانوني',
      bodyEn: 'At Al-Rashid & Partners, we believe that every client deserves personalized attention and strategic counsel. Our team brings deep expertise across corporate law, litigation, intellectual property, and regulatory compliance.\n\nWe combine rigorous legal analysis with practical business insight to deliver outcomes that matter.',
      bodyAr: 'في الرشيد وشركاه، نؤمن بأن كل عميل يستحق اهتماماً شخصياً وإرشاداً استراتيجياً. يجلب فريقنا معرفة عميقة في قانون الشركات والتقاضي والملكية الفكرية.\n\nنجمع التحليل القانوني الدقيق مع الرؤية العملية لتحقيق نتائج ذات أهمية.',
    };
    case 'image-text': return {
      headingEn: 'Built on Decades of Legal Experience',
      headingAr: 'مبنية على عقود من الخبرة القانونية',
      bodyEn: 'Since 1998, we have been advising businesses, government entities, and individuals on matters of critical importance. Our multilingual team spans offices in Riyadh, Dubai, and London.',
      bodyAr: 'منذ عام 1998، نقدم المشورة للشركات والجهات الحكومية والأفراد. يمتد فريقنا متعدد اللغات عبر مكاتب في الرياض ودبي ولندن.',
      ctaPrimaryLabelEn: 'Our Story',
      ctaPrimaryLabelAr: 'قصتنا',
      ctaPrimaryUrl: '/about',
      imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop&auto=format',
      imageAlt: 'Law firm office',
      layout: 'image-right',
    };
    case 'cards': return {
      headingEn: 'Our Practice Areas',
      headingAr: 'مجالات ممارستنا',
      subheadingEn: 'Comprehensive legal expertise across key sectors.',
      subheadingAr: 'خبرة قانونية شاملة عبر القطاعات الرئيسية.',
      columns: 3,
      items: [
        { id: uid(), titleEn: 'Corporate & M&A', titleAr: 'الشركات والاندماجات', descEn: 'Strategic advice on mergers, acquisitions, joint ventures, and corporate restructuring.', descAr: 'مشورة استراتيجية حول الاندماجات والاستحواذات وإعادة الهيكلة.', icon: 'briefcase' },
        { id: uid(), titleEn: 'Commercial Litigation', titleAr: 'التقاضي التجاري', descEn: 'Aggressive representation in high-stakes commercial disputes and arbitration.', descAr: 'تمثيل قوي في النزاعات التجارية عالية المخاطر والتحكيم.', icon: 'scale' },
        { id: uid(), titleEn: 'Real Estate', titleAr: 'العقارات', descEn: 'End-to-end support for property transactions and development projects.', descAr: 'دعم شامل لمعاملات الملكية ومشاريع التطوير.', icon: 'building' },
        { id: uid(), titleEn: 'Banking & Finance', titleAr: 'البنوك والتمويل', descEn: 'Islamic finance, project finance, and regulatory compliance.', descAr: 'التمويل الإسلامي وتمويل المشاريع والامتثال التنظيمي.', icon: 'landmark' },
        { id: uid(), titleEn: 'Employment Law', titleAr: 'قانون العمل', descEn: 'Protecting employer and employee rights across complex disputes.', descAr: 'حماية حقوق أصحاب العمل والموظفين في النزاعات المعقدة.', icon: 'users' },
        { id: uid(), titleEn: 'Intellectual Property', titleAr: 'الملكية الفكرية', descEn: 'Trademark registration, patent prosecution, and IP portfolio management.', descAr: 'تسجيل العلامات التجارية وملاحقة براءات الاختراع.', icon: 'lightbulb' },
      ],
    };
    case 'stats': return {
      bgColor: '#F3F3F0',
      items: [
        { id: uid(), value: '25+', labelEn: 'Years of Excellence', labelAr: 'سنوات من التميز' },
        { id: uid(), value: '800+', labelEn: 'Cases Won', labelAr: 'قضية رابحة' },
        { id: uid(), value: '12', labelEn: 'Practice Areas', labelAr: 'مجال قانوني' },
        { id: uid(), value: '3', labelEn: 'Office Locations', labelAr: 'مكتب إقليمي' },
      ],
    };
    case 'cta': return {
      headingEn: 'Ready to Discuss Your Legal Needs?',
      headingAr: 'هل أنت مستعد لمناقشة احتياجاتك القانونية؟',
      bodyEn: 'Schedule a confidential consultation with one of our senior partners today.',
      bodyAr: 'حدد موعداً لاستشارة سرية مع أحد شركائنا الكبار اليوم.',
      ctaPrimaryLabelEn: 'Contact Us Today',
      ctaPrimaryLabelAr: 'تواصل معنا اليوم',
      ctaPrimaryUrl: '/contact',
      bgColor: '#C47F17',
    };
    case 'testimonials': return {
      headingEn: 'What Our Clients Say',
      headingAr: 'ما يقوله عملاؤنا',
      items: [
        { id: uid(), quoteEn: 'Al-Rashid & Partners guided us through a complex cross-border acquisition with exceptional skill. Their bilingual expertise was invaluable.', quoteAr: 'أرشدنا الرشيد وشركاه خلال عملية استحواذ معقدة بمهارة استثنائية. كانت خبرتهم ثنائية اللغة لا تقدر بثمن.', author: 'Khalid Al-Mansouri', roleEn: 'CEO, Gulf Capital Holdings', roleAr: 'الرئيس التنفيذي، خليج كابيتال' },
        { id: uid(), quoteEn: 'None match the responsiveness and depth of knowledge that this team brings to every matter.', quoteAr: 'لا أحد يضاهي سرعة الاستجابة وعمق المعرفة التي يجلبها هذا الفريق لكل قضية.', author: 'Nadia Al-Farsi', roleEn: 'General Counsel, Meridian Developments', roleAr: 'المستشار القانوني العام، ميريديان' },
        { id: uid(), quoteEn: 'Their litigation team secured a landmark ruling for us. We could not have asked for more dedicated advocates.', quoteAr: 'حقق فريق التقاضي لديهم حكماً تاريخياً لصالحنا.', author: 'Omar Bin Zayed', roleEn: 'Managing Partner, ZBH Group', roleAr: 'الشريك الإداري، مجموعة زايد' },
      ],
    };
    case 'team': return {
      headingEn: 'Meet Our Legal Team',
      headingAr: 'تعرف على فريقنا القانوني',
      subheadingEn: 'Experienced attorneys dedicated to your success.',
      subheadingAr: 'محامون متمرسون مكرسون لنجاحك.',
      items: [
        { id: uid(), nameEn: 'Ahmed Al-Rashid', nameAr: 'أحمد الرشيد', roleEn: 'Founding Partner', roleAr: 'الشريك المؤسس', bioEn: 'Ahmed leads the firm\'s corporate and M&A practice with 28 years of experience.', bioAr: 'يقود أحمد ممارسة الشركات بخبرة 28 عاماً.', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&auto=format' },
        { id: uid(), nameEn: 'Layla Hassan', nameAr: 'ليلى حسن', roleEn: 'Senior Partner, Litigation', roleAr: 'شريك أول، التقاضي', bioEn: 'Layla is renowned for her success in high-value commercial litigation.', bioAr: 'تشتهر ليلى بنجاحها في التقاضي التجاري رفيع المستوى.', imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&auto=format' },
        { id: uid(), nameEn: 'Tariq Mahmoud', nameAr: 'طارق محمود', roleEn: 'Partner, Real Estate', roleAr: 'شريك، العقارات', bioEn: 'Tariq specializes in large-scale real estate transactions.', bioAr: 'يتخصص طارق في معاملات العقارات واسعة النطاق.', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&auto=format' },
        { id: uid(), nameEn: 'Fatima Al-Zahrawi', nameAr: 'فاطمة الزهراوي', roleEn: 'Partner, IP & Technology', roleAr: 'شريك، الملكية الفكرية', bioEn: 'Fatima advises on IP strategy and technology law.', bioAr: 'تقدم فاطمة المشورة في استراتيجية الملكية الفكرية وقانون التكنولوجيا.', imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&auto=format' },
      ],
    };
    case 'contact': return {
      headingEn: 'Get in Touch',
      headingAr: 'تواصل معنا',
      subheadingEn: 'Our team is ready to assist you. Reach out today.',
      subheadingAr: 'فريقنا مستعد لمساعدتك. تواصل معنا اليوم.',
      email: 'enquiries@alrashid-law.com',
      phone: '+966 11 234 5678',
      address: 'King Fahd Road, Al Olaya, Riyadh 12214, Saudi Arabia',
      addressAr: 'طريق الملك فهد، حي العليا، الرياض 12214',
    };
    case 'faq': return {
      headingEn: 'Frequently Asked Questions',
      headingAr: 'الأسئلة الشائعة',
      items: [
        { id: uid(), questionEn: 'What is your fee structure?', questionAr: 'ما هو هيكل أتعابكم؟', answerEn: 'We offer flexible fee arrangements including hourly rates, fixed fees, and retainer arrangements.', answerAr: 'نقدم ترتيبات مرنة تشمل المعدلات بالساعة والرسوم الثابتة وترتيبات التكليف.' },
        { id: uid(), questionEn: 'How quickly can you respond to urgent matters?', questionAr: 'ما مدى سرعة استجابتكم للأمور العاجلة؟', answerEn: 'For urgent matters, our team is available 24/7. We guarantee same-day response for all urgent inquiries.', answerAr: 'للأمور العاجلة، فريقنا متاح على مدار الساعة. نضمن الرد في نفس اليوم.' },
        { id: uid(), questionEn: 'Do you handle international cases?', questionAr: 'هل تتعاملون مع القضايا الدولية؟', answerEn: 'Yes, we maintain partnerships with firms across 40+ jurisdictions worldwide.', answerAr: 'نعم، نحافظ على شراكات مع مكاتب في أكثر من 40 اختصاصاً قضائياً حول العالم.' },
        { id: uid(), questionEn: 'Are consultations confidential?', questionAr: 'هل الاستشارات سرية؟', answerEn: 'All consultations are protected by attorney-client privilege and strict confidentiality protocols.', answerAr: 'جميع الاستشارات محمية بامتياز المحامي والعميل وبروتوكولات السرية الصارمة.' },
      ],
    };
    case 'gallery': return {
      headingEn: 'Our Offices',
      headingAr: 'مكاتبنا',
      items: [
        { id: uid(), imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&auto=format', captionEn: 'Riyadh Headquarters', captionAr: 'المقر الرئيسي بالرياض' },
        { id: uid(), imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&h=400&fit=crop&auto=format', captionEn: 'Dubai Office', captionAr: 'مكتب دبي' },
        { id: uid(), imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop&auto=format', captionEn: 'London Office', captionAr: 'مكتب لندن' },
        { id: uid(), imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=400&fit=crop&auto=format', captionEn: 'Conference Suite', captionAr: 'قاعة المؤتمرات' },
      ],
    };
    case 'custom': return {
      htmlContent: '<!-- Custom HTML block -->\n<section class="custom-section">\n  <p>Add your custom content here.</p>\n</section>',
    };
    default: return {};
  }
}

export function makeBlock(type: BlockType): Block {
  return {
    id: uid(),
    type,
    collapsed: false,
    data: defaultDataForType(type),
  };
}

export const INITIAL_PAGES: BuilderPage[] = [
  {
    id: 'page-home',
    titleEn: 'Home',
    titleAr: 'الرئيسية',
    slug: '/',
    status: 'published',
    navVisible: true,
    seoTitleEn: 'Al-Rashid & Partners — Expert Legal Counsel',
    seoTitleAr: 'الرشيد وشركاه — مستشار قانوني خبير',
    seoDescEn: 'Leading law firm in the Gulf with expertise in corporate law, litigation, and commercial transactions.',
    seoDescAr: 'شركة محاماة رائدة في الخليج متخصصة في قانون الشركات والتقاضي والمعاملات التجارية.',
    blocks: [
      { ...makeBlock('hero'), id: 'b-hero' },
      { ...makeBlock('stats'), id: 'b-stats' },
      { ...makeBlock('cards'), id: 'b-cards' },
      { ...makeBlock('cta'), id: 'b-cta' },
    ],
  },
  {
    id: 'page-about',
    titleEn: 'About Us',
    titleAr: 'من نحن',
    slug: '/about',
    status: 'published',
    navVisible: true,
    seoTitleEn: 'About Al-Rashid & Partners',
    seoTitleAr: 'عن الرشيد وشركاه',
    seoDescEn: '',
    seoDescAr: '',
    blocks: [
      { ...makeBlock('image-text'), id: 'b-imgtext' },
      { ...makeBlock('team'), id: 'b-team' },
      { ...makeBlock('testimonials'), id: 'b-testimonials' },
    ],
  },
  {
    id: 'page-faq',
    titleEn: 'FAQ',
    titleAr: 'الأسئلة الشائعة',
    slug: '/faq',
    status: 'draft',
    navVisible: false,
    seoTitleEn: 'FAQ',
    seoTitleAr: 'الأسئلة الشائعة',
    seoDescEn: '',
    seoDescAr: '',
    blocks: [
      { ...makeBlock('faq'), id: 'b-faq' },
    ],
  },
];
