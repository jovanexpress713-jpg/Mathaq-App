import React, { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck, RefreshCw, ShoppingBag, Clock3, Store } from 'lucide-react';
import { api } from '../services/api';

type Notice = { id: string; title: string; body: string; type: string; referenceId?: string; isRead: boolean; createdAt: string };

export const NotificationsPanel: React.FC = () => {
  const [items, setItems] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try { setItems(await api.getNotifications()); setError(''); }
    catch (e: any) { setError(e.message || 'تعذر تحميل الإشعارات'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    load();
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, [load]);
  const markOne = async (id: string) => {
    try { await api.markNotificationRead(id); setItems(old => old.map(n => n.id === id ? { ...n, isRead: true } : n)); }
    catch (e: any) { setError(e.message || 'تعذر تحديث الإشعار'); }
  };
  const markAll = async () => {
    try { await api.markAllNotificationsRead(); setItems(old => old.map(n => ({ ...n, isRead: true }))); }
    catch (e: any) { setError(e.message || 'تعذر تحديث الإشعارات'); }
  };
  const unread = items.filter(n => !n.isRead).length;
  return <section className="space-y-4" dir="rtl">
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div><h2 className="text-lg font-black text-[#f5ebe1]">مركز الإشعارات</h2><p className="text-xs text-[#9b8876] mt-1">تنبيهات الطلبات وتحديثات النشاط محفوظة في قاعدة البيانات</p></div>
      <div className="flex gap-2">
        <button onClick={load} className="px-3 py-2 rounded-xl border border-[#3d2c1d] text-xs text-[#d7bd9b]"><RefreshCw className="inline w-3.5 h-3.5 ml-1"/>تحديث</button>
        <button onClick={markAll} disabled={!unread} className="px-3 py-2 rounded-xl bg-[#c69a59] text-[#100b07] text-xs font-bold disabled:opacity-40"><CheckCheck className="inline w-3.5 h-3.5 ml-1"/>تعليم الكل كمقروء</button>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl border border-[#3d2c1d] bg-[#17100b] p-4"><span className="text-xs text-[#a99580]">كل الإشعارات</span><strong className="block text-2xl text-[#f5ebe1] mt-1">{items.length}</strong></div>
      <div className="rounded-2xl border border-[#3d2c1d] bg-[#17100b] p-4"><span className="text-xs text-[#a99580]">غير المقروءة</span><strong className="block text-2xl text-[#e7b85d] mt-1">{unread}</strong></div>
    </div>
    {error && <p className="text-xs text-red-300">{error}</p>}
    {loading ? <p className="text-sm text-[#a99580]">جارٍ تحميل الإشعارات...</p> : items.length === 0 ? <div className="rounded-2xl border border-dashed border-[#493522] p-10 text-center text-[#a99580]"><Bell className="mx-auto mb-3 opacity-50"/>لا توجد إشعارات بعد. ستظهر هنا الطلبات الجديدة وتحديثات حالتها.</div> :
      <div className="space-y-2">{items.map(item => <article key={item.id} className={`rounded-2xl border p-4 flex gap-3 ${item.isRead ? 'border-[#302318] bg-[#120d09]' : 'border-[#8b6334] bg-[#24180e]'}`}>
        <div className="w-10 h-10 shrink-0 rounded-xl bg-[#c69a59]/15 text-[#d9ad68] grid place-items-center">{item.type === 'ORDER_NEW' ? <ShoppingBag/> : item.type.includes('GROCERY') ? <Store/> : <Bell/>}</div>
        <div className="min-w-0 flex-1"><div className="flex gap-2 items-center flex-wrap"><h3 className="font-bold text-sm text-[#f5ebe1]">{item.title}</h3>{!item.isRead && <span className="text-[10px] rounded-full bg-[#c69a59] text-[#100b07] px-2 py-0.5">جديد</span>}</div><p className="text-xs text-[#c4b09b] mt-1">{item.body}</p><p className="text-[10px] text-[#806f5e] mt-2"><Clock3 className="inline w-3 h-3 ml-1"/>{new Date(item.createdAt).toLocaleString('ar')}</p></div>
        {!item.isRead && <button onClick={() => markOne(item.id)} className="self-center text-[11px] text-[#e5bd78] underline whitespace-nowrap">مقروء</button>}
      </article>)}</div>}
  </section>;
};
