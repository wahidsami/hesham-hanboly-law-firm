import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  CheckCircle, 
  Building, 
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  Briefcase,
  Clock,
  Upload,
  Trash2,
  FileText,
  Paperclip,
  Mic,
  StopCircle,
  ShieldCheck,
  CreditCard,
  BadgeCheck,
  Lock
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteContent } from '../content/ContentContext';
import { contentClient } from '../content/contentClient';
import type { CMSPublishedPageRecord } from '../types';

interface ContactPageProps {
  onScrollToContact?: () => void;
  onBackToHome?: () => void;
}

function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

type BookingStep = 'details' | 'gateway' | 'done';
type AttachmentItem = {
  id: string;
  name: string;
  size: number;
  type: string;
  category: 'document' | 'image';
  previewUrl: string;
  file: File;
};

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const MAX_RECORDING_SECONDS = 180;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function detectCardBrand(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, '');
  if (/^(588845|440795|457865|486094|486095|446404|968208)/.test(digits)) return 'mada';
  if (/^4/.test(digits)) return 'visa';
  if (/^5[1-5]/.test(digits)) return 'mastercard';
  return 'card';
}

function validateSaudiId(idValue: string) {
  const digits = idValue.replace(/\D/g, '');
  if (!digits) {
    return { valid: false, message: '' };
  }
  if (!/^[12]\d{9}$/.test(digits)) {
    return {
      valid: false,
      message: 'Saudi ID/Iqama must be 10 digits and start with 1 (citizen) or 2 (resident).',
    };
  }
  return { valid: true, message: digits.startsWith('1') ? 'Valid Saudi citizen ID' : 'Valid resident Iqama' };
}

export default function ContactPage({ onScrollToContact, onBackToHome }: ContactPageProps) {
  const { direction, language, t } = useLanguage();
  const { content } = useSiteContent();
  const siteSettings = content?.siteSettings;
  const [contactCmsPage, setContactCmsPage] = useState<CMSPublishedPageRecord | null>(null);

  // Smooth scroll back to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCmsContact() {
      try {
        const page = await contentClient.getCmsPage('contact');
        if (!cancelled) {
          setContactCmsPage(page);
        }
      } catch {
        if (!cancelled) {
          setContactCmsPage(null);
        }
      }
    }

    void loadCmsContact();
    return () => {
      cancelled = true;
    };
  }, []);

  const [activeOfficeIndex, setActiveOfficeIndex] = useState(0);
  const [bookingStep, setBookingStep] = useState<BookingStep>('details');
  const [idNumber, setIdNumber] = useState('');
  const [idTouched, setIdTouched] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingBlobUrl, setRecordingBlobUrl] = useState('');
  const [recordingFile, setRecordingFile] = useState<File | null>(null);
  const [recordingError, setRecordingError] = useState('');
  const [isRecordingSupported, setIsRecordingSupported] = useState(true);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [showCardBack, setShowCardBack] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [voucherId, setVoucherId] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [paymentSummary, setPaymentSummary] = useState({
    fullName: '',
    phone: '',
    email: '',
    idNumber: '',
    message: '',
  });
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    message: ''
  });
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recorderStreamRef = useRef<MediaStream | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const idValidation = validateSaudiId(idNumber);
  const detectedBrand = detectCardBrand(cardNumber);
  const canProceedToGateway = Boolean(
    formData.fullName.trim() &&
    formData.phone.trim() &&
    formData.email.trim() &&
    idValidation.valid
  );

  const resetRecording = () => {
    if (recordingTimerRef.current) {
      window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    recorderStreamRef.current?.getTracks().forEach((track) => track.stop());
    recorderRef.current = null;
    recorderStreamRef.current = null;
    recordingChunksRef.current = [];
    if (recordingBlobUrl) {
      URL.revokeObjectURL(recordingBlobUrl);
    }
    setRecordingStatus('idle');
    setRecordingSeconds(0);
    setRecordingBlobUrl('');
    setRecordingFile(null);
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    if (recordingTimerRef.current) {
      window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const startRecording = async () => {
    setRecordingError('');
    if (!navigator.mediaDevices?.getUserMedia || typeof window.MediaRecorder === 'undefined') {
      setIsRecordingSupported(false);
      setRecordingError(t('التسجيل الصوتي غير مدعوم في هذا المتصفح.', 'Voice recording is not supported in this browser.'));
      return;
    }

    try {
      resetRecording();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorderStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recordingChunksRef.current = [];
      setRecordingStatus('recording');
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(recordingChunksRef.current, { type: 'audio/webm' });
        const blobUrl = URL.createObjectURL(blob);
        setRecordingBlobUrl(blobUrl);
        setRecordingFile(new File([blob], `consultation-recording-${Date.now()}.webm`, { type: 'audio/webm' }));
        setRecordingStatus('paused');
        if (recordingTimerRef.current) {
          window.clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        recorderStreamRef.current?.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((current) => {
          const nextValue = current + 1;
          if (nextValue >= MAX_RECORDING_SECONDS) {
            stopRecording();
            return MAX_RECORDING_SECONDS;
          }
          return nextValue;
        });
      }, 1000);
    } catch {
      setRecordingError(t('تعذر الوصول إلى الميكروفون. تأكد من منح الإذن.', 'Could not access the microphone. Please allow microphone permissions.'));
    }
  };

  const addFiles = (fileList: FileList | File[]) => {
    const accepted = Array.from(fileList).filter((file) => {
      const isValidType =
        file.type.startsWith('image/') ||
        file.type === 'application/pdf' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.toLowerCase().endsWith('.docx');
      return isValidType && file.size <= MAX_UPLOAD_BYTES;
    });

    const nextItems = accepted.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      category: file.type.startsWith('image/') ? 'image' : 'document',
      previewUrl: URL.createObjectURL(file),
      file,
    }));

    setAttachments((current) => [...current, ...nextItems]);
  };

  const handleFilesFromEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addFiles(event.target.files);
      event.target.value = '';
    }
  };

  const handleDropFiles = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingFiles(false);
    if (event.dataTransfer.files.length > 0) {
      addFiles(event.dataTransfer.files);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((current) => {
      const target = current.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return current.filter((item) => item.id !== id);
    });
  };

  const handleProceedToGateway = () => {
    setIdTouched(true);
    if (!canProceedToGateway) {
      return;
    }
    setPaymentSummary({
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      idNumber,
      message: formData.message,
    });
    setBookingStep('gateway');
  };

  const handlePayment = async () => {
    if (!cardNumber.trim() || !cardHolder.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
      return;
    }
    setIsPaymentProcessing(true);
    setSubmitError('');
    const generatedVoucherId = `KSA-${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 900));
      const consultation = await contentClient.submitConsultation({
        fullName: paymentSummary.fullName || formData.fullName,
        phone: paymentSummary.phone || formData.phone,
        email: paymentSummary.email || formData.email,
        idNumber: paymentSummary.idNumber || idNumber,
        message: paymentSummary.message || formData.message,
        voucherId: generatedVoucherId,
        paymentAmount: '80.00 SAR',
        paymentStatus: 'paid',
        cardBrand: detectCardBrand(cardNumber),
        cardLast4: cardNumber.replace(/\D/g, '').slice(-4),
        attachments: attachments.map((item) => item.file),
        recording: recordingFile,
      });
      setVoucherId(consultation.consultation.voucherId || generatedVoucherId);
      setPaymentSuccess(true);
      setBookingStep('done');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit consultation.');
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      resetRecording();
      attachments.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      if (recordingBlobUrl) {
        URL.revokeObjectURL(recordingBlobUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contactBlocks = useMemo(
    () => contactCmsPage?.blocks?.filter((block) => block.type === 'contact') ?? [],
    [contactCmsPage]
  );

  const offices = useMemo(() => {
    const mapped = contactBlocks.slice(0, 2).map((block, index) => ({
      key: block.id,
      name: t(
        toStringValue(block.data?.officeNameAr ?? block.data?.headingAr, index === 0 ? 'مكتب جدة الرئيسي' : 'فرع الرياض'),
        toStringValue(block.data?.officeNameEn ?? block.data?.headingEn, index === 0 ? 'Jeddah Main Office (HQ)' : 'Riyadh Branch')
      ),
      phone: toStringValue(block.data?.phone, index === 0 ? '012 6636716 / 920004713' : '0112101333 / 0112101555'),
      address: t(
        toStringValue(block.data?.addressAr, index === 0
          ? 'حي الروضة ١، شارع نهضة التعليم، متفرع من شارع التحلية، مجمع صفوة الأعمال، فيلا رقم ٦'
          : 'طريق الملك عبد العزيز، تقاطع شارع أبي الحسن المحدّث، مبنى الرومي - مدخل رقم واحد'
        ),
        toStringValue(block.data?.addressEn, index === 0
          ? 'Al-Rawdah 1 District, Nahdat Al-Taleem St, off Tahlia St, Safwah Business Center, Villa No. 6'
          : 'King Abdulaziz Road, intersection with Abi Al-Hasan Al-Muhaddith St, Al-Rumi Building - Entrance 1'
        )
      ),
      workHours: t(
        toStringValue(block.data?.workHoursAr, 'الأحد - الخميس: ٨:٣٠ ص - ٥:٣٠ م'),
        toStringValue(block.data?.workHoursEn, 'Sunday - Thursday: 8:30 AM - 5:30 PM')
      ),
      email: toStringValue(block.data?.email, 'mec_law@hotmail.com'),
    }));

    if (mapped.length > 0) return mapped;

    return [
      {
        key: 'fallback-jeddah',
        name: t('مكتب جدة الرئيسي', 'Jeddah Main Office (HQ)'),
        phone: '012 6636716 / 920004713',
        address: t(
          'حي الروضة ١، شارع نهضة التعليم، متفرع من شارع التحلية، مجمع صفوة الأعمال، فيلا رقم ٦',
          'Al-Rawdah 1 District, Nahdat Al-Taleem St, off Tahlia St, Safwah Business Center, Villa No. 6'
        ),
        workHours: t('الأحد - الخميس: ٨:٣٠ ص - ٥:٣٠ م', 'Sunday - Thursday: 8:30 AM - 5:30 PM'),
        email: 'mec_law@hotmail.com',
      },
      {
        key: 'fallback-riyadh',
        name: t('فرع الرياض', 'Riyadh Branch'),
        phone: '0112101333 / 0112101555',
        address: t(
          'طريق الملك عبد العزيز، تقاطع شارع أبي الحسن المحدّث، مبنى الرومي - مدخل رقم واحد',
          'King Abdulaziz Road, intersection with Abi Al-Hasan Al-Muhaddith St, Al-Rumi Building - Entrance 1'
        ),
        workHours: t('الأحد - الخميس: ٨:٣٠ ص - ٥:٣٠ م', 'Sunday - Thursday: 8:30 AM - 5:30 PM'),
        email: 'mec_law@hotmail.com',
      },
    ];
  }, [contactBlocks, t]);

  const isRtl = direction === 'rtl';
  const textAlignClass = isRtl ? 'text-right' : 'text-left';

  return (
    <div 
      className="min-h-screen bg-[#F1ECE3] overflow-x-hidden font-sans select-none text-[#1E1E1E]" 
      style={{ direction }}
    >
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-[#121212] py-24 text-white overflow-hidden border-b border-[#A56A1E]/30">
        
        {/* Luxury Background Layers */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(165,106,30,0.18)_0%,transparent_75%)] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#F1ECE3] to-transparent pointer-events-none opacity-100 z-10" />
        
        {/* Floating gold lines decor */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="15%" y1="0" x2="25%" y2="100%" stroke="#A56A1E" strokeWidth="1" />
            <line x1="85%" y1="0" x2="75%" y2="100%" stroke="#A56A1E" strokeWidth="1" />
            <circle cx="35%" cy="40%" r="4" fill="#A56A1E" />
            <circle cx="65%" cy="70%" r="3" fill="#A56A1E" />
          </svg>
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 space-y-6 text-center lg:text-start">
          
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex self-center lg:self-start items-center gap-2 px-3 py-1.5 rounded-full bg-[#A56A1E]/15 border border-[#A56A1E]/30 text-xs text-[#E5D5C5] font-semibold tracking-wider uppercase"
            >
              <span className="w-2 h-2 rounded-full bg-[#A56A1E] animate-pulse" />
              <span>
                {t(
                  siteSettings?.contactHeroBadgeAr || 'تواصل معنا',
                  siteSettings?.contactHeroBadgeEn || 'CONTACT US'
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
                {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>{t('العودة للرئيسية', 'Back to Home')}</span>
              </motion.button>
            )}
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight"
          >
            {t(
              siteSettings?.contactHeroTitleAr || 'خبراء قانونيون على استعداد لخدمتك',
              siteSettings?.contactHeroTitleEn || 'Strategic Counselors Prepared to Defend'
            )}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="h-[2px] w-16 bg-[#A56A1E] mx-auto lg:mx-0"
          />

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-[#E2DCD3] text-base sm:text-lg lg:text-xl font-light max-w-3xl leading-relaxed text-justify lg:text-start"
          >
            {t(
              siteSettings?.contactHeroDescAr || 'تواصل معنا للحصول على استشارات قانونية احترافية وخدمات قانونية متخصصة للأفراد والشركات في جميع أنحاء المملكة.',
              siteSettings?.contactHeroDescEn || 'Reach out for refined legal consultations and bespoke representation, serving corporate players and prestigious individuals throughout the Kingdom.'
            )}
          </motion.p>

        </div>
      </section>


      {/* 2. NATIONWIDE CONTACT INFORMATION SECTION */}
      <section className="py-20 bg-[#F8F5EF] relative border-b border-[#D8D1C7]/40">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-16 max-w-3xl mx-auto">
            <span className="text-xs font-semibold text-[#A56A1E] uppercase tracking-wider block">
              {t(
                siteSettings?.contactSectionBadgeAr || 'نحن حيث يتواجد عملاؤنا ومصالحهم الاستثمارية',
                siteSettings?.contactSectionBadgeEn || 'ESTABLISHING LEGAL SECURE INFRASTRUCTURES NATIONWIDE'
              )}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E]">
              {t(
                siteSettings?.contactSectionTitleAr || 'نقدم خدماتنا في جميع أنحاء المملكة',
                siteSettings?.contactSectionTitleEn || 'Advocacy Rendered Across the Kingdom'
              )}
            </h2>
            <p className="text-sm sm:text-base text-[#4B4B4B] font-light leading-relaxed max-w-3xl mx-auto">
              {t(
                siteSettings?.contactSectionDescAr || 'يسعدنا التوجيه والإجابة على كافة استفساراتكم القانونية بدقة وسرية تامة.',
                siteSettings?.contactSectionDescEn || 'We are pleased to guide and answer all your legal inquiries with precision and utter confidentiality.'
              )}
            </p>
            <div className="h-[1.5px] w-12 bg-[#A56A1E] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 - Phone */}
            <motion.div
              whileHover={{ y: -6, boxShadow: '0 20px 40px -15px rgba(165,106,30,0.1)' }}
              className={`rounded-2xl p-8 bg-white border border-[#D8D1C7] ${textAlignClass} flex flex-col justify-between group relative overflow-hidden transition-all duration-300`}
            >
              <div className="space-y-6">
                <div className={`flex justify-between items-center ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="w-12 h-12 rounded-xl bg-[#A56A1E]/10 flex items-center justify-center text-[#A56A1E] group-hover:bg-[#A56A1E] group-hover:text-white transition-all duration-500">
                    <Phone className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#A56A1E] tracking-wider uppercase bg-[#A56A1E]/10 px-2 py-1 rounded">
                    {t('متاح دائماً', 'RESPONSIVE LINES')}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-[#1E1E1E]">{t('الجوال والاتصال', 'Phone & Multi-Lines')}</h3>
                  <div className="space-y-2 text-sm text-[#5B5B5B]">
                    <div>
                      <span className="font-semibold text-[#1E1E1E] text-xs block text-[#A56A1E]">{t('الرياض:', 'Riyadh:')}</span>
                      <a href="tel:0112101333" className="font-mono text-xs sm:text-sm hover:text-[#A56A1E] block">0112101333</a>
                      <a href="tel:0112101555" className="font-mono text-xs sm:text-sm hover:text-[#A56A1E] block">0112101555</a>
                    </div>
                    <div className="pt-2 border-t border-[#D8D1C7]/30">
                      <span className="font-semibold text-[#1E1E1E] text-xs block text-[#A56A1E]">{t('جدة والهاتف الموحد:', 'Jeddah & Unified Line:')}</span>
                      <a href="tel:0126636716" className="font-mono text-xs sm:text-sm hover:text-[#A56A1E] block">012 6636716</a>
                      <a href="tel:920004713" className="font-mono text-xs sm:text-sm hover:text-[#A56A1E] block">920004713</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`h-[2px] w-0 bg-[#A56A1E] absolute bottom-0 ${isRtl ? 'right-0' : 'left-0'} group-hover:w-full transition-all duration-500`} />
            </motion.div>

            {/* Card 2 - Email */}
            <motion.div
              whileHover={{ y: -6, boxShadow: '0 20px 40px -15px rgba(165,106,30,0.1)' }}
              className={`rounded-2xl p-8 bg-white border border-[#D8D1C7] ${textAlignClass} flex flex-col justify-between group relative overflow-hidden transition-all duration-300`}
            >
              <div className="space-y-6">
                <div className={`flex justify-between items-center ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="w-12 h-12 rounded-xl bg-[#A56A1E]/10 flex items-center justify-center text-[#A56A1E] group-hover:bg-[#A56A1E] group-hover:text-white transition-all duration-500">
                    <Mail className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#A56A1E] tracking-wider uppercase bg-[#A56A1E]/10 px-2 py-1 rounded">
                    {t('رسمي ومؤتمن', 'SECURED PORTAL')}
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-[#1E1E1E]">{t('البريد الإلكتروني', 'Email Correspondences')}</h3>
                  <div className="space-y-1 text-sm text-[#5B5B5B]">
                    <span className="text-xs font-semibold text-[#A56A1E] block">{t('المراسلات الرسمية والاستفسارات:', 'Corporate Dispatch & Inquiries:')}</span>
                    <a href="mailto:mec_law@hotmail.com" className="font-mono text-sm hover:text-[#A56A1E] block select-all">mec_law@hotmail.com</a>
                    <p className="text-xs text-[#5B5B5B] font-light pt-4 leading-relaxed">
                      {t(
                        '* تتم مراجعة كافة الطلبات والمراسلات بدقة فائقة من إدارة الامتثال بفرع الرياض وجدة بصفة دورية لضمان سرعة الاستجابة.',
                        '* All incoming briefings and records are processed under strict oversight from our corporate compliance team to guarantee efficient routing and confidentiality.'
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className={`h-[2px] w-0 bg-[#A56A1E] absolute bottom-0 ${isRtl ? 'right-0' : 'left-0'} group-hover:w-full transition-all duration-500`} />
            </motion.div>

            {/* Card 3 - Address */}
            <motion.div
              whileHover={{ y: -6, boxShadow: '0 20px 40px -15px rgba(165,106,30,0.1)' }}
              className={`rounded-2xl p-8 bg-white border border-[#D8D1C7] ${textAlignClass} flex flex-col justify-between group relative overflow-hidden transition-all duration-300`}
            >
              <div className="space-y-6">
                <div className={`flex justify-between items-center ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="w-12 h-12 rounded-xl bg-[#A56A1E]/10 flex items-center justify-center text-[#A56A1E] group-hover:bg-[#A56A1E] group-hover:text-white transition-all duration-500">
                    <MapPin className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#A56A1E] tracking-wider uppercase bg-[#A56A1E]/10 px-2 py-1 rounded">
                    {t('الفروع الرئيسية', 'PRINCIPAL DOMS')}
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-[#1E1E1E]">{t('العناوين الرسمية', 'Offices & Locations')}</h3>
                  <div className="space-y-2 text-xs sm:text-sm text-[#4B4B4B] font-light">
                    <div>
                      <span className="font-semibold text-[#1E1E1E] text-xs block text-[#A56A1E]">{t('فرع الرياض:', 'Riyadh Branch:')}</span>
                      <p className="leading-relaxed">{t('طريق الملك عبد العزيز، تقاطع شارع أبي الحسن المحدّث، مبنى الرومي - مدخل رقم واحد', 'King Abdulaziz Road, intersection with Abi Al-Hasan Al-Muhaddith St, Al-Rumi Building - Entrance 1')}</p>
                    </div>
                    <div className="pt-2 border-t border-[#D8D1C7]/35">
                      <span className="font-semibold text-[#1E1E1E] text-xs block text-[#A56A1E]">{t('مقر جدة:', 'Jeddah HQ:')}</span>
                      <p className="leading-relaxed">{t('حي الروضة ١، شارع نهضة التعليم، متفرع من شارع التحلية، مجمع صفوة الأعمال، فيلا رقم ٦', 'Al-Rawdah 1 District, Nahdat Al-Taleem St, off Tahlia St, Safwah Business Center, Villa No. 6')}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`h-[2px] w-0 bg-[#A56A1E] absolute bottom-0 ${isRtl ? 'right-0' : 'left-0'} group-hover:w-full transition-all duration-500`} />
            </motion.div>

          </div>

        </div>
      </section>


      {/* 3. INTERACTIVE MAP + CONTACT FORM SECTION */}
      <section className="py-20 sm:py-28 bg-[#F1ECE3] relative border-b border-[#D8D1C7]/40">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* LEFT SIDE: Beautiful visual interactive map with switches */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="rounded-2xl p-6 bg-white border border-[#D8D1C7] shadow-sm space-y-6">
                
                {/* Switcher header tabs */}
                <div className="flex gap-2 p-1.5 bg-[#F1ECE3] rounded-xl">
                  {offices.map((office, index) => (
                    <button
                      key={office.key}
                      onClick={() => setActiveOfficeIndex(index)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeOfficeIndex === index
                          ? 'bg-[#A56A1E] text-white shadow-xs'
                          : 'text-[#5B5B5B] hover:text-[#1E1E1E]'
                      }`}
                    >
                      {office.name}
                    </button>
                  ))}
                </div>

                {/* Simulated interactive premium visual legal map of Saudi Arabia */}
                <div className="relative aspect-video w-full rounded-xl bg-[#F8F5EF] border border-[#D8D1C7]/55 overflow-hidden flex items-center justify-center p-4">
                  {/* Subtle Grid Art Decor */}
                  <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <line x1="20%" y1="0" x2="20%" y2="100%" stroke="#1E1E1E" strokeWidth="0.5" />
                      <line x1="40%" y1="0" x2="40%" y2="100%" stroke="#1E1E1E" strokeWidth="0.5" />
                      <line x1="60%" y1="0" x2="60%" y2="100%" stroke="#1E1E1E" strokeWidth="0.5" />
                      <line x1="80%" y1="0" x2="80%" y2="100%" stroke="#1E1E1E" strokeWidth="0.5" />
                      <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#1E1E1E" strokeWidth="0.5" />
                      <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#1E1E1E" strokeWidth="0.5" />
                    </svg>
                  </div>

                  {/* Elegant abstracted Map Vector outline of KSA */}
                  <svg viewBox="0 0 400 300" className="w-[85%] h-auto text-[#D8D1C7] fill-transparent stroke-[#A56A1E]/20 stroke-2 opacity-55">
                    <path d="M 60,110 C 80,70 120,40 180,30 C 260,20 320,50 360,100 C 380,130 390,170 370,210 C 350,240 310,270 250,280 C 180,290 120,290 80,260 C 40,230 30,170 40,140 Z" />
                    {/* Riyadh Inner Core */}
                    <circle cx="210" cy="140" r="45" fill="#A56A1E" fillOpacity="0.04" stroke="#A56A1E" strokeOpacity="0.1" strokeDasharray="2 2" />
                    {/* Jeddah western coast */}
                    <circle cx="90" cy="200" r="40" fill="#A56A1E" fillOpacity="0.04" stroke="#A56A1E" strokeOpacity="0.1" strokeDasharray="2 2" />
                  </svg>

                  {/* Pin 1: Jeddah Link */}
                  {offices.slice(0, 2).map((office, index) => (
                    <div
                      key={office.key}
                      onClick={() => setActiveOfficeIndex(index)}
                      className={`absolute ${
                        index === 0 ? 'left-[24%] top-[65%]' : 'left-[54%] top-[46%]'
                      } transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group text-center`}
                    >
                      <span className={`absolute -inset-2.5 rounded-full bg-[#A56A1E]/30 animate-ping duration-1000 ${activeOfficeIndex === index ? 'inline-flex' : 'hidden'}`} />
                      <div className={`w-6 h-6 rounded-full border-2 bg-[#F8F5EF] mx-auto flex items-center justify-center shadow-md transition-all ${activeOfficeIndex === index ? 'border-[#A56A1E] scale-110' : 'border-[#D8D1C7] hover:border-[#A56A1E]'}`}>
                        <MapPin className={`w-3.5 h-3.5 ${activeOfficeIndex === index ? 'text-[#A56A1E]' : 'text-gray-400'}`} />
                      </div>
                      <span className="absolute left-1/2 -translate-x-1/2 top-7 font-bold text-[10px] text-[#1E1E1E] bg-[#F8F5EF] py-0.5 px-1.5 rounded border border-[#D8D1C7] whitespace-nowrap shadow-xs">
                        {office.name}
                      </span>
                    </div>
                  ))}

                </div>

                {/* Displaying selected office info details directly inside map component */}
                <div className={`space-y-4 pt-4 border-t border-[#D8D1C7]/40 ${textAlignClass}`}>
                  <h4 className="text-[#A56A1E] font-extrabold text-base flex items-center gap-2 select-text justify-start">
                    <Building className="w-5 h-5 shrink-0" />
                    <span>{offices[activeOfficeIndex]?.name}</span>
                  </h4>

                  <div className="space-y-3 text-xs sm:text-sm text-[#4B4B4B]">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#A56A1E]/60 mt-0.5 shrink-0" />
                      <p className="font-light leading-relaxed text-justify select-text">{offices[activeOfficeIndex]?.address}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#A56A1E]/60 shrink-0" />
                      <span className="font-mono select-text">{offices[activeOfficeIndex]?.phone}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#A56A1E]/60 shrink-0" />
                      <span>{offices[activeOfficeIndex]?.workHours}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT SIDE: High-caliber booking flow */}
            <div className={`lg:col-span-7 bg-white p-8 sm:p-10 rounded-2xl border border-[#D8D1C7] ${textAlignClass} shadow-sm relative overflow-hidden`}>
              <div className="absolute top-0 left-0 w-24 h-24 bg-[#A56A1E]/5 rounded-full blur-xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="space-y-2 border-b border-[#D8D1C7]/40 pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-extrabold text-[#1E1E1E]">{t('احجز استشارة', 'Book Counsel')}</h3>
                      <p className="text-xs sm:text-sm text-[#5B5B5B] font-light">
                        {t(
                          'أكمل بياناتك، ارفع الملفات، وسجل ملاحظة صوتية قصيرة ثم انتقل إلى بوابة الدفع الآمنة.',
                          'Complete your details, upload files, record a short voice note, then move to the secure payment gateway.'
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-[#A56A1E]/20 bg-[#A56A1E]/5 px-3 py-1 text-xs font-semibold text-[#7B5A42]">
                      <ShieldCheck className="w-4 h-4 text-[#A56A1E]" />
                      <span>{t('بوابة آمنة', 'Secure Gate')}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      { id: 'details', label: t('البيانات', 'Details') },
                      { id: 'gateway', label: t('الدفع', 'Gateway') },
                      { id: 'done', label: t('النتيجة', 'Receipt') },
                    ].map((step) => (
                      <span
                        key={step.id}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold border ${
                          bookingStep === step.id
                            ? 'bg-[#A56A1E] text-white border-[#A56A1E]'
                            : 'bg-[#F5F2EC] text-[#5B5B5B] border-[#D8D1C7]'
                        }`}
                      >
                        {step.label}
                      </span>
                    ))}
                  </div>
                  {submitError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {submitError}
                    </div>
                  )}
                </div>

                {bookingStep === 'details' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-semibold text-[#1E1E1E] block">
                          {t('الاسم بالكامل', 'Full Name')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          required
                          placeholder={t('أدخل الاسم الثلاثي بالكامل', 'Provide your full legal name')}
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl bg-[#F5F2EC] border border-[#D9D2C8] focus:border-[#A56A1E] focus:outline-none text-sm text-[#1E1E1E] transition-all duration-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#1E1E1E] block">
                          {t('البريد الإلكتروني', 'Email')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="example@domain.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl bg-[#F5F2EC] border border-[#D9D2C8] focus:border-[#A56A1E] focus:outline-none text-sm text-[#1E1E1E] transition-all duration-300 font-mono text-left"
                          style={{ direction: 'ltr' }}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#1E1E1E] block">
                          {t('الجوال', 'Mobile Number')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          placeholder={t('05xxxxxxxx', '05xxxxxxxx')}
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl bg-[#F5F2EC] border border-[#D9D2C8] focus:border-[#A56A1E] focus:outline-none text-sm text-[#1E1E1E] transition-all duration-300 font-mono text-left"
                          style={{ direction: 'ltr' }}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-semibold text-[#1E1E1E] block">
                          {t('رقم الهوية / الإقامة', 'Saudi ID / Iqama')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder={t('١٠ أرقام تبدأ بـ 1 أو 2', '10 digits starting with 1 or 2')}
                          value={idNumber}
                          onChange={(event) => {
                            setIdNumber(event.target.value.replace(/\D/g, '').slice(0, 10));
                            setIdTouched(true);
                          }}
                          onBlur={() => setIdTouched(true)}
                          className={`w-full px-4 py-3 rounded-xl bg-[#F5F2EC] border text-sm text-[#1E1E1E] transition-all duration-300 font-mono text-left ${
                            idTouched && !idValidation.valid ? 'border-red-400 focus:border-red-500' : 'border-[#D9D2C8] focus:border-[#A56A1E]'
                          }`}
                          style={{ direction: 'ltr' }}
                        />
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className={idValidation.valid ? 'text-emerald-600 font-semibold' : 'text-[#5B5B5B]'}>
                            {idValidation.valid
                              ? idValidation.message
                              : t('سيتحقق الحقل فورياً من هوية سعودي أو مقيم', 'This field validates Saudi citizen IDs and resident Iqamas in real time.')}
                          </span>
                          {idValidation.valid && <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-semibold text-[#1E1E1E] block">
                          {t('الملفات الداعمة', 'Supporting documents')}
                        </label>
                        <div
                          onDragOver={(event) => {
                            event.preventDefault();
                            setIsDraggingFiles(true);
                          }}
                          onDragLeave={() => setIsDraggingFiles(false)}
                          onDrop={handleDropFiles}
                          className={`rounded-2xl border-2 border-dashed p-5 transition-all duration-300 ${
                            isDraggingFiles ? 'border-[#A56A1E] bg-[#A56A1E]/5' : 'border-[#D8D1C7] bg-[#F8F5EF]'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-white border border-[#D8D1C7] flex items-center justify-center text-[#A56A1E]">
                                <Upload className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-semibold text-[#1E1E1E]">{t('اسحب الملفات هنا أو اختر من جهازك', 'Drop files here or browse your device')}</p>
                                <p className="text-xs text-[#5B5B5B]">
                                  {t('PDF و DOCX و الصور حتى 15MB لكل ملف', 'PDF, DOCX, and images up to 15MB each')}
                                </p>
                              </div>
                            </div>
                            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#D8D1C7] bg-white hover:border-[#A56A1E] cursor-pointer text-sm font-semibold text-[#1E1E1E]">
                              <Paperclip className="w-4 h-4 text-[#A56A1E]" />
                              <span>{t('إرفاق ملفات', 'Attach files')}</span>
                              <input type="file" multiple accept=".pdf,.docx,image/*" className="hidden" onChange={handleFilesFromEvent} />
                            </label>
                          </div>

                          {attachments.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {attachments.map((item) => (
                                <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-white border border-[#D8D1C7] px-4 py-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-[#A56A1E]/10 text-[#A56A1E] flex items-center justify-center shrink-0">
                                      <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-[#1E1E1E] truncate">{item.name}</p>
                                      <p className="text-xs text-[#5B5B5B]">{formatBytes(item.size)}</p>
                                    </div>
                                  </div>
                                  <button type="button" onClick={() => removeAttachment(item.id)} className="text-[#7B5A42] hover:text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-3 rounded-2xl border border-[#D8D1C7] bg-[#FBF8F2] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h4 className="font-bold text-[#1E1E1E]">{t('مذكرة صوتية سريعة', '3-minute voice note')}</h4>
                            <p className="text-xs text-[#5B5B5B]">
                              {t('يسجل حتى ٣ دقائق ثم يتوقف تلقائياً مع إمكانية المعاينة والحذف.', 'Records up to 3 minutes, auto-stops, then lets you preview or delete it.')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${recordingStatus === 'recording' ? 'bg-red-100 text-red-700' : 'bg-[#EDE6DC] text-[#7B5A42]'}`}>
                              {recordingStatus === 'recording' ? t('تسجيل...', 'Recording...') : recordingStatus === 'paused' ? t('جاهز', 'Ready') : t('متوقف', 'Idle')}
                            </span>
                            <span className="text-xs text-[#5B5B5B] font-mono">{String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:{String(recordingSeconds % 60).padStart(2, '0')} / 03:00</span>
                          </div>
                        </div>

                        {!isRecordingSupported && (
                          <p className="text-xs text-red-600">{recordingError}</p>
                        )}

                        <div className="h-2 w-full rounded-full bg-[#E6DDD0] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#A56A1E] transition-all duration-200"
                            style={{ width: `${Math.min((recordingSeconds / MAX_RECORDING_SECONDS) * 100, 100)}%` }}
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {recordingStatus !== 'recording' ? (
                            <button
                              type="button"
                              onClick={startRecording}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E1E1E] text-white text-sm font-semibold"
                            >
                              <Mic className="w-4 h-4" />
                              <span>{t('ابدأ التسجيل', 'Start recording')}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={stopRecording}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold"
                            >
                              <StopCircle className="w-4 h-4" />
                              <span>{t('إيقاف التسجيل', 'Stop recording')}</span>
                            </button>
                          )}
                          {recordingBlobUrl && (
                            <>
                              <audio controls src={recordingBlobUrl} className="h-10 max-w-full" />
                              <button
                                type="button"
                                onClick={() => {
                                  URL.revokeObjectURL(recordingBlobUrl);
                                  setRecordingBlobUrl('');
                                  setRecordingSeconds(0);
                                  setRecordingStatus('idle');
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#D8D1C7] text-sm font-semibold text-[#7B5A42]"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>{t('حذف', 'Delete')}</span>
                              </button>
                            </>
                          )}
                          {recordingError && <span className="text-xs text-red-600">{recordingError}</span>}
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-semibold text-[#1E1E1E] block">
                          {t('أخبرنا باستفسارك القانوني', 'State Your Legal Inquiry')}
                        </label>
                        <textarea
                          name="message"
                          rows={5}
                          placeholder={t(
                            'صف هنا طبيعة استفسارك بالتفصيل (مثل: قضايا عمالية، استثمار دولي، تأسيس شركات) لنتمكن من توجيه الطلب للمحامي الأكفأ بمشكلتكم.',
                            'Detail the nature of your concern (e.g. corporate liquidation, cross-border commercial laws, arbitration, labor regulations) so we can assign the most specialized legal specialist to your file.'
                          )}
                          value={formData.message}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl bg-[#F5F2EC] border border-[#D9D2C8] focus:border-[#A56A1E] focus:outline-none text-sm text-[#1E1E1E] transition-all duration-300 font-light leading-relaxed"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
                      <p className="text-[11px] text-[#5B5B5B] leading-relaxed max-w-xl">
                        {t(
                          'نستخدم رقم الهوية/الإقامة للتحقق الفوري، والملفات الصوتية والمرفقات تبقى جاهزة قبل الانتقال إلى بوابة الدفع الآمنة.',
                          'We use the ID/Iqama for instant validation, while files and voice notes stay ready before moving to the secure payment gateway.'
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={handleProceedToGateway}
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#A56A1E] hover:bg-[#946B4B] text-white font-extrabold text-sm transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(165,106,30,0.25)] cursor-pointer"
                      >
                        <span>{t('الانتقال إلى الدفع', 'Next: Secure Checkout')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {bookingStep === 'gateway' && (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-[#D8D1C7] bg-[#FBF8F2] p-5 space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="text-lg font-extrabold text-[#1E1E1E]">{t('بوابة الدفع الآمنة', 'Secure payment gateway')}</h4>
                          <p className="text-sm text-[#5B5B5B]">
                            {t('سداد رمزي بقيمة 80.00 ريال سعودي مع شارة الأمان SAMA والبطاقة ثلاثية الأبعاد.', 'A symbolic 80.00 SAR payment with SAMA security badges and a 3D card widget.')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          <Lock className="w-4 h-4" />
                          <span>{t('محمي بالكامل', 'Fully protected')}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                        <div className="lg:col-span-7 rounded-[1.5rem] bg-[#1A1A1A] text-white p-5 shadow-xl border border-white/10">
                          <div className="flex items-center justify-between mb-8">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">{t('بوابة الدفع السريع', 'Rapid pay gateway')}</p>
                              <p className="text-sm font-semibold text-white/80">{t('SAMA • 3D Secure • Tokenized', 'SAMA • 3D Secure • Tokenized')}</p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/60">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              <span>{t('Verified', 'Verified')}</span>
                            </div>
                          </div>

                          <div
                            className="relative h-56 rounded-[1.5rem] overflow-hidden border border-white/10 bg-gradient-to-br from-[#2B2B2B] via-[#171717] to-[#000]"
                            onMouseEnter={() => setShowCardBack(true)}
                            onMouseLeave={() => setShowCardBack(false)}
                          >
                            <div className={`absolute inset-0 transition-transform duration-500 ${showCardBack ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
                              <div className="absolute inset-0 p-5 backface-hidden">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">{t('بطاقة العميل', 'Customer card')}</p>
                                    <p className="text-lg font-bold">{cardHolder || t('اسم حامل البطاقة', 'Cardholder name')}</p>
                                  </div>
                                  <div className="flex items-center gap-2 text-white/75">
                                    <CreditCard className="w-5 h-5" />
                                    <span className="text-xs font-bold uppercase">{detectedBrand}</span>
                                  </div>
                                </div>

                                <div className="mt-12 text-2xl font-mono tracking-[0.2em]">
                                  {cardNumber ? cardNumber.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                                </div>

                                <div className="mt-10 flex items-end justify-between text-sm">
                                  <div>
                                    <p className="text-white/50 text-[10px] uppercase tracking-[0.2em]">{t('المبلغ', 'Amount')}</p>
                                    <p className="font-bold">80.00 SAR</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-white/50 text-[10px] uppercase tracking-[0.2em]">{t('البطاقة', 'Card type')}</p>
                                    <p className="font-bold capitalize">{detectedBrand}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="absolute inset-0 p-5 backface-hidden rotate-y-180" style={{ transform: 'rotateY(180deg)' }}>
                                <div className="absolute inset-0 bg-gradient-to-br from-black to-[#1E1E1E]" />
                                <div className="relative z-10 pt-8">
                                  <div className="h-12 bg-[#0B0B0B] w-full rounded-md mb-8" />
                                  <div className="bg-white/90 rounded-md p-3 flex items-center justify-between text-black">
                                    <span className="text-sm font-bold tracking-[0.2em]">CVV</span>
                                    <span className="font-mono">{cardCvv || '•••'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-5 space-y-4">
                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-[#1E1E1E] block">{t('اسم حامل البطاقة', 'Cardholder name')}</label>
                              <input
                                value={cardHolder}
                                onChange={(event) => setCardHolder(event.target.value)}
                                placeholder={t('الاسم كما يظهر على البطاقة', 'Name as printed on the card')}
                                className="w-full px-4 py-3 rounded-xl bg-[#F5F2EC] border border-[#D9D2C8] focus:border-[#A56A1E] focus:outline-none text-sm text-[#1E1E1E]"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-[#1E1E1E] block">{t('رقم البطاقة', 'Card number')}</label>
                              <input
                                value={cardNumber}
                                onChange={(event) => setCardNumber(event.target.value.replace(/[^\d ]/g, '').slice(0, 19))}
                                placeholder="0000 0000 0000 0000"
                                className="w-full px-4 py-3 rounded-xl bg-[#F5F2EC] border border-[#D9D2C8] focus:border-[#A56A1E] focus:outline-none text-sm text-[#1E1E1E] font-mono text-left"
                                style={{ direction: 'ltr' }}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-[#1E1E1E] block">{t('الانتهاء', 'Expiry')}</label>
                                <input
                                  value={cardExpiry}
                                  onChange={(event) => setCardExpiry(event.target.value.replace(/[^\d/]/g, '').slice(0, 5))}
                                  placeholder="MM/YY"
                                  className="w-full px-4 py-3 rounded-xl bg-[#F5F2EC] border border-[#D9D2C8] focus:border-[#A56A1E] focus:outline-none text-sm text-[#1E1E1E] font-mono text-left"
                                  style={{ direction: 'ltr' }}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-[#1E1E1E] block">{t('CVV', 'CVV')}</label>
                                <input
                                  value={cardCvv}
                                  onChange={(event) => setCardCvv(event.target.value.replace(/\D/g, '').slice(0, 4))}
                                  onFocus={() => setShowCardBack(true)}
                                  onBlur={() => setShowCardBack(false)}
                                  placeholder="123"
                                  className="w-full px-4 py-3 rounded-xl bg-[#F5F2EC] border border-[#D9D2C8] focus:border-[#A56A1E] focus:outline-none text-sm text-[#1E1E1E] font-mono text-left"
                                  style={{ direction: 'ltr' }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-[#D8D1C7] bg-[#FBF8F2] p-4 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-[#5B5B5B]">{t('رسوم الاستشارة الرمزية', 'Symbolic advisory fee')}</span>
                              <span className="font-bold text-[#1E1E1E]">80.00 SAR</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-[#5B5B5B]">{t('الهوية المعتمدة', 'Validated ID')}</span>
                              <span className="font-mono text-[#1E1E1E]">{paymentSummary.idNumber || idNumber}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#5B5B5B]">
                              <BadgeCheck className="w-4 h-4 text-emerald-600" />
                              <span>{t('نقبل Mada و Visa و Mastercard ضمن هذه المحاكاة الآمنة.', 'We accept Mada, Visa, and Mastercard in this secure simulation.')}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handlePayment}
                            disabled={isPaymentProcessing}
                            className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#A56A1E] hover:bg-[#946B4B] disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-sm transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(165,106,30,0.25)]"
                          >
                            {isPaymentProcessing ? (
                              <span>{t('جارٍ المعالجة...', 'Processing...')}</span>
                            ) : (
                              <>
                                <span>{t('ادفع 80.00 ريال', 'Pay 80.00 SAR')}</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setBookingStep('details')}
                            className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl border border-[#D8D1C7] text-[#7B5A42] hover:border-[#A56A1E] font-semibold text-sm transition-colors"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>{t('العودة للتفاصيل', 'Back to details')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {bookingStep === 'done' && (
                  <div className="py-10 px-4 flex flex-col items-center justify-center text-center space-y-5">
                    <div className="w-20 h-20 rounded-full bg-[#A56A1E]/15 flex items-center justify-center text-[#A56A1E] animate-bounce">
                      <CheckCircle className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1E1E1E]">
                      {t('تم تأكيد الدفع وإصدار voucher', 'Payment confirmed and voucher issued')}
                    </h3>
                    <p className="text-sm text-[#5B5B5B] max-w-lg mx-auto leading-relaxed">
                      {t(
                        `تم إنشاء رقم القيد ${voucherId} بنجاح، وسيقوم الفريق التنفيذي بمراجعة الملف والرد خلال 24 ساعة عمل.`,
                        `Voucher ${voucherId} has been issued successfully. Our executive team will review the file and respond within 24 business hours.`
                      )}
                    </p>

                    <div className="w-full max-w-xl rounded-2xl border border-[#D8D1C7] bg-[#FBF8F2] p-5 text-start space-y-3">
                      <div className="flex items-center gap-2 font-semibold text-[#1E1E1E]">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <span>{t('قائمة المستندات المؤمنة', 'Authorized files checklist')}</span>
                      </div>
                      <ul className="space-y-2 text-sm text-[#5B5B5B]">
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />{t('الهوية / الإقامة', 'ID / Iqama')}</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />{t('المرفقات والملفات الداعمة', 'Supporting attachments')}</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />{t('المذكرة الصوتية القصيرة', 'Short voice note')}</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />{t('سند الدفع بقيمة 80.00 ريال', '80.00 SAR payment receipt')}</li>
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setBookingStep('details');
                          setPaymentSuccess(false);
                          setVoucherId('');
                          setCardNumber('');
                          setCardHolder('');
                          setCardExpiry('');
                          setCardCvv('');
                          setIdNumber('');
                          setIdTouched(false);
                          attachments.forEach((item) => URL.revokeObjectURL(item.previewUrl));
                          setAttachments([]);
                          setFormData({ fullName: '', phone: '', email: '', message: '' });
                          setRecordingBlobUrl('');
                          setRecordingFile(null);
                          setRecordingSeconds(0);
                          setRecordingStatus('idle');
                          setSubmitError('');
                        }}
                        className="px-8 py-3 rounded-lg bg-[#A56A1E] hover:bg-[#946B4B] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                      >
                        {t('بدء طلب جديد', 'Start another request')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* 4. EXECUTIVE CONSULTATION CTA */}
      <section className="relative py-24 bg-[#121212] text-white overflow-hidden text-center lg:text-start">
        {/* Soft gold lighting glow, charcoal overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(165,106,30,0.18)_0%,transparent_60%)] pointer-events-none" />
        
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <span className={`text-xs font-bold text-[#A56A1E] tracking-widest uppercase block ${isRtl ? 'border-r-2 pr-3' : 'border-l-2 pl-3'} border-[#A56A1E]`}>
                {t(
                  siteSettings?.contactSectionOfficeTitleAr || 'الحماية الوقائية وحل الخلافات الكبرى',
                  siteSettings?.contactSectionOfficeTitleEn || 'PREVENTATIVE SAFEGUARDS & MAJOR DISPUTE RESOLUTIONS'
                )}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                {t(
                  siteSettings?.contactSectionFormTitleAr || 'ابدأ استشارتك القانونية اليوم',
                  siteSettings?.contactSectionFormTitleEn || 'Initiate Your Specialized Consultations Today'
                )}
              </h2>
              <p className="text-sm sm:text-base text-gray-300 font-light max-w-2xl leading-relaxed text-justify lg:text-start">
                {t(
                  siteSettings?.contactSectionFormDescAr || 'فريق قانوني بخبرة احترافية ورؤية استراتيجية لحماية مصالحك وتحقيق أهدافك. نقدم خدماتنا بفرعي جدة والرياض لخدمة جميع شركاء النجاح بالمملكة.',
                  siteSettings?.contactSectionFormDescEn || 'A trusted legal league with exquisite expertise and dynamic foresight shielding your interests. Active branches in Riyadh & Jeddah are fully equipped to serve you.'
                )}
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4 justify-end">
              <button 
                onClick={onScrollToContact}
                className="px-8 py-3.5 rounded-xl bg-[#A56A1E] hover:bg-[#946B4B] text-white text-xs font-bold font-sans transition-all duration-300 shadow-[0_10px_35px_rgba(165,106,30,0.3)] shadow-[#A56A1E]/25 text-center cursor-pointer active:scale-98"
              >
                {t('احجز استشارة', 'Schedule Consultation')}
              </button>
              
              <button 
                onClick={onScrollToContact}
                className="px-8 py-3.5 rounded-xl bg-transparent hover:bg-white/5 text-white border border-white/20 hover:border-white/40 text-xs font-bold font-sans transition-all duration-300 text-center cursor-pointer"
              >
                {t('تواصل معنا', 'Contact Us Today')}
              </button>
            </div>

          </div>

        </div>
      </section>

      {paymentSuccess && (
        <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-2xl rounded-3xl bg-[#F8F5EF] border border-[#D8D1C7] shadow-2xl overflow-hidden">
            <div className="bg-[#A56A1E] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/70">{t('إيصال مؤقت', 'Temporary receipt')}</p>
                <h3 className="text-2xl font-extrabold">{t('تم الدفع بنجاح', 'Payment successful')}</h3>
              </div>
              <div className="rounded-2xl bg-white/15 px-4 py-2 text-sm font-mono">{voucherId}</div>
            </div>

            <div className="p-6 space-y-5 text-start">
              <p className="text-[#5B5B5B] leading-relaxed">
                {t(
                  `تم إصدار الرقم ${voucherId} مع اعتماد الملفات المرفقة. سيقوم فريقنا بالتواصل خلال 24 ساعة لتأكيد خطوات المتابعة.`,
                  `Voucher ${voucherId} has been issued with the attached file set approved. Our team will follow up within 24 hours to confirm next steps.`
                )}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[#D8D1C7] bg-white p-4">
                  <p className="text-xs font-bold text-[#A56A1E] uppercase tracking-widest mb-2">{t('الخطوات التالية', 'Next steps')}</p>
                  <ul className="space-y-2 text-sm text-[#1E1E1E]">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />{t('استلام الطلب وتأكيد رقم الملف', 'Receive request and confirm file number')}</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />{t('مراجعة المرفقات خلال 24 ساعة', 'Review attachments within 24 hours')}</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />{t('تواصل تنفيذي من المستشار المناوب', 'Executive callback from the duty counsel')}</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-[#D8D1C7] bg-white p-4">
                  <p className="text-xs font-bold text-[#A56A1E] uppercase tracking-widest mb-2">{t('سند الحجز', 'Advisory receipt')}</p>
                  <div className="space-y-2 text-sm text-[#1E1E1E]">
                    <p><span className="font-semibold">{t('الاسم:', 'Name:')}</span> {paymentSummary.fullName}</p>
                    <p><span className="font-semibold">{t('الجوال:', 'Phone:')}</span> {paymentSummary.phone}</p>
                    <p><span className="font-semibold">{t('الهوية:', 'ID:')}</span> {paymentSummary.idNumber}</p>
                    <p><span className="font-semibold">{t('الرسوم:', 'Fee:')}</span> 80.00 SAR</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setPaymentSuccess(false)}
                  className="px-6 py-3 rounded-xl border border-[#D8D1C7] text-[#7B5A42] font-semibold"
                >
                  {t('إغلاق', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
