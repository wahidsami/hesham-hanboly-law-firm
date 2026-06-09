import { useEffect, useMemo, useState } from 'react';
import { Clock3, Eye, FileAudio2, Filter, MessageSquareText, Search, ShieldCheck, Users, X } from 'lucide-react';
import { backendApi } from '../../api/backend';
import type { ApiConsultationRequest, ConsultationStatus } from '../../api/types';

interface ConsultationsModuleProps {
  lang: 'en' | 'ar';
  onCountChange?: (count: number) => void;
}

type StatusFilter = ConsultationStatus | 'all';

const STATUS_LABELS: Record<ConsultationStatus, { en: string; ar: string; color: string }> = {
  new: { en: 'New', ar: 'جديد', color: '#0EA5E9' },
  reviewing: { en: 'Reviewing', ar: 'قيد المراجعة', color: '#C47F17' },
  responded: { en: 'Responded', ar: 'تم الرد', color: '#16A34A' },
  closed: { en: 'Closed', ar: 'مغلق', color: '#64748B' },
};

const PAYMENT_LABELS = {
  paid: { en: 'Paid', ar: 'مدفوع' },
  pending: { en: 'Pending', ar: 'معلق' },
  refunded: { en: 'Refunded', ar: 'مسترد' },
} as const;

function formatDate(iso: string, lang: 'en' | 'ar') {
  const date = new Date(iso);
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function AttachmentPreview({ attachment }: { attachment: ApiConsultationRequest['attachments'][number] }) {
  if (attachment.kind === 'image') {
    return (
      <a href={attachment.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-2xl border border-[#D8D1C7] bg-white">
        <img src={attachment.url} alt={attachment.name} className="h-40 w-full object-cover" />
        <div className="px-3 py-2 text-xs text-[#5B5B5B]">{attachment.name}</div>
      </a>
    );
  }

  if (attachment.kind === 'audio') {
    return (
      <div className="rounded-2xl border border-[#D8D1C7] bg-white p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#1E1E1E]">
          <FileAudio2 className="h-4 w-4 text-[#A56A1E]" />
          <span>{attachment.name}</span>
        </div>
        <audio controls src={attachment.url} className="w-full" />
      </div>
    );
  }

  return (
    <a href={attachment.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-2xl border border-[#D8D1C7] bg-white px-4 py-3 hover:border-[#A56A1E]">
      <div>
        <div className="font-semibold text-[#1E1E1E] text-sm">{attachment.name}</div>
        <div className="text-xs text-[#5B5B5B]">{Math.round(attachment.sizeBytes / 1024)} KB</div>
      </div>
      <span className="text-xs font-semibold text-[#A56A1E]">Open</span>
    </a>
  );
}

export function ConsultationsModule({ lang, onCountChange }: ConsultationsModuleProps) {
  const [requests, setRequests] = useState<ApiConsultationRequest[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | ApiConsultationRequest['paymentStatus']>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<ConsultationStatus>('new');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function refresh() {
    try {
      const loaded = await backendApi.listConsultations();
      setRequests(loaded);
      onCountChange?.(loaded.length);
      if (loaded.length > 0 && !selectedId) {
        setSelectedId(loaded[0].id);
        setEditingStatus(loaded[0].status);
        setAdminNotes(loaded[0].adminNotes || '');
      }
    } catch {
      setRequests([]);
      onCountChange?.(0);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requests.filter((item) => {
      const matchesQuery =
        !query ||
        item.fullName.toLowerCase().includes(query) ||
        item.phone.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.voucherId.toLowerCase().includes(query) ||
        item.idNumber.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || item.paymentStatus === paymentFilter;
      return matchesQuery && matchesStatus && matchesPayment;
    });
  }, [requests, search, statusFilter, paymentFilter]);

  const stats = useMemo(() => ({
    total: requests.length,
    newCount: requests.filter((item) => item.status === 'new').length,
    paidCount: requests.filter((item) => item.paymentStatus === 'paid').length,
    withRecordings: requests.filter((item) => Boolean(item.recordingUrl)).length,
  }), [requests]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const selected = requests.find((item) => item.id === selectedId) || paginated[0] || null;

  useEffect(() => {
    if (selected) {
      setSelectedId(selected.id);
      setEditingStatus(selected.status);
      setAdminNotes(selected.adminNotes || '');
    }
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await backendApi.updateConsultation(selected.id, {
        status: editingStatus,
        adminNotes,
      });
      setRequests((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setSelectedId(updated.id);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full overflow-hidden bg-[#F8F5EF]">
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 border-b border-[#E4DBCF] bg-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-2xl font-extrabold text-[#1E1E1E]">{lang === 'ar' ? 'طلبات الاستشارات' : 'Consultation Requests'}</div>
              <div className="text-sm text-[#5B5B5B] mt-1">
                {lang === 'ar'
                  ? 'استقبال الطلبات، متابعة المرفقات، والرد التنفيذي من مكان واحد.'
                  : 'Receive requests, review files, and manage executive follow-up from one place.'}
              </div>
            </div>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              {[
                { label: lang === 'ar' ? 'الإجمالي' : 'Total', value: stats.total, icon: Users },
                { label: lang === 'ar' ? 'جديدة' : 'New', value: stats.newCount, icon: MessageSquareText },
                { label: lang === 'ar' ? 'مدفوعة' : 'Paid', value: stats.paidCount, icon: ShieldCheck },
                { label: lang === 'ar' ? 'تحتوي تسجيل' : 'With audio', value: stats.withRecordings, icon: FileAudio2 },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="rounded-2xl border border-[#E4DBCF] bg-[#FBF8F2] px-4 py-3 min-w-[150px]">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#7B5A42] uppercase tracking-widest">
                      <Icon className="h-4 w-4 text-[#A56A1E]" />
                      <span>{card.label}</span>
                    </div>
                    <div className="text-2xl font-extrabold text-[#1E1E1E] mt-2">{card.value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-5 border-b border-[#E4DBCF] bg-[#F8F5EF]">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_repeat(3,auto)] gap-3 items-center">
            <div className="flex items-center gap-3 rounded-2xl border border-[#D8D1C7] bg-white px-4 py-3">
              <Search className="h-4 w-4 text-[#A56A1E]" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder={lang === 'ar' ? 'ابحث بالاسم أو الهاتف أو البريد أو رقم القيد…' : 'Search by name, phone, email, voucher…'}
                className="w-full bg-transparent outline-none text-sm text-[#1E1E1E]"
              />
            </div>
            <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as StatusFilter); setPage(1); }} className="rounded-2xl border border-[#D8D1C7] bg-white px-4 py-3 text-sm text-[#1E1E1E]">
              <option value="all">{lang === 'ar' ? 'كل الحالات' : 'All statuses'}</option>
              <option value="new">{lang === 'ar' ? 'جديد' : 'New'}</option>
              <option value="reviewing">{lang === 'ar' ? 'قيد المراجعة' : 'Reviewing'}</option>
              <option value="responded">{lang === 'ar' ? 'تم الرد' : 'Responded'}</option>
              <option value="closed">{lang === 'ar' ? 'مغلق' : 'Closed'}</option>
            </select>
            <select value={paymentFilter} onChange={(event) => { setPaymentFilter(event.target.value as 'all' | ApiConsultationRequest['paymentStatus']); setPage(1); }} className="rounded-2xl border border-[#D8D1C7] bg-white px-4 py-3 text-sm text-[#1E1E1E]">
              <option value="all">{lang === 'ar' ? 'كل المدفوعات' : 'All payment states'}</option>
              <option value="paid">{lang === 'ar' ? 'مدفوع' : 'Paid'}</option>
              <option value="pending">{lang === 'ar' ? 'معلق' : 'Pending'}</option>
              <option value="refunded">{lang === 'ar' ? 'مسترد' : 'Refunded'}</option>
            </select>
            <div className="flex items-center gap-2 rounded-2xl border border-[#D8D1C7] bg-white px-4 py-3 text-sm text-[#5B5B5B]">
              <Filter className="h-4 w-4 text-[#A56A1E]" />
              <span>{lang === 'ar' ? `${filtered.length} نتيجة` : `${filtered.length} results`}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto px-6 py-4">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-[#7B5A42]">
                <th className="px-4 py-3 border-b border-[#E4DBCF]">{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                <th className="px-4 py-3 border-b border-[#E4DBCF]">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="px-4 py-3 border-b border-[#E4DBCF]">{lang === 'ar' ? 'المدفوع' : 'Payment'}</th>
                <th className="px-4 py-3 border-b border-[#E4DBCF]">{lang === 'ar' ? 'التاريخ' : 'Submitted'}</th>
                <th className="px-4 py-3 border-b border-[#E4DBCF]">{lang === 'ar' ? 'المرفقات' : 'Files'}</th>
                <th className="px-4 py-3 border-b border-[#E4DBCF] text-end">{lang === 'ar' ? 'إجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item) => {
                const statusMeta = STATUS_LABELS[item.status];
                const paymentMeta = PAYMENT_LABELS[item.paymentStatus];
                const isSelected = item.id === selectedId;
                return (
                  <tr key={item.id} className={`transition-colors ${isSelected ? 'bg-[#FFF7ED]' : 'bg-white'}`}>
                    <td className="px-4 py-4 border-b border-[#E4DBCF]">
                      <div className="font-semibold text-[#1E1E1E]">{item.fullName}</div>
                      <div className="text-xs text-[#5B5B5B]">{item.email}</div>
                      <div className="text-xs text-[#A56A1E] font-mono">{item.voucherId}</div>
                    </td>
                    <td className="px-4 py-4 border-b border-[#E4DBCF]">
                      <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${statusMeta.color}18`, color: statusMeta.color }}>
                        <span className="h-2 w-2 rounded-full" style={{ background: statusMeta.color }} />
                        {lang === 'ar' ? statusMeta.ar : statusMeta.en}
                      </span>
                    </td>
                    <td className="px-4 py-4 border-b border-[#E4DBCF] text-sm text-[#1E1E1E]">
                      {lang === 'ar' ? paymentMeta.ar : paymentMeta.en}
                      <div className="text-xs text-[#5B5B5B] mt-1">{item.paymentAmount}</div>
                    </td>
                    <td className="px-4 py-4 border-b border-[#E4DBCF] text-sm text-[#1E1E1E]">
                      <div className="flex items-center gap-2 text-[#5B5B5B] text-xs">
                        <Clock3 className="h-3.5 w-3.5" />
                        <span>{formatDate(item.createdAt, lang)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 border-b border-[#E4DBCF] text-sm text-[#1E1E1E]">
                      {item.attachments.length} {lang === 'ar' ? 'ملف' : 'files'}
                      {item.recordingUrl ? <div className="text-xs text-emerald-600 mt-1">{lang === 'ar' ? 'يوجد تسجيل صوتي' : 'Voice note attached'}</div> : null}
                    </td>
                    <td className="px-4 py-4 border-b border-[#E4DBCF] text-end">
                      <button
                        onClick={() => {
                          setSelectedId(item.id);
                          setEditingStatus(item.status);
                          setAdminNotes(item.adminNotes || '');
                        }}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#D8D1C7] bg-white px-3 py-2 text-sm font-semibold text-[#1E1E1E] hover:border-[#A56A1E]"
                      >
                        <Eye className="h-4 w-4 text-[#A56A1E]" />
                        <span>{lang === 'ar' ? 'عرض' : 'View'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-[#5B5B5B]">
                    {lang === 'ar' ? 'لا توجد نتائج مطابقة.' : 'No matching consultations found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-6 pb-6">
          <div className="text-sm text-[#5B5B5B]">
            {lang === 'ar'
              ? `الصفحة ${page} من ${totalPages} • ${filtered.length} نتيجة`
              : `Page ${page} of ${totalPages} • ${filtered.length} results`}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} className="rounded-xl border border-[#D8D1C7] bg-white px-4 py-2 text-sm disabled:opacity-40">
              {lang === 'ar' ? 'السابق' : 'Previous'}
            </button>
            <button onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page >= totalPages} className="rounded-xl border border-[#D8D1C7] bg-white px-4 py-2 text-sm disabled:opacity-40">
              {lang === 'ar' ? 'التالي' : 'Next'}
            </button>
            <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded-xl border border-[#D8D1C7] bg-white px-3 py-2 text-sm">
              {[8, 12, 20].map((size) => <option key={size} value={size}>{size}/page</option>)}
            </select>
          </div>
        </div>
      </div>

      <aside className="w-[420px] max-w-[40vw] border-l border-[#E4DBCF] bg-white overflow-y-auto">
        {selected ? (
          <div className="p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-[#A56A1E] font-semibold">{lang === 'ar' ? 'تفاصيل الطلب' : 'Request details'}</div>
                <div className="text-2xl font-extrabold text-[#1E1E1E] mt-1">{selected.fullName}</div>
                <div className="text-sm text-[#5B5B5B]">{selected.voucherId}</div>
              </div>
              <button onClick={() => setSelectedId(null)} className="rounded-full border border-[#D8D1C7] p-2 text-[#5B5B5B]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#D8D1C7] bg-[#FBF8F2] p-3">
                <div className="text-xs uppercase tracking-widest text-[#7B5A42]">{lang === 'ar' ? 'الحالة' : 'Status'}</div>
                <div className="mt-2 text-sm font-semibold text-[#1E1E1E]">{lang === 'ar' ? STATUS_LABELS[editingStatus].ar : STATUS_LABELS[editingStatus].en}</div>
              </div>
              <div className="rounded-2xl border border-[#D8D1C7] bg-[#FBF8F2] p-3">
                <div className="text-xs uppercase tracking-widest text-[#7B5A42]">{lang === 'ar' ? 'المدفوع' : 'Payment'}</div>
                <div className="mt-2 text-sm font-semibold text-[#1E1E1E]">{selected.paymentAmount}</div>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-[#D8D1C7] bg-[#FBF8F2] p-4">
              <div className="text-xs uppercase tracking-widest text-[#7B5A42]">{lang === 'ar' ? 'المعلومات الأساسية' : 'Core info'}</div>
              <div className="space-y-2 text-sm text-[#1E1E1E]">
                <div><span className="font-semibold">{lang === 'ar' ? 'الهاتف:' : 'Phone:'}</span> {selected.phone}</div>
                <div><span className="font-semibold">{lang === 'ar' ? 'البريد:' : 'Email:'}</span> {selected.email}</div>
                <div><span className="font-semibold">{lang === 'ar' ? 'الهوية:' : 'ID:'}</span> {selected.idNumber}</div>
                <div><span className="font-semibold">{lang === 'ar' ? 'آخر أربعة أرقام:' : 'Last 4:'}</span> {selected.cardLast4 || '—'}</div>
                <div><span className="font-semibold">{lang === 'ar' ? 'نوع البطاقة:' : 'Brand:'}</span> {selected.cardBrand}</div>
                <div><span className="font-semibold">{lang === 'ar' ? 'أُرسلت:' : 'Submitted:'}</span> {formatDate(selected.createdAt, lang)}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs uppercase tracking-widest text-[#7B5A42]">{lang === 'ar' ? 'الرسالة' : 'Message'}</div>
              <div className="rounded-2xl border border-[#D8D1C7] bg-white p-4 text-sm text-[#1E1E1E] leading-relaxed whitespace-pre-wrap">
                {selected.message}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs uppercase tracking-widest text-[#7B5A42]">{lang === 'ar' ? 'التسجيل الصوتي' : 'Voice recording'}</div>
              {selected.recordingUrl ? (
                <audio controls src={selected.recordingUrl} className="w-full" />
              ) : (
                <div className="rounded-2xl border border-dashed border-[#D8D1C7] bg-[#FBF8F2] p-4 text-sm text-[#5B5B5B]">
                  {lang === 'ar' ? 'لا يوجد تسجيل مرفق.' : 'No audio recording attached.'}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="text-xs uppercase tracking-widest text-[#7B5A42]">{lang === 'ar' ? 'الملفات المرفقة' : 'Attachments'}</div>
              <div className="grid grid-cols-1 gap-3">
                {selected.attachments.length > 0 ? selected.attachments.map((attachment) => (
                  <AttachmentPreview key={attachment.id} attachment={attachment} />
                )) : (
                  <div className="rounded-2xl border border-dashed border-[#D8D1C7] bg-[#FBF8F2] p-4 text-sm text-[#5B5B5B]">
                    {lang === 'ar' ? 'لم يتم رفع ملفات إضافية.' : 'No supporting files were uploaded.'}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-[#D8D1C7] bg-white p-4">
              <div className="text-xs uppercase tracking-widest text-[#7B5A42]">{lang === 'ar' ? 'تحديث حالة الطلب' : 'Update request status'}</div>
              <select value={editingStatus} onChange={(event) => setEditingStatus(event.target.value as ConsultationStatus)} className="w-full rounded-xl border border-[#D8D1C7] px-4 py-3 text-sm">
                <option value="new">{lang === 'ar' ? 'جديد' : 'New'}</option>
                <option value="reviewing">{lang === 'ar' ? 'قيد المراجعة' : 'Reviewing'}</option>
                <option value="responded">{lang === 'ar' ? 'تم الرد' : 'Responded'}</option>
                <option value="closed">{lang === 'ar' ? 'مغلق' : 'Closed'}</option>
              </select>
              <textarea
                value={adminNotes}
                onChange={(event) => setAdminNotes(event.target.value)}
                rows={4}
                placeholder={lang === 'ar' ? 'أضف ملاحظات داخلية للفريق…' : 'Add internal notes for the team…'}
                className="w-full rounded-xl border border-[#D8D1C7] px-4 py-3 text-sm"
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-xl bg-[#A56A1E] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? (lang === 'ar' ? 'جارٍ الحفظ…' : 'Saving…') : (lang === 'ar' ? 'حفظ التحديث' : 'Save update')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-8 text-center text-[#5B5B5B]">
            {lang === 'ar' ? 'اختر طلباً لعرض كل التفاصيل.' : 'Select a request to view the full detail sheet.'}
          </div>
        )}
      </aside>
    </div>
  );
}
