import React, { useEffect, useState } from 'react';
import { Plus, TicketPercent, Trash2, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
import { DiscountCoupon } from '../types';
import { api } from '../services/api';

const emptyCoupon = {
  code: '', title: '', description: '', discountType: 'PERCENT' as const,
  discountValue: 10, minOrderAmount: 0, maxDiscountAmount: 0,
  firstOrderOnly: true, usageLimit: 0, startDate: new Date().toISOString().slice(0,16),
  endDate: new Date(Date.now()+30*86400000).toISOString().slice(0,16), isActive: true,
};

export const CouponsPanel: React.FC = () => {
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
  const [draft, setDraft] = useState<any>(emptyCoupon);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const load = async () => { setBusy(true); try { setCoupons(await api.getCoupons()); } catch (e:any) { setMessage(e.message); } finally { setBusy(false); } };
  useEffect(() => { load(); }, []);
  const save = async () => {
    setBusy(true); setMessage('');
    try {
      const payload = { ...draft, code: String(draft.code).toUpperCase().trim(), startDate: new Date(draft.startDate).toISOString(), endDate: new Date(draft.endDate).toISOString(), usageLimit: Number(draft.usageLimit) || undefined, maxDiscountAmount: Number(draft.maxDiscountAmount) || undefined };
      if (editingId) await api.updateCoupon(editingId, payload); else await api.createCoupon(payload);
      setDraft(emptyCoupon); setEditingId(null); setMessage('تم حفظ الكوبون بنجاح'); await load();
    } catch (e:any) { setMessage(e.message || 'تعذر حفظ الكوبون'); } finally { setBusy(false); }
  };
  return <section className="space-y-5" dir="rtl">
    <div className="rounded-2xl border border-[#3d2c1d] bg-gradient-to-l from-[#25170e] to-[#17100b] p-5 flex items-center justify-between gap-3">
      <div><p className="text-xs text-[#c69a59] font-bold">MARKETING STUDIO</p><h2 className="text-lg font-black text-[#f5ebe1] mt-1">مركز الكوبونات والخصومات</h2><p className="text-xs text-[#a8927a] mt-1">أنشئ عروضاً لأول طلب أو خصومات عامة، والتحقق والحساب يتمان داخل الخادم.</p></div>
      <TicketPercent className="w-9 h-9 text-[#e5bd6a]" />
    </div>
    {message && <div className="rounded-xl border border-[#70502d] bg-[#21170f] p-3 text-xs text-[#f1d59c]">{message}</div>}
    <div className="rounded-2xl border border-[#302318] bg-[#18110c] p-4 space-y-3">
      <div className="flex items-center justify-between"><h3 className="font-bold text-sm text-[#f5ebe1]">{editingId ? 'تعديل كوبون' : 'إنشاء كوبون جديد'}</h3><button onClick={()=>{setDraft(emptyCoupon);setEditingId(null)}} className="text-xs text-[#c69a59]">تفريغ النموذج</button></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={draft.code} onChange={e=>setDraft({...draft,code:e.target.value.toUpperCase()})} placeholder="رمز الكوبون مثال FIRST10" className="rounded-xl bg-[#100b08] border border-[#3d2c1d] p-3 text-xs" />
        <input value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} placeholder="اسم الحملة" className="rounded-xl bg-[#100b08] border border-[#3d2c1d] p-3 text-xs" />
        <select value={draft.discountType} onChange={e=>setDraft({...draft,discountType:e.target.value})} className="rounded-xl bg-[#100b08] border border-[#3d2c1d] p-3 text-xs"><option value="PERCENT">نسبة مئوية %</option><option value="FIXED">مبلغ ثابت</option></select>
        <input type="number" min="0.01" value={draft.discountValue} onChange={e=>setDraft({...draft,discountValue:Number(e.target.value)})} placeholder="قيمة الخصم" className="rounded-xl bg-[#100b08] border border-[#3d2c1d] p-3 text-xs" />
        <input type="number" min="0" value={draft.minOrderAmount} onChange={e=>setDraft({...draft,minOrderAmount:Number(e.target.value)})} placeholder="الحد الأدنى للطلب" className="rounded-xl bg-[#100b08] border border-[#3d2c1d] p-3 text-xs" />
        <input type="number" min="0" value={draft.maxDiscountAmount} onChange={e=>setDraft({...draft,maxDiscountAmount:Number(e.target.value)})} placeholder="أقصى خصم (اختياري)" className="rounded-xl bg-[#100b08] border border-[#3d2c1d] p-3 text-xs" />
        <input type="number" min="0" value={draft.usageLimit} onChange={e=>setDraft({...draft,usageLimit:Number(e.target.value)})} placeholder="عدد الاستخدامات (0 بلا حد)" className="rounded-xl bg-[#100b08] border border-[#3d2c1d] p-3 text-xs" />
        <label className="flex items-center gap-2 text-xs text-[#d5c2ae] rounded-xl bg-[#100b08] border border-[#3d2c1d] p-3"><input type="checkbox" checked={draft.firstOrderOnly} onChange={e=>setDraft({...draft,firstOrderOnly:e.target.checked})}/> لأول عملية شراء فقط</label>
        <label className="flex items-center gap-2 text-xs text-[#d5c2ae] rounded-xl bg-[#100b08] border border-[#3d2c1d] p-3"><input type="checkbox" checked={draft.isActive} onChange={e=>setDraft({...draft,isActive:e.target.checked})}/> تفعيل الكوبون فور الحفظ</label>
        <label className="text-[11px] text-[#a8927a]">بداية الحملة<input type="datetime-local" value={draft.startDate} onChange={e=>setDraft({...draft,startDate:e.target.value})} className="mt-1 w-full rounded-xl bg-[#100b08] border border-[#3d2c1d] p-3 text-xs text-[#f5ebe1]"/></label>
        <label className="text-[11px] text-[#a8927a]">نهاية الحملة<input type="datetime-local" value={draft.endDate} onChange={e=>setDraft({...draft,endDate:e.target.value})} className="mt-1 w-full rounded-xl bg-[#100b08] border border-[#3d2c1d] p-3 text-xs text-[#f5ebe1]"/></label>
      </div>
      <button disabled={busy || !draft.code || !draft.title} onClick={save} className="w-full rounded-xl bg-[#c69a59] p-3 text-xs font-black text-[#130c07] disabled:opacity-50">{editingId ? 'حفظ التعديلات' : 'إنشاء الكوبون'}</button>
    </div>
    <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-[#f5ebe1]">الحملات المنشأة ({coupons.length})</h3><button onClick={load} className="text-xs text-[#c69a59] flex gap-1 items-center"><RefreshCw className="w-3 h-3"/> تحديث</button></div>
    {coupons.map(c=><article key={c.id} className="rounded-2xl border border-[#302318] bg-[#18110c] p-4 flex flex-wrap items-center gap-3">
      <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><strong className="text-sm text-[#f3d28e]">{c.code}</strong><span className="text-[10px] text-[#a8927a]">{c.isActive?'مفعّل':'متوقف'}</span></div><p className="text-xs text-[#f5ebe1] mt-1">{c.title} — {c.discountType==='PERCENT'?c.discountValue+'%':c.discountValue+' خصم ثابت'}</p><p className="text-[10px] text-[#8f7b67] mt-1">{c.firstOrderOnly?'أول طلب فقط':'كل العملاء'} • الاستخدامات {c.usageCount}{c.usageLimit?' / '+c.usageLimit:''}</p></div>
      <button onClick={()=>{setDraft({...c,startDate:new Date(c.startDate).toISOString().slice(0,16),endDate:new Date(c.endDate).toISOString().slice(0,16)});setEditingId(c.id)}} className="rounded-lg bg-[#302216] px-3 py-2 text-xs text-[#e6c17d]">تعديل</button>
      <button onClick={async()=>{if(confirm('حذف الكوبون '+c.code+'؟')){await api.deleteCoupon(c.id);await load()}}} className="rounded-lg bg-[#351614] p-2 text-red-300"><Trash2 className="w-4 h-4"/></button>
    </article>)}
    {!coupons.length && <p className="rounded-xl border border-dashed border-[#493521] p-6 text-center text-xs text-[#9b8977]">لا توجد كوبونات حتى الآن. أنشئ أول حملة من النموذج أعلاه.</p>}
  </section>;
};
