import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatTimeRange, formatDateTime } from '../../utils/formatDate';
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  User,
  Check,
  X,
  MessageSquare,
  Filter,
} from 'lucide-react';

const STATUS_TABS = [
  { id: 'PENDING', label: 'Pending Review' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'CANCELLED', label: 'Cancelled' },
  { id: null, label: 'All Bookings' },
];

const AdminManageBookings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'PENDING';

  const [selectedStatus, setSelectedStatus] = useState(initialStatus === 'ALL' ? null : initialStatus);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [actionModal, setActionModal] = useState({ open: false, type: null, booking: null });
  const [remarkInput, setRemarkInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const toast = useToast();

  useEffect(() => {
    fetchBookings();
  }, [selectedStatus]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getAdminBookings(selectedStatus);
      setBookings(data);
    } catch {
      toast.error('Failed to load campus bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenActionModal = (type, booking) => {
    setActionModal({ open: true, type, booking });
    setRemarkInput(type === 'approve' ? 'Approved for campus activity' : 'Facility unavailable or conflict');
  };

  const handleCloseActionModal = () => {
    setActionModal({ open: false, type: null, booking: null });
    setRemarkInput('');
  };

  const handleExecuteAction = async () => {
    if (!actionModal.booking) return;
    setActionLoading(true);
    const { type, booking } = actionModal;

    try {
      if (type === 'approve') {
        await bookingService.approveBooking(booking.id, remarkInput);
        toast.success(`Booking #${booking.id} APPROVED`);
      } else if (type === 'reject') {
        await bookingService.rejectBooking(booking.id, remarkInput);
        toast.success(`Booking #${booking.id} REJECTED`);
      }
      handleCloseActionModal();
      fetchBookings();
    } catch (err) {
      toast.error(err.message || `Failed to ${type} booking`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Campus Booking Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review, approve, and resolve reservation conflicts across university resources
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isSelected = selectedStatus === tab.id;
          return (
            <button
              key={tab.label}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Bookings Table */}
      {loading ? (
        <LoadingSpinner message="Loading reservation records..." />
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 max-w-md mx-auto">
          <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">No Bookings Found</h4>
          <p className="text-xs text-slate-400 mt-1">
            No reservations currently match the selected status filter.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">ID & Resource</th>
                  <th className="py-3.5 px-6">Requester Info</th>
                  <th className="py-3.5 px-6">Scheduled Window</th>
                  <th className="py-3.5 px-6">Event Purpose</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Remarks</th>
                  <th className="py-3.5 px-6 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm">
                        {item.resourceName}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{item.resourceLocation}</span>
                        <span>•</span>
                        <span>#{item.id}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">
                        {item.userName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.userEmail}
                      </div>
                      <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-600">
                        {item.userRole}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">
                        {formatTimeRange(item.startTime, item.endTime)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Requested: {formatDateTime(item.createdAt)}
                      </div>
                    </td>

                    <td className="py-4 px-6 max-w-xs">
                      <p className="text-slate-700 truncate" title={item.purpose}>
                        {item.purpose}
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="py-4 px-6 max-w-xs text-slate-500 italic">
                      {item.adminRemark || '—'}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {item.status === 'PENDING' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenActionModal('approve', item)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm"
                            title="Approve Booking"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenActionModal('reject', item)}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1"
                            title="Reject Booking"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Decided</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Remark Modal (Approve or Reject) */}
      {actionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  actionModal.type === 'approve'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-rose-100 text-rose-600'
                }`}
              >
                {actionModal.type === 'approve' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 capitalize">
                  {actionModal.type} Reservation #{actionModal.booking?.id}
                </h3>
                <p className="text-xs text-slate-500">
                  {actionModal.booking?.resourceName} • {actionModal.booking?.userName}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {actionModal.type === 'approve' ? 'Approval Note (Optional):' : 'Rejection Reason (Required):'}
              </label>
              <textarea
                rows={3}
                value={remarkInput}
                onChange={(e) => setRemarkInput(e.target.value)}
                placeholder="Enter message for requester..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCloseActionModal}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={actionLoading}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-md transition-colors flex items-center gap-1.5 ${
                  actionModal.type === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Confirm {actionModal.type === 'approve' ? 'Approval' : 'Rejection'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManageBookings;
