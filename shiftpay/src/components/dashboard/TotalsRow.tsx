import { formatCurrency } from "@/lib/calculations";

export function TotalsRow({ weekTotal, monthTotal }: { weekTotal: number; monthTotal: number }) {
  return (
    <section className="grid grid-cols-2 gap-3" aria-label="Earnings totals">
      <TotalCard label="This week" value={weekTotal} />
      <TotalCard label="This month" value={monthTotal} />
    </section>
  );
}

function TotalCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`numeric mt-1 text-xl font-bold ${value < 0 ? "text-loss" : "text-earn"}`}>{formatCurrency(value)}</p>
    </div>
  );
}
