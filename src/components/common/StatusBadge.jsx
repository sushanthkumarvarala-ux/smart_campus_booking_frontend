import React from 'react';
import { CheckCircle2, Clock, XCircle, Ban, CheckCheck } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const configs = {
    APPROVED: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      label: 'Approved',
    },
    PENDING: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock,
      label: 'Pending Review',
    },
    REJECTED: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
      label: 'Rejected',
    },
    CANCELLED: {
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: Ban,
      label: 'Cancelled',
    },
    COMPLETED: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: CheckCheck,
      label: 'Completed',
    },
  };

  const config = configs[status] || {
    bg: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: Clock,
    label: status,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
