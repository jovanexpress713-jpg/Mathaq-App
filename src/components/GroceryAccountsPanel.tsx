import React, { useEffect, useState } from 'react';
import { Check, X, RefreshCw, Store } from 'lucide-react';
import { api } from '../services/api';

type GroceryAccount = {
  id: string; storeName: string; contactName: string; phone: string;
  address: string; status: 'PENDING' | 'APPROVED' | 'REJECTED'; createdAt: string;
};

export const GroceryAccountsPanel: React.FC = () => {
  const [accounts, setAccounts] = useState<GroceryAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setAccounts(await api.getGroceryAccounts()); }
    catch (e: any) { setError(e.message || 'تعذر تحميل حسابات البقالات'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const update = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try { await api.setGroceryAccountStatus(id, status); await load(); }
    catch (e: any) { setError(e.message || 'تعذر تحديث الحساب'); }
  };

  const statusLabel = (status: GroceryAccount['status']) =>
    status === 'APPROVED' ? 'معتمد' : status === 'REJECTED' ? 'مرفوض' : 'بانتظار الموافقة';

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#f5ebe1]">حسابات البقالات</h2>
          <p className="text-[11px] text-[#857361] mt-1">اعتماد الحساب يفعّل أسعار الجملة لهذا المتجر.</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-2 rounded-xl border border-[#3d2c1d] px-3 py-2 text-xs text-[#c69a59]">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> تحديث
        </button>
      </div>
      {error && <p className="rounded-xl bg-red-950/50 p-3 text-xs text-red-200">{error}</p>}
      {!loading && accounts.length === 0 && <div className="rounded-2xl border border-dashed border-[#3d2c1d] p-8 text-center text-xs text-[#857361]">لا توجد طلبات تسجيل بقالات حتى الآن.</div>}
      <div className="grid gap-3">
        {accounts.map(account => (
          <article key={account.id} className="rounded-2xl border border-[#2d2118] bg-[#18110c] p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="rounded-xl bg-[#251b14] p-3 text-[#c69a59]"><Store className="w-5 h-5" /></div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#f5ebe1]">{account.storeName}</h3>
                  <p className="text-[11px] text-[#b8a594]">{account.contactName} · {account.phone}</p>
                  <p className="text-[11px] text-[#857361]">{account.address}</p>
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] ${account.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300' : account.status === 'REJECTED' ? 'bg-red-950 text-red-300' : 'bg-amber-950 text-amber-300'}`}>{statusLabel(account.status)}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {account.status !== 'APPROVED' && <button onClick={() => update(account.id, 'APPROVED')} className="flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-[11px] font-bold text-white"><Check className="w-3.5 h-3.5" /> اعتماد الحساب</button>}
              {account.status !== 'REJECTED' && <button onClick={() => update(account.id, 'REJECTED')} className="flex items-center gap-1 rounded-lg bg-red-950 px-3 py-2 text-[11px] text-red-200"><X className="w-3.5 h-3.5" /> رفض</button>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
