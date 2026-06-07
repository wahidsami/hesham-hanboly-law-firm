export type Lang = 'en' | 'ar';

export type BlockType =
  | 'hero'
  | 'rich-text'
  | 'image-text'
  | 'cards'
  | 'stats'
  | 'cta'
  | 'testimonials'
  | 'team'
  | 'contact'
  | 'faq'
  | 'gallery'
  | 'custom';

export interface FAQItem {
  id: string;
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
}

export interface CardItem {
  id: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  icon: string;
}

export interface StatItem {
  id: string;
  value: string;
  labelEn: string;
  labelAr: string;
}

export interface TestimonialItem {
  id: string;
  quoteEn: string;
  quoteAr: string;
  author: string;
  roleEn: string;
  roleAr: string;
}

export interface TeamMember {
  id: string;
  nameEn: string;
  nameAr: string;
  roleEn: string;
  roleAr: string;
  bioEn: string;
  bioAr: string;
  imageUrl: string;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  captionEn: string;
  captionAr: string;
}

export interface Block {
  id: string;
  type: BlockType;
  collapsed: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

export interface BuilderPage {
  id: string;
  titleEn: string;
  titleAr: string;
  slug: string;
  status: 'published' | 'draft' | 'hidden';
  navVisible: boolean;
  seoTitleEn: string;
  seoTitleAr: string;
  seoDescEn: string;
  seoDescAr: string;
  blocks: Block[];
}

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  'hero': 'Hero Banner',
  'rich-text': 'Rich Text',
  'image-text': 'Image + Text',
  'cards': 'Cards / Grid',
  'stats': 'Statistics',
  'cta': 'CTA Banner',
  'testimonials': 'Testimonials',
  'team': 'Team / Profiles',
  'contact': 'Contact Section',
  'faq': 'FAQ Repeater',
  'gallery': 'Gallery',
  'custom': 'Custom Block',
};
