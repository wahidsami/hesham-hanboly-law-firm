import { useEffect, useMemo, useState } from 'react';
import { Clock3, Filter, FileText, Building, Phone, Search, ShieldCheck, User, Users } from 'lucide-react';
import { backendApi } from '../../api/backend';
import type { ApiDoctorShieldRequest, ConsultationPaymentStatus, ConsultationStatus } from '../../api/types';

interface DoctorShieldRequestsModuleProps {
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

const PAYMENT_LABELS: Record<ConsultationPaymentStatus, { en: string; ar: string }> = {
  paid: { en: 'Paid', ar: 'مدفوع' },
  pending: { en: 'Pending', ar: 'معلق' },
  refunded: { en: 'Refunded', ar: 'مسترد' },
};

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

export function DoctorShieldRequestsModule({ lang, onCountChange }: DoctorShieldRequestsModuleProps) {
  const [requests, setRequests] = useState<ApiDoctorShieldRequest[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | ConsultationPaymentStatus>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<ConsultationStatus>('new');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function refresh() {
    try {
      const loaded = await backendApi.listDoctorShieldRequests();
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
        item.idNumber.toLowerCase().includes(query) ||
        item.specialty.toLowerCase().includes(query) ||
        item.city.toLowerCase().includes(query) ||
        item.employer.toLowerCase().includes(query) ||
        item.voucherId.toLowerCase().includes(query) ||
        item.notes.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || item.paymentStatus === paymentFilter;
      return matchesQuery && matchesStatus && matchesPayment;
    });
  }, [requests, search, statusFilter, paymentFilter]);

  const stats = useMemo(() => ({
    total: requests.length,
    newCount: requests.filter((item) => item.status === 'new').length,
    paidCount: requests.filter((item) => item.paymentStatus === 'paid').length,
    yesConvicted: requests.filter((item) => item.hasBeenConvicted === 'yes').length,
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
      const updated = await backendApi.updateDoctorShieldRequest(selected.id, {
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
              <div className="text-2xl font-extrabold text-[#1E1E1E]">{lang === 'ar' ? 'طلبات سند الطبيب' : 'Doctor Shield Requests'}</div>
              <div className="text-sm text-[#5B5B5B] mt-1">
                {lang === 'ar'
                  ? 'استقبال الطلبات الطبية، مراجعة بيانات الاشتراك، ومتابعة الدفع من مكان واحد.'
                  : 'Receive Doctor Shield requests, review onboarding details, and manage payment follow-up from one place.'}
              </div>
            </div>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              {[
                { label: lang === 'ar' ? 'الإجمالي' : 'Total', value: stats.total, icon: Users },
                { label: lang === 'ar' ? 'جديدة' : 'New', value: stats.newCount, icon: User },
                { label: lang === 'ar' ? 'مدفوعة' : 'Paid', value: stats.paidCount, icon: ShieldCheck },
                { label: lang === 'ar' ? 'إفصاح سابق' : 'Prior case', value: stats.yesConvicted, icon: FileText },
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
                placeholder={lang === 'ar' ? 'ابحث بالاسم أو الهاتف أو التخصص…' : 'Search by name, phone, specialty, voucher…'}
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
            <select value={paymentFilter} onChange={(event) => { setPaymentFilter(event.target.value as 'all' | ConsultationPaymentStatus); setPage(1); }} className="rounded-2xl border border-[#D8D1C7] bg-white px-4 py-3 text-sm text-[#1E1E1E]">
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
                <th className="px-4 py-3 border-b border-[#E4DBCF]">{lang === 'ar' ? 'التخصص' : 'Specialty'}</th>
                <th className="px-4 py-3 border-b border-[#E4DBCF]">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="px-4 py-3 border-b border-[#E4DBCF]">{lang === 'ar' ? 'المدفوع' : 'Payment'}</th>
                <th className="px-4 py-3 border-b border-[#E4DBCF]">{lang === 'ar' ? 'التاريخ' : 'Submitted'}</th>
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
                      <div className="text-xs text-[#5B5B5B]">{item.phone}</div>
                      <div className="text-xs text-[#A56A1E] font-mono">{item.voucherId}</div>
                    </td>
                    <td className="px-4 py-4 border-b border-[#E4DBCF] text-sm text-[#1E1E1E]">
                      <div className="max-w-[220px]">{item.specialty}</div>
                      <div className="text-xs text-[#5B5B5B] mt-1">{item.city || item.employer}</div>
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
                    <td className="px-4 py-4 border-b border-[#E4DBCF] text-end">
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className="rounded-xl border border-[#D8D1C7] bg-white px-3 py-2 text-xs font-semibold text-[#1E1E1E] hover:border-[#A56A1E]"
                      >
                        {lang === 'ar' ? 'عرض' : 'View'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {paginated.length === 0 && (
            <div className="py-16 text-center text-sm text-[#5B5B5B]">
              {lang === 'ar' ? 'لا توجد نتائج مطابقة.' : 'No matching Doctor Shield requests found.'}
            </div>
          )}

          <div className="flex items-center justify-between gap-4 py-5">
            <div className="text-xs text-[#5B5B5B]">
              {lang === 'ar'
                ? `صفحة ${page} من ${totalPages}`
                : `Page ${page} of ${totalPages}`}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                className="rounded-xl border border-[#D8D1C7] bg-white px-3 py-2 text-sm"
              >
                {[5, 8, 12, 20].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-xl border border-[#D8D1C7] bg-white px-3 py-2 text-sm disabled:opacity-40"
              >
                {lang === 'ar' ? 'السابق' : 'Previous'}
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                className="rounded-xl border border-[#D8D1C7] bg-white px-3 py-2 text-sm disabled:opacity-40"
              >
                {lang === 'ar' ? 'التالي' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <aside className="w-[420px] border-l border-[#E4DBCF] bg-white overflow-y-auto">
        {selected ? (
          <div className="p-6 space-y-5">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-[#A56A1E] font-semibold">{lang === 'ar' ? 'تفاصيل الطلب' : 'Request details'}</div>
              <div className="text-2xl font-extrabold text-[#1E1E1E] mt-1">{selected.fullName}</div>
              <div className="text-sm text-[#5B5B5B] mt-1">{selected.specialty}</div>
            </div>

            <div className="rounded-2xl border border-[#E4DBCF] bg-[#FBF8F2] p-4 space-y-3">
              {[
                { label: lang === 'ar' ? 'الهاتف' : 'Phone', value: selected.phone, icon: Phone },
                { label: lang === 'ar' ? 'البريد' : 'Email', value: selected.email, icon: FileText },
                { label: lang === 'ar' ? 'الهوية / الإقامة' : 'National ID / Iqama', value: selected.idNumber, icon: User },
                { label: lang === 'ar' ? 'المدينة' : 'City', value: selected.city || '—', icon: User },
                { label: lang === 'ar' ? 'جهة العمل' : 'Employer', value: selected.employer || '—', icon: Building },
                { label: lang === 'ar' ? 'الاعتراف السابق' : 'Has prior conviction', value: selected.hasBeenConvicted === 'yes' ? (lang === 'ar' ? 'نعم' : 'Yes') : (lang === 'ar' ? 'لا' : 'No'), icon: ShieldCheck },
                { label: lang === 'ar' ? 'فئة الاشتراك' : 'Subscription plan', value: selected.hasBeenConvicted === 'yes' ? (lang === 'ar' ? 'الفئة الشاملة' : 'Comprehensive Plan') : (lang === 'ar' ? 'الفئة الأساسية' : 'Basic Plan'), icon: ShieldCheck },
                { label: lang === 'ar' ? 'المرجع / القسيمة' : 'Voucher / reference', value: selected.voucherId, icon: FileText },
                { label: lang === 'ar' ? 'طريقة الدفع' : 'Payment method', value: selected.paymentMethod || selected.cardBrand || '—', icon: ShieldCheck },
                { label: lang === 'ar' ? 'قيمة الاشتراك' : 'Payment amount', value: selected.paymentAmount, icon: FileText },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.label} className="flex items-start gap-3">
                    <Icon className="h-4 w-4 text-[#A56A1E] mt-0.5" />
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-[#7B5A42]">{row.label}</div>
                      <div className="text-sm text-[#1E1E1E] mt-1">{row.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-[#E4DBCF] p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-[#7B5A42] mb-2">{lang === 'ar' ? 'الملاحظات' : 'Notes'}</div>
              <div className="text-sm text-[#1E1E1E] whitespace-pre-wrap leading-7">{selected.notes || '—'}</div>
            </div>

            <div className="space-y-3">
              <div className="text-xs uppercase tracking-[0.16em] text-[#7B5A42]">{lang === 'ar' ? 'تغيير الحالة' : 'Update status'}</div>
              <select value={editingStatus} onChange={(event) => setEditingStatus(event.target.value as ConsultationStatus)} className="w-full rounded-2xl border border-[#D8D1C7] bg-white px-4 py-3 text-sm">
                <option value="new">{lang === 'ar' ? 'جديد' : 'New'}</option>
                <option value="reviewing">{lang === 'ar' ? 'قيد المراجعة' : 'Reviewing'}</option>
                <option value="responded">{lang === 'ar' ? 'تم الرد' : 'Responded'}</option>
                <option value="closed">{lang === 'ar' ? 'مغلق' : 'Closed'}</option>
              </select>
              <textarea
                value={adminNotes}
                onChange={(event) => setAdminNotes(event.target.value)}
                rows={6}
                placeholder={lang === 'ar' ? 'ملاحظات داخلية...' : 'Internal notes...'}
                className="w-full rounded-2xl border border-[#D8D1C7] bg-white px-4 py-3 text-sm outline-none resize-none"
              />
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-2xl bg-[#A56A1E] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? (lang === 'ar' ? 'جارٍ الحفظ…' : 'Saving…') : (lang === 'ar' ? 'حفظ التغييرات' : 'Save changes')}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-sm text-[#5B5B5B]">
            {lang === 'ar' ? 'اختر طلباً لعرض التفاصيل.' : 'Select a request to view the full detail sheet.'}
          </div>
        )}
      </aside>
    </div>
  );
}
