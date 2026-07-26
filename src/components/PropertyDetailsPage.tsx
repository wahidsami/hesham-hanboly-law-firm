import React from 'react';
import { CheckCircle2, Copy, Heart, MapPin, Phone, Printer, Share2, Star, ArrowRight, MessageSquare, ExternalLink, Eye, X, ChevronLeft, ChevronRight, Maximize2, BedDouble, Bath, Sofa, Ruler, Building2, CalendarDays, Hash, Tag, BadgeCheck, Landmark } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { AmenitiesSection } from './AmenitiesSection';
import { Property } from '../types';
import { buildPropertySlug } from '../lib/propertyRouting';
import { getPropertyPlaceholderImages } from '../lib/propertyPlaceholders';

interface PropertyDetailsPageProps {
  property: Property;
  relatedProperties: Property[];
  projectName?: string;
  mediaItems: Record<string, string>;
  onNavigate?: (page: string) => void;
}

const na = 'N/A';

const asText = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') return na;
  return String(value);
};

const summaryCardIcon = (label: string) => {
  const key = label.toLowerCase();
  if (key.includes('bed') || key.includes('غرف')) return BedDouble;
  if (key.includes('bath') || key.includes('المياه')) return Bath;
  if (key.includes('living') || key.includes('صالات')) return Sofa;
  if (key.includes('area') || key.includes('المساحة')) return Ruler;
  if (key.includes('balcon') || key.includes('الشرف')) return Building2;
  if (key.includes('park') || key.includes('مواقف')) return Building2;
  if (key.includes('floor') || key.includes('الطابق')) return Landmark;
  return CalendarDays;
};

const specCardIcon = (label: string) => {
  const key = label.toLowerCase();
  if (key.includes('reference') || key.includes('المرجع')) return Hash;
  if (key.includes('title') || key.includes('العنوان')) return Tag;
  if (key.includes('type') || key.includes('النوع')) return BadgeCheck;
  if (key.includes('price') || key.includes('السعر')) return Landmark;
  if (key.includes('area') || key.includes('المساحة')) return Ruler;
  if (key.includes('bed') || key.includes('غرف')) return BedDouble;
  if (key.includes('bath') || key.includes('مياه')) return Bath;
  if (key.includes('living') || key.includes('صالات')) return Sofa;
  if (key.includes('balcon') || key.includes('الشرف')) return Building2;
  if (key.includes('parking') || key.includes('مواقف')) return Building2;
  if (key.includes('date') || key.includes('تاريخ')) return CalendarDays;
  if (key.includes('developer') || key.includes('المطور')) return Building2;
  if (key.includes('ownership') || key.includes('الملكية')) return BadgeCheck;
  if (key.includes('finishing') || key.includes('التشطيب')) return BadgeCheck;
  if (key.includes('city') || key.includes('المدينة')) return MapPin;
  if (key.includes('district') || key.includes('الحي')) return MapPin;
  if (key.includes('address') || key.includes('العنوان')) return MapPin;
  if (key.includes('coordinates') || key.includes('الإحداثيات')) return MapPin;
  if (key.includes('project') || key.includes('المشروع')) return Building2;
  return Landmark;
};

const groupNearbyPlaces = (places: Property['nearbyPlaces']) => {
  const grouped = new Map<string, NonNullable<Property['nearbyPlaces']>[number][]>();
  (places || []).forEach((place) => {
    const key = place.type || 'other';
    const current = grouped.get(key) || [];
    current.push(place);
    grouped.set(key, current);
  });
  return Array.from(grouped.entries());
};

const setOrCreateMeta = (selector: string, attrs: Record<string, string>) => {
  let element = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | HTMLScriptElement | null;
  if (!element) {
    element = attrs.rel === 'canonical'
      ? document.createElement('link')
      : attrs.type === 'application/ld+json'
        ? document.createElement('script')
        : document.createElement('meta');
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'content' && element instanceof HTMLLinkElement) return;
      if (key === 'rel' && element instanceof HTMLMetaElement) return;
      if (key === 'type' && element instanceof HTMLMetaElement) return;
      element.setAttribute(key, value);
    });
    document.head.appendChild(element);
    return element;
  }

  Object.entries(attrs).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
};

const renderRichDescription = (text?: string) => {
  const raw = text?.trim();
  if (!raw) {
    return <div className="text-sm text-slate-400">{na}</div>;
  }

  const lines = raw.split(/\r?\n/);
  const blocks: Array<{ type: 'heading' | 'list' | 'paragraph'; content: string[] }> = [];
  let currentParagraph: string[] = [];
  let currentList: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({ type: 'paragraph', content: [currentParagraph.join(' ')] });
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push({ type: 'list', content: [...currentList] });
      currentList = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    if (/^#{1,3}\s+/.test(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'heading', content: [trimmed.replace(/^#{1,3}\s+/, '')] });
      return;
    }

    if (/^(\-|\*|•)\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      flushParagraph();
      currentList.push(trimmed.replace(/^(\-|\*|•|\d+\.)\s+/, ''));
      return;
    }

    flushList();
    currentParagraph.push(trimmed);
  });

  flushParagraph();
  flushList();

  return (
    <div className="space-y-4 text-sm leading-7 text-slate-700">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <h3 key={`${block.type}-${index}`} className="text-base font-black text-slate-950">
              {block.content[0]}
            </h3>
          );
        }

        if (block.type === 'list') {
          return (
            <ul key={`${block.type}-${index}`} className="space-y-2 pr-5 list-disc">
              {block.content.map((item, itemIndex) => (
                <li key={`${index}-${itemIndex}`}>{item}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`${block.type}-${index}`} className="whitespace-pre-line">
            {block.content[0]}
          </p>
        );
      })}
    </div>
  );
};

export const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({
  property,
  relatedProperties,
  projectName,
  mediaItems,
  onNavigate,
}) => {
  const { language, t, staticT } = useLanguage();
  const { theme, settings } = useTheme();
  const isArabic = language === 'ar';
  const pageAlignClass = isArabic ? 'text-right' : 'text-left';
  const rowFlowClass = isArabic ? 'flex-row-reverse' : 'flex-row';

  const [heroIndex, setHeroIndex] = React.useState(0);
  const [saved, setSaved] = React.useState(false);
  const [showMoreInquiry, setShowMoreInquiry] = React.useState(false);
  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [touchStartX, setTouchStartX] = React.useState<number | null>(null);
  const [viewerUrl, setViewerUrl] = React.useState('');
  const [viewerTitle, setViewerTitle] = React.useState('');

  const propertyId = property.id;
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const galleryIds = [
    property.featuredImageId,
    ...(property.galleryImageIds || []),
  ].filter(Boolean) as string[];

  const placeholderImages = getPropertyPlaceholderImages();
  const heroImages = galleryIds.length > 0 ? Array.from(new Set(galleryIds)) : placeholderImages;
  const activeImageId = heroImages[heroIndex] || heroImages[0] || '';
  const activeImage = activeImageId.startsWith('data:image/') ? activeImageId : (activeImageId ? mediaItems[activeImageId] : '');
  const ogImageId = property.openGraphImageId && mediaItems[property.openGraphImageId]
    ? property.openGraphImageId
    : property.featuredImageId && mediaItems[property.featuredImageId]
      ? property.featuredImageId
      : galleryIds.find((id) => mediaItems[id]) || '';

  React.useEffect(() => {
    setHeroIndex(0);
    setShowMoreInquiry(false);
    setFullName('');
    setPhone('');
    setEmail('');
    setMessage('');
    setViewerUrl('');
    setViewerTitle('');
  }, [property.id]);

  React.useEffect(() => {
    const title = property.seoTitleAr || property.seoTitleEn || t(property.title) || 'Property Details';
    const description = property.seoDescAr || property.seoDescEn || t(property.description) || '';
    const canonical = property.canonicalUrl || pageUrl || '';
    const imageUrl = ogImageId && mediaItems[ogImageId] ? mediaItems[ogImageId] : '';
    const locale = language === 'ar' ? 'ar_SA' : 'en_US';

    document.title = title;
    setOrCreateMeta('meta[name="description"]', { name: 'description', content: description });
    setOrCreateMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    setOrCreateMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    setOrCreateMeta('meta[property="og:type"]', { property: 'og:type', content: 'article' });
    setOrCreateMeta('meta[property="og:locale"]', { property: 'og:locale', content: locale });
    if (imageUrl) {
      setOrCreateMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
      setOrCreateMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });
    }
    setOrCreateMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: imageUrl ? 'summary_large_image' : 'summary' });
    setOrCreateMeta('meta[property="twitter:title"]', { property: 'twitter:title', content: title });
    setOrCreateMeta('meta[property="twitter:description"]', { property: 'twitter:description', content: description });
    if (canonical) {
      setOrCreateMeta('link[rel="canonical"]', { rel: 'canonical', href: canonical });
    }

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: title,
      description,
      url: canonical || pageUrl,
      image: imageUrl ? [imageUrl] : undefined,
      numberOfRooms: property.bedrooms || undefined,
      floorSize: property.areaSqm ? {
        '@type': 'QuantitativeValue',
        value: property.areaSqm,
        unitCode: 'MTK',
      } : undefined,
      offers: {
        '@type': 'Offer',
        price: property.price,
        priceCurrency: property.currency || 'SAR',
        availability: `https://schema.org/${property.status === 'sold' ? 'SoldOut' : property.status === 'reserved' ? 'LimitedAvailability' : 'InStock'}`,
        url: canonical || pageUrl,
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: t(property.address) || undefined,
        addressLocality: t(property.district) || undefined,
        addressRegion: t(property.location) || undefined,
      },
      geo: property.coordinates
        ? (() => {
            const [lat, lng] = property.coordinates.split(',').map((part) => Number(part.trim()));
            return Number.isFinite(lat) && Number.isFinite(lng)
              ? { '@type': 'GeoCoordinates', latitude: lat, longitude: lng }
              : undefined;
          })()
        : undefined,
    };

    const existingSchema = document.head.querySelector('script[data-property-schema="true"]');
    if (existingSchema) existingSchema.remove();

    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.setAttribute('data-property-schema', 'true');
    schemaScript.textContent = JSON.stringify(schema);
    document.head.appendChild(schemaScript);

    return () => {
      const cleanupSchema = document.head.querySelector('script[data-property-schema="true"]');
      cleanupSchema?.remove();
    };
  }, [property.id, language, activeImage, ogImageId, pageUrl]);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      if (heroImages.length <= 1) return;
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [heroImages.length]);

  React.useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightboxOpen(false);
      }
      if (event.key === 'ArrowLeft' && heroImages.length > 1) {
        setHeroIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
      }
      if (event.key === 'ArrowRight' && heroImages.length > 1) {
        setHeroIndex((prev) => (prev + 1) % heroImages.length);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen, heroImages.length]);

  React.useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  const projectPhone = (property as any).inquiryMobile || settings?.contactPhone || '';
  const propertyEmail = (property as any).inquiryEmail || settings?.contactEmail || '';
  const inquiryText = (property as any).inquiryMessageDefault || '';
  const whatsappUrl = projectPhone
    ? `https://wa.me/${projectPhone.replace(/[^\d]/g, '')}`
    : `https://wa.me/${(settings?.contactPhone || '').replace(/[^\d]/g, '')}`;

  const openMapsUrl = () => {
    if (property.coordinates) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.coordinates)}`;
    }
    const label = [t(property.address), t(property.district), t(property.location)].filter((item) => item && item !== na).join(' ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label || t(property.title))}`;
  };

  const shareProperty = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: t(property.title),
          text: t(property.description),
          url: pageUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(pageUrl);
    } catch {
      await navigator.clipboard.writeText(pageUrl).catch(() => undefined);
    }
  };

  const propertyFacts = [
    { label: language === 'ar' ? 'المرجع' : 'Reference', value: asText(property.unitCode || property.unitNumber || property.id) },
    { label: language === 'ar' ? 'النوع' : 'Type', value: asText(t(property.type)) },
    { label: language === 'ar' ? 'الهدف' : 'Purpose', value: asText(property.saleOrRent === 'rent' ? (language === 'ar' ? 'إيجار' : 'Rent') : (language === 'ar' ? 'بيع' : 'Sale')) },
    { label: language === 'ar' ? 'الحالة' : 'Status', value: asText(property.status) },
    { label: language === 'ar' ? 'المطور' : 'Developer', value: asText(t(property.developer)) },
    { label: language === 'ar' ? 'المشروع' : 'Project', value: asText(projectName) },
    { label: language === 'ar' ? 'المدينة' : 'City', value: asText(t(property.location)) },
    { label: language === 'ar' ? 'الحي' : 'District', value: asText(t(property.district)) },
    { label: language === 'ar' ? 'العنوان' : 'Address', value: asText(t(property.address)) },
    { label: language === 'ar' ? 'الإحداثيات' : 'Coordinates', value: asText(property.coordinates) },
    { label: language === 'ar' ? 'الملكية' : 'Ownership', value: asText(t(property.ownershipType)) },
    { label: language === 'ar' ? 'التشطيب' : 'Finishing', value: asText(t(property.finishingType)) },
  ];

  const summaryCards = [
    { label: language === 'ar' ? 'غرف النوم' : 'Bedrooms', value: asText(property.bedrooms), icon: summaryCardIcon(language === 'ar' ? 'غرف النوم' : 'Bedrooms') },
    { label: language === 'ar' ? 'دورات المياه' : 'Bathrooms', value: asText(property.bathrooms), icon: summaryCardIcon(language === 'ar' ? 'دورات المياه' : 'Bathrooms') },
    { label: language === 'ar' ? 'الصالات' : 'Living Rooms', value: asText(property.livingRooms), icon: summaryCardIcon(language === 'ar' ? 'الصالات' : 'Living Rooms') },
    { label: language === 'ar' ? 'المساحة' : 'Area', value: `${asText(property.areaSqm)} ${staticT('sqm')}`, icon: summaryCardIcon(language === 'ar' ? 'المساحة' : 'Area') },
    { label: language === 'ar' ? 'الشرفات' : 'Balconies', value: asText(property.balconies), icon: summaryCardIcon(language === 'ar' ? 'الشرفات' : 'Balconies') },
    { label: language === 'ar' ? 'المواقف' : 'Parking', value: asText(property.parkingSpaces), icon: summaryCardIcon(language === 'ar' ? 'المواقف' : 'Parking') },
    { label: language === 'ar' ? 'الطابق' : 'Floor', value: asText(property.floorNumber), icon: summaryCardIcon(language === 'ar' ? 'الطابق' : 'Floor') },
    { label: language === 'ar' ? 'العمر' : 'Age', value: asText(property.propertyAge), icon: summaryCardIcon(language === 'ar' ? 'العمر' : 'Age') },
  ];

  const highlightItems = property.highlights || [];
  const nearbyItems = property.nearbyPlaces || [];
  const groupedNearbyItems = groupNearbyPlaces(property.nearbyPlaces);
  const documents = property.documentMediaIds || [];
  const floorPlans = [property.floorPlanImageId, ...(property.floorPlanMediaIds || [])].filter(Boolean) as string[];
  const videoId = property.videoUploadId && mediaItems[property.videoUploadId] ? property.videoUploadId : '';
  const locationQuery = property.coordinates
    ? property.coordinates
    : [t(property.address), t(property.district), t(property.location)].filter((item) => item && item !== na).join(' ');
  const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(locationQuery || t(property.title))}&z=15&output=embed`;
  const listingDateValue = property.listingDate ? new Date(property.listingDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US') : na;

  const specifications = [
    { label: language === 'ar' ? 'المرجع' : 'Reference', value: property.unitCode || property.unitNumber || property.id, icon: specCardIcon(language === 'ar' ? 'المرجع' : 'Reference') },
    { label: language === 'ar' ? 'العنوان' : 'Title', value: t(property.title), icon: specCardIcon(language === 'ar' ? 'العنوان' : 'Title') },
    { label: language === 'ar' ? 'النوع' : 'Property Type', value: t(property.type), icon: specCardIcon(language === 'ar' ? 'النوع' : 'Property Type') },
    { label: language === 'ar' ? 'الهدف' : 'Purpose', value: property.saleOrRent === 'rent' ? (language === 'ar' ? 'إيجار' : 'Rent') : (language === 'ar' ? 'بيع' : 'Sale'), icon: specCardIcon(language === 'ar' ? 'الهدف' : 'Purpose') },
    { label: language === 'ar' ? 'الحالة' : 'Status', value: property.status, icon: specCardIcon(language === 'ar' ? 'الحالة' : 'Status') },
    { label: language === 'ar' ? 'السعر' : 'Price', value: `${property.price.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')} ${property.currency || 'SAR'}`, icon: specCardIcon(language === 'ar' ? 'السعر' : 'Price') },
    { label: language === 'ar' ? 'المساحة' : 'Area', value: `${asText(property.areaSqm)} ${staticT('sqm')}`, icon: specCardIcon(language === 'ar' ? 'المساحة' : 'Area') },
    { label: language === 'ar' ? 'غرف النوم' : 'Bedrooms', value: asText(property.bedrooms), icon: specCardIcon(language === 'ar' ? 'غرف النوم' : 'Bedrooms') },
    { label: language === 'ar' ? 'دورات المياه' : 'Bathrooms', value: asText(property.bathrooms), icon: specCardIcon(language === 'ar' ? 'دورات المياه' : 'Bathrooms') },
    { label: language === 'ar' ? 'الصالات' : 'Living Rooms', value: asText(property.livingRooms), icon: specCardIcon(language === 'ar' ? 'الصالات' : 'Living Rooms') },
    { label: language === 'ar' ? 'الشرفات' : 'Balconies', value: asText(property.balconies), icon: specCardIcon(language === 'ar' ? 'الشرفات' : 'Balconies') },
    { label: language === 'ar' ? 'المواقف' : 'Parking', value: asText(property.parkingSpaces), icon: specCardIcon(language === 'ar' ? 'المواقف' : 'Parking') },
    { label: language === 'ar' ? 'الطابق' : 'Floor', value: asText(property.floorNumber), icon: specCardIcon(language === 'ar' ? 'الطابق' : 'Floor') },
    { label: language === 'ar' ? 'العمر' : 'Age', value: asText(property.propertyAge), icon: specCardIcon(language === 'ar' ? 'العمر' : 'Age') },
    { label: language === 'ar' ? 'تاريخ الإدراج' : 'Listing Date', value: listingDateValue, icon: specCardIcon(language === 'ar' ? 'تاريخ الإدراج' : 'Listing Date') },
    { label: language === 'ar' ? 'المطور' : 'Developer', value: asText(t(property.developer)), icon: specCardIcon(language === 'ar' ? 'المطور' : 'Developer') },
    { label: language === 'ar' ? 'الملكية' : 'Ownership', value: asText(t(property.ownershipType)), icon: specCardIcon(language === 'ar' ? 'الملكية' : 'Ownership') },
    { label: language === 'ar' ? 'التشطيب' : 'Finishing', value: asText(t(property.finishingType)), icon: specCardIcon(language === 'ar' ? 'التشطيب' : 'Finishing') },
    { label: language === 'ar' ? 'المدينة' : 'City', value: asText(t(property.location)), icon: specCardIcon(language === 'ar' ? 'المدينة' : 'City') },
    { label: language === 'ar' ? 'الحي' : 'District', value: asText(t(property.district)), icon: specCardIcon(language === 'ar' ? 'الحي' : 'District') },
    { label: language === 'ar' ? 'العنوان التفصيلي' : 'Address', value: asText(t(property.address)), icon: specCardIcon(language === 'ar' ? 'العنوان التفصيلي' : 'Address') },
    { label: language === 'ar' ? 'الإحداثيات' : 'Coordinates', value: asText(property.coordinates), icon: specCardIcon(language === 'ar' ? 'الإحداثيات' : 'Coordinates') },
    { label: language === 'ar' ? 'المشروع' : 'Project', value: asText(projectName), icon: specCardIcon(language === 'ar' ? 'المشروع' : 'Project') },
  ];

  const relatedGroups: Array<{ title: string; items: Property[] }> = [];
  const seenRelated = new Set<string>();
  const takeUnique = (items: Property[], limit: number) => {
    const selected: Property[] = [];
    items.forEach((item) => {
      if (selected.length >= limit) return;
      if (seenRelated.has(item.id)) return;
      seenRelated.add(item.id);
      selected.push(item);
    });
    return selected;
  };

  const relatedByProject = property.projectId
    ? takeUnique(relatedProperties.filter((item) => item.projectId === property.projectId), 4)
    : [];
  const relatedByCity = takeUnique(
    relatedProperties.filter((item) => item.location?.ar === property.location?.ar || item.location?.en === property.location?.en),
    4,
  );
  const relatedByType = takeUnique(
    relatedProperties.filter((item) => item.type?.ar === property.type?.ar || item.type?.en === property.type?.en),
    4,
  );
  const relatedByPrice = property.price > 0
    ? takeUnique(
        relatedProperties.filter((item) => Math.abs(item.price - property.price) <= property.price * 0.2),
        4,
      )
    : [];

  if (relatedByProject.length) relatedGroups.push({ title: language === 'ar' ? 'ضمن نفس المشروع' : 'Same Project', items: relatedByProject });
  if (relatedByCity.length) relatedGroups.push({ title: language === 'ar' ? 'في نفس المدينة' : 'Same City', items: relatedByCity });
  if (relatedByType.length) relatedGroups.push({ title: language === 'ar' ? 'نفس النوع' : 'Same Type', items: relatedByType });
  if (relatedByPrice.length) relatedGroups.push({ title: language === 'ar' ? 'نطاق سعر قريب' : 'Similar Price Range', items: relatedByPrice });

  const writeInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiBase = import.meta.env.VITE_API_URL || '';
    try {
      const response = await fetch(`${apiBase}/api/inquiries`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          message: message || inquiryText || `Inquiry for ${t(property.title)}`,
          propertyId,
          projectId: property.projectId,
          status: 'new',
        }),
      });
      if (!response.ok) throw new Error('Inquiry failed');
      setFullName('');
      setPhone('');
      setEmail('');
      setMessage('');
      alert(language === 'ar' ? 'تم إرسال الاستفسار بنجاح' : 'Inquiry sent successfully');
    } catch {
      alert(language === 'ar' ? 'تعذر إرسال الاستفسار حالياً' : 'Unable to send inquiry right now');
    }
  };

  const openLightbox = (index: number) => {
    if (!heroImages.length) return;
    setHeroIndex(index);
    setLightboxOpen(true);
  };

  const openViewer = (url: string, title: string) => {
    if (!url) return;
    setViewerUrl(url);
    setViewerTitle(title);
  };

  const goToPrevImage = () => {
    if (heroImages.length <= 1) return;
    setHeroIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const goToNextImage = () => {
    if (heroImages.length <= 1) return;
    setHeroIndex((prev) => (prev + 1) % heroImages.length);
  };

  const scrollToInquiry = () => {
    const element = document.getElementById('property-inquiry-panel');
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const emptyState = (label: string) => (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-400 text-center">
      {label}
    </div>
  );

  return (
    <div className={`max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-36 lg:py-10 ${pageAlignClass}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between gap-4 mb-5">
        <button
          onClick={() => onNavigate?.('properties')}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:border-slate-300"
        >
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          <span>{language === 'ar' ? 'العودة لقائمة العقارات' : 'Back to listings'}</span>
        </button>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{language === 'ar' ? 'العقار' : 'Property'}</span>
          <span>/</span>
          <span className="font-bold text-slate-700">{asText(t(property.title))}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="relative min-h-[420px] bg-gradient-to-br from-slate-100 to-slate-200">
                <div className="absolute inset-0">
                  {activeImage ? (
                    <button
                      type="button"
                      onClick={() => openLightbox(heroIndex)}
                      className="group relative h-full w-full"
                      aria-label={language === 'ar' ? 'فتح معرض الصور' : 'Open image gallery'}
                    >
                      <img src={activeImage} alt={t(property.title)} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-white backdrop-blur-sm">
                        <Eye className="w-3.5 h-3.5" />
                        {language === 'ar' ? 'عرض الصورة' : 'View Image'}
                      </div>
                      <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-900 shadow-lg backdrop-blur-sm">
                        <Maximize2 className="w-3.5 h-3.5" />
                        {language === 'ar' ? 'تكبير' : 'Zoom'}
                      </div>
                    </button>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
                      {na}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black text-white">{asText(property.status)}</span>
                  {property.featured && <span className="rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black text-slate-950">{language === 'ar' ? 'مميز' : 'Featured'}</span>}
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 text-white">
                  <div>
                    <h1 className="max-w-3xl text-3xl md:text-5xl font-black leading-tight">{asText(t(property.title))}</h1>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/90">
                      <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" />{asText(t(property.location))}</span>
                      <span className="inline-flex items-center gap-1">{asText(t(property.district))}</span>
                      <span className="inline-flex items-center gap-1 font-mono">{asText(property.unitCode || property.unitNumber || property.id)}</span>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/90 px-4 py-3 text-right text-slate-950 shadow-xl">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{language === 'ar' ? 'السعر' : 'Price'}</div>
                    <div className="text-2xl font-black text-amber-700">{asText(property.price.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US'))}</div>
                    <div className="text-xs text-slate-500">{asText(property.currency || 'SAR')}</div>
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs font-black text-white/90">
                  <span className="rounded-full bg-black/50 px-3 py-1">{heroIndex + 1} / {heroImages.length || 1}</span>
                </div>
              </div>

              <div className="p-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-slate-200 bg-[#f9fafb]">
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={shareProperty} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold hover:bg-slate-50 inline-flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" /> {language === 'ar' ? 'مشاركة' : 'Share'}
                  </button>
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 inline-flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                  </a>
                  <a href={`tel:${projectPhone || settings?.contactPhone || ''}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold inline-flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" /> {language === 'ar' ? 'اتصال' : 'Call'}
                  </a>
                  <button onClick={() => setSaved((prev) => !prev)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold inline-flex items-center justify-center gap-2">
                    <Heart className={`w-4 h-4 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} /> {saved ? (language === 'ar' ? 'محفوظ' : 'Saved') : (language === 'ar' ? 'حفظ' : 'Save')}
                  </button>
                  <button onClick={() => window.print()} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold inline-flex items-center justify-center gap-2 col-span-2">
                    <Printer className="w-4 h-4" /> {language === 'ar' ? 'طباعة' : 'Print'}
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {heroImages.length > 0 ? heroImages.map((id, index) => (
                    <button
                      key={id}
                      onClick={() => openLightbox(index)}
                      className={`h-16 overflow-hidden rounded-xl border ${index === heroIndex ? 'border-amber-500 ring-2 ring-amber-200' : 'border-slate-200'} bg-slate-100`}
                      title={language === 'ar' ? 'فتح الصورة' : 'Open image'}
                    >
                      <img
                        src={id.startsWith('data:image/') ? id : mediaItems[id]}
                        alt={`slide-${index}`}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  )) : (
                    <div className="col-span-5">{emptyState(language === 'ar' ? 'لا توجد صور إضافية' : 'No gallery images') }</div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {summaryCards.map((card) => (
                <div key={card.label} className={`rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 space-y-3 ${pageAlignClass}`}>
                  <div className={`flex items-center justify-between gap-3 ${rowFlowClass}`}>
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-amber-700 ring-1 ring-amber-100 shadow-sm">
                      <card.icon className="h-4 w-4" />
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{card.label}</div>
                  </div>
                  <div className="text-lg font-black text-slate-900">{card.value || na}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className={`text-xl font-black text-slate-950 ${pageAlignClass}`}>{language === 'ar' ? 'نظرة عامة' : 'Overview'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              {propertyFacts.map((item) => (
                <div key={item.label} className={`flex items-start justify-between gap-4 border-b border-dashed border-slate-100 pb-2 ${rowFlowClass}`}>
                  <span className={`text-slate-400 ${pageAlignClass}`}>{item.label}</span>
                  <span className={`font-bold text-slate-900 ${pageAlignClass}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className={`text-xl font-black text-slate-950 ${pageAlignClass}`}>{language === 'ar' ? 'المواصفات' : 'Specifications'}</h2>
            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {specifications.map((item, index) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between gap-4 px-4 py-3 text-sm ${index % 2 === 0 ? 'bg-slate-50/80' : 'bg-white'} border-b border-slate-100 last:border-b-0 ${rowFlowClass}`}
                  >
                    <div className={`flex items-center gap-3 ${rowFlowClass}`}>
                      <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className={`text-slate-400 ${pageAlignClass}`}>{item.label}</span>
                    </div>
                    <span className={`font-bold text-slate-900 ${isArabic ? 'text-left' : 'text-right'}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className={`text-xl font-black text-slate-950 ${pageAlignClass}`}>{language === 'ar' ? 'الوصف' : 'Description'}</h2>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
              {renderRichDescription(language === 'ar' ? property.description.ar : property.description.en)}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className={`text-xl font-black text-slate-950 ${pageAlignClass}`}>{language === 'ar' ? 'أبرز المميزات' : 'Highlights'}</h2>
            {highlightItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {highlightItems.map((item, idx) => (
                  <div key={idx} className="rounded-2xl border border-amber-100 bg-amber-50/40 px-4 py-4 font-bold text-slate-900">
                    {t(item)}
                  </div>
                ))}
              </div>
            ) : emptyState(language === 'ar' ? 'N/A' : 'N/A')}
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className={`text-xl font-black text-slate-950 ${pageAlignClass}`}>{language === 'ar' ? 'المرافق والخدمات' : 'Amenities & Features'}</h2>
            <AmenitiesSection property={property} language={language} />
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className={`text-xl font-black text-slate-950 ${pageAlignClass}`}>{language === 'ar' ? 'المخططات' : 'Floor Plans'}</h2>
              {floorPlans.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {floorPlans.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => mediaItems[id] && openViewer(mediaItems[id], `${language === 'ar' ? 'مخطط' : 'Floor Plan'} ${id}`)}
                      className={`rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-amber-200 hover:bg-amber-50/30 ${pageAlignClass}`}
                    >
                      {mediaItems[id] ? (
                        <div className="space-y-3">
                          <div className={`flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400 ${rowFlowClass}`}>
                            <span>{language === 'ar' ? 'مخطط' : 'Floor Plan'}</span>
                            <span>{language === 'ar' ? 'عرض' : 'View'}</span>
                          </div>
                          <img src={mediaItems[id]} alt="floor plan" className="h-48 w-full object-contain" referrerPolicy="no-referrer" />
                          <div className={`text-[10px] text-slate-400 font-mono ${isArabic ? 'text-left' : 'text-right'}`}>{id}</div>
                        </div>
                      ) : (
                        emptyState(na)
                      )}
                    </button>
                  ))}
                </div>
              ) : emptyState(language === 'ar' ? 'لا توجد مخططات متاحة' : 'No floor plans available')}
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className={`text-xl font-black text-slate-950 ${pageAlignClass}`}>{language === 'ar' ? 'الوثائق' : 'Documents'}</h2>
              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((id) => {
                    const file = mediaItems[id];
                    return (
                      <div key={id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-amber-600 mt-1" />
                            <div>
                              <div className="font-bold text-slate-900">{id}</div>
                              <div className="text-xs text-slate-400">{file ? (language === 'ar' ? 'ملف مرفق' : 'Attached file') : na}</div>
                            </div>
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            {language === 'ar' ? 'مستند' : 'Document'}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {file ? (
                            <>
                              <button
                                type="button"
                                onClick={() => openViewer(file, id)}
                                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-amber-200 hover:text-amber-800"
                              >
                                {language === 'ar' ? 'عرض' : 'View'}
                              </button>
                              <a href={file} download className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800">
                                {language === 'ar' ? 'تنزيل' : 'Download'}
                              </a>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400">{na}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : emptyState(language === 'ar' ? 'لا توجد مستندات متاحة' : 'No documents available')}
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className={`text-xl font-black text-slate-950 ${pageAlignClass}`}>{language === 'ar' ? 'الفيديو والجولة الافتراضية' : 'Video & Virtual Tour'}</h2>
              <div className="space-y-3">
                {videoId ? (
                  <video controls className="w-full rounded-2xl border border-slate-200 bg-slate-950" src={mediaItems[videoId]} />
                ) : emptyState(language === 'ar' ? 'لا يوجد فيديو متاح' : 'No video available')}
                <div className="flex flex-wrap gap-3 text-sm">
                  <a href={property.projectVideoUrl || '#'} className={`rounded-full border px-4 py-2 font-bold ${property.projectVideoUrl ? 'border-slate-200 bg-white' : 'border-dashed border-slate-200 text-slate-400 pointer-events-none'}`}>{language === 'ar' ? 'فيديو المشروع' : 'Project Video'}</a>
                  <a href={property.virtualTourUrl || '#'} className={`rounded-full border px-4 py-2 font-bold ${property.virtualTourUrl ? 'border-slate-200 bg-white' : 'border-dashed border-slate-200 text-slate-400 pointer-events-none'}`}>{language === 'ar' ? 'جولة افتراضية' : 'Virtual Tour'}</a>
                  <a href={property.tour360Url || '#'} className={`rounded-full border px-4 py-2 font-bold ${property.tour360Url ? 'border-slate-200 bg-white' : 'border-dashed border-slate-200 text-slate-400 pointer-events-none'}`}>{language === 'ar' ? 'جولة 360' : '360 Tour'}</a>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className={`text-xl font-black text-slate-950 ${pageAlignClass}`}>{language === 'ar' ? 'الموقع والخريطة' : 'Location & Map'}</h2>
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] gap-4">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
                  {locationQuery ? (
                    <iframe
                      title={language === 'ar' ? 'خريطة الموقع' : 'Location map'}
                      src={mapsEmbedUrl}
                      className="aspect-[16/10] w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="aspect-[16/10] flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                      <div className="text-center">
                        <MapPin className="mx-auto mb-2 w-8 h-8 text-amber-600" />
                        <div className="text-sm font-bold">{na}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{language === 'ar' ? 'تفاصيل الموقع' : 'Location details'}</div>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">{language === 'ar' ? 'المدينة' : 'City'}</span>
                        <span className="font-bold text-slate-900">{asText(t(property.location))}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">{language === 'ar' ? 'الحي' : 'District'}</span>
                        <span className="font-bold text-slate-900">{asText(t(property.district))}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">{language === 'ar' ? 'العنوان' : 'Address'}</span>
                        <span className="font-bold text-slate-900 text-left">{asText(t(property.address))}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">{language === 'ar' ? 'الإحداثيات' : 'Coordinates'}</span>
                        <span className="font-mono text-xs font-bold text-slate-900 text-left">{asText(property.coordinates)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <a href={openMapsUrl()} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800">
                      <ExternalLink className="w-4 h-4" />
                      {language === 'ar' ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}
                    </a>
                    {property.coordinates && (
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(property.coordinates || '').catch(() => undefined)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
                      >
                        <Copy className="w-4 h-4" />
                        {language === 'ar' ? 'نسخ الإحداثيات' : 'Copy coordinates'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-black text-slate-950">{language === 'ar' ? 'المواقع القريبة' : 'Nearby Places'}</h2>
            {nearbyItems.length > 0 ? (
              <div className="space-y-4">
                {groupedNearbyItems.map(([type, items]) => (
                  <div key={type} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">{type}</div>
                      <div className="text-xs font-bold text-slate-500">{items.length}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {items.map((item, idx) => (
                        <div key={`${type}-${idx}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                          <div className="font-bold text-slate-900">{t(item.name)}</div>
                          <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                            <span className="text-slate-400">{item.type}</span>
                            <span className="font-bold text-amber-700">{item.distance}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : emptyState(language === 'ar' ? 'لا توجد بيانات للمواقع القريبة' : 'No nearby places listed')}
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-black text-slate-950">{language === 'ar' ? 'عقارات مشابهة' : 'Related Properties'}</h2>
              <div className="text-xs font-bold text-slate-400">{relatedProperties.length}</div>
            </div>
            {relatedGroups.length > 0 ? (
              <div className="space-y-6">
                {relatedGroups.map((group) => (
                  <div key={group.title} className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">{group.title}</div>
                      <div className="text-xs font-bold text-slate-500">{group.items.length}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                      {group.items.map((item, index) => (
                        <button
                          key={item.id}
                          onClick={() => onNavigate?.(`property-${buildPropertySlug(item)}`)}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-right shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="h-36 bg-slate-100">
                            <img
                              src={item.featuredImageId && mediaItems[item.featuredImageId]
                                ? mediaItems[item.featuredImageId]
                                : placeholderImages[index % placeholderImages.length]}
                              alt={t(item.title)}
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="p-4 space-y-2">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{asText(t(item.type))}</div>
                            <div className="font-black text-slate-900 line-clamp-2">{asText(t(item.title))}</div>
                            <div className="text-sm font-bold text-amber-700">{asText(item.price.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US'))} {asText(item.currency || 'SAR')}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : emptyState(language === 'ar' ? 'لا توجد عقارات مشابهة حالياً' : 'No related properties yet')}
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 self-start">
          <div id="property-inquiry-panel" className="rounded-[28px] border border-slate-200 bg-[#0B1220] text-white shadow-[0_24px_60px_rgba(15,23,42,0.25)] p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-white/50">{language === 'ar' ? 'التواصل والاستفسار' : 'Contact & Inquiry'}</div>
                <h3 className="mt-2 text-2xl font-black">{language === 'ar' ? 'نحن هنا لمساعدتك' : 'We are here to help'}</h3>
              </div>
              <Star className="w-5 h-5 text-amber-400" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center font-bold">
                WhatsApp
              </a>
              <a href={`tel:${projectPhone || settings?.contactPhone || ''}`} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center font-bold">
                Call
              </a>
              <a href={propertyEmail ? `mailto:${propertyEmail}` : '#'} className={`rounded-2xl border px-3 py-3 text-center font-bold ${propertyEmail ? 'border-white/10 bg-white/5' : 'border-dashed border-white/10 bg-white/0 text-white/30 pointer-events-none'}`}>
                Email
              </a>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center font-bold text-[10px] uppercase tracking-[0.25em]">
                Ref {asText(property.unitCode || property.unitNumber || property.id)}
              </div>
            </div>

            <form onSubmit={writeInquiry} className="space-y-3">
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full name'} className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={language === 'ar' ? 'رقم الجوال' : 'Mobile'} className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none" />
              <button type="button" onClick={() => setShowMoreInquiry((prev) => !prev)} className="w-full text-xs font-bold text-white/70">
                {showMoreInquiry ? (language === 'ar' ? 'إخفاء التفاصيل الإضافية' : 'Hide extra details') : (language === 'ar' ? 'تفاصيل إضافية' : 'More details')}
              </button>
              {showMoreInquiry && (
                <div className="space-y-3">
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email'} className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none" />
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder={language === 'ar' ? 'رسالة قصيرة' : 'Short message'} className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none" />
                </div>
              )}
              <button type="submit" className="w-full rounded-2xl bg-amber-400 px-4 py-3 text-sm font-black text-slate-950">
                {language === 'ar' ? 'إرسال الاستفسار' : 'Send inquiry'}
              </button>
            </form>

            <div className="grid grid-cols-3 gap-2 text-[10px] text-white/75">
              <div className="rounded-2xl bg-white/5 p-3 text-center">{language === 'ar' ? 'حفظ' : 'Save'}</div>
              <div className="rounded-2xl bg-white/5 p-3 text-center">{language === 'ar' ? 'مشاركة' : 'Share'}</div>
              <div className="rounded-2xl bg-white/5 p-3 text-center">{language === 'ar' ? 'مباشر' : 'Direct'}</div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">{language === 'ar' ? 'ملخص سريع' : 'Quick summary'}</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span className="text-slate-400">{language === 'ar' ? 'مرجع' : 'Ref'}</span><span className="font-bold">{asText(property.unitCode || property.unitNumber || property.id)}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-400">{language === 'ar' ? 'المشروع' : 'Project'}</span><span className="font-bold">{asText(projectName)}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-400">{language === 'ar' ? 'السعر' : 'Price'}</span><span className="font-bold text-amber-700">{asText(property.price.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US'))} {asText(property.currency || 'SAR')}</span></div>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-3 z-[115] px-3 lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2 rounded-[24px] border border-slate-800 bg-[#0B1220]/95 p-2 shadow-[0_24px_80px_rgba(15,23,42,0.45)] backdrop-blur-md">
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-2xl bg-white/5 px-2 py-3 text-center text-[10px] font-bold text-white">
            WhatsApp
          </a>
          <a href={`tel:${projectPhone || settings?.contactPhone || ''}`} className="rounded-2xl bg-white/5 px-2 py-3 text-center text-[10px] font-bold text-white">
            Call
          </a>
          <a href={propertyEmail ? `mailto:${propertyEmail}` : '#'} className={`rounded-2xl px-2 py-3 text-center text-[10px] font-bold ${propertyEmail ? 'bg-white/5 text-white' : 'pointer-events-none border border-dashed border-white/10 text-white/30'}`}>
            Email
          </a>
          <button type="button" onClick={scrollToInquiry} className="rounded-2xl bg-amber-400 px-2 py-3 text-center text-[10px] font-black text-slate-950">
            Inquiry
          </button>
        </div>
      </div>

      {lightboxOpen && heroImages.length > 0 && (
        <div
          className="fixed inset-0 z-[120] bg-black/92 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={language === 'ar' ? 'معرض الصور' : 'Image gallery'}
          onClick={() => setLightboxOpen(false)}
          onTouchStart={(e) => setTouchStartX(e.touches[0]?.clientX ?? null)}
          onTouchEnd={(e) => {
            if (touchStartX === null) return;
            const endX = e.changedTouches[0]?.clientX ?? touchStartX;
            const deltaX = endX - touchStartX;
            if (Math.abs(deltaX) > 50) {
              if (deltaX > 0) {
                goToPrevImage();
              } else {
                goToNextImage();
              }
            }
            setTouchStartX(null);
          }}
        >
          <div className="absolute inset-0 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-4 px-4 py-4 text-white/90 sm:px-6 lg:px-8">
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">
                {asText(t(property.title))} · {heroIndex + 1} / {heroImages.length}
              </div>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold hover:bg-white/20"
              >
                <X className="w-4 h-4" />
                <span>{language === 'ar' ? 'إغلاق' : 'Close'}</span>
              </button>
            </div>

            <div className="relative flex-1 flex items-center justify-center px-4 pb-4 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={goToPrevImage}
                className="absolute left-4 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/20"
                aria-label={language === 'ar' ? 'الصورة السابقة' : 'Previous image'}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="max-h-[78vh] w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={t(property.title)}
                    className="h-full max-h-[78vh] w-full object-contain bg-black"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex min-h-[50vh] items-center justify-center text-sm text-white/50">{na}</div>
                )}
              </div>

              <button
                type="button"
                onClick={goToNextImage}
                className="absolute right-4 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/20"
                aria-label={language === 'ar' ? 'الصورة التالية' : 'Next image'}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 pb-5 sm:px-6 lg:px-8">
              <div className="mx-auto grid w-full max-w-6xl grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
                {heroImages.map((id, index) => (
                  <button
                    key={`lightbox-${id}`}
                    type="button"
                    onClick={() => setHeroIndex(index)}
                    className={`aspect-square overflow-hidden rounded-xl border transition-all ${index === heroIndex ? 'border-amber-400 ring-2 ring-amber-300/40 scale-[1.02]' : 'border-white/10 opacity-70 hover:opacity-100'}`}
                  >
                    {mediaItems[id] ? (
                      <img src={mediaItems[id]} alt={`thumbnail-${index}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-white/5 text-[10px] font-bold text-white/40">{na}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewerUrl && (
        <div
          className="fixed inset-0 z-[130] bg-slate-950/95 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={viewerTitle || (language === 'ar' ? 'المعاينة' : 'Preview')}
          onClick={() => setViewerUrl('')}
        >
          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 lg:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{language === 'ar' ? 'معاينة المستند' : 'Document preview'}</div>
                  <div className="mt-1 text-sm font-bold text-slate-950">{viewerTitle || na}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewerUrl('')}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <X className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إغلاق' : 'Close'}</span>
                </button>
              </div>
              <div className="bg-slate-100">
                <iframe
                  src={viewerUrl}
                  title={viewerTitle || 'Document preview'}
                  className="h-[80vh] w-full border-0"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
