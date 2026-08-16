interface Props {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  variant?: 'urgent' | 'default';
}

export default function StatCard({ icon: Icon, value, label, variant = 'default' }: Props) {
  return (
    <div
      className={`rounded-xl p-5 flex items-center gap-4 ${
        variant === 'urgent' ? 'bg-red-50 border border-red-100' : 'bg-white shadow-sm'
      }`}
    >
      <Icon className="w-10 h-10 text-rose-600" />
      <div>
        <span className="block text-2xl font-bold">{value}</span>
        <span className="text-sm text-slate-500">{label}</span>
      </div>
    </div>
  );
}
