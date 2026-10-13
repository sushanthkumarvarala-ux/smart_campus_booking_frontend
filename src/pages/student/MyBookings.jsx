import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatTimeRange, formatDateTime } from '../../utils/formatDate';
import {
  CalendarDays,
  Clock,
  MapPin,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Filter,
  FileText,
  Ban,
} from 'lucide-react';

const STATUS_TABS = [
  { id: null, label: 'All Bookings' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchBookings();
  }, [selectedStatus]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getMyBookings(selectedStatus);
      setBookings(data);
    } catch {
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setCancelLoading(true);
    try {
      await bookingService.cancelBooking(cancellingBooking.id, cancelReason);
      toast.success(`Booking #${cancellingBooking.id} cancelled successfully`);
      setCancellingBooking(null);
      setCancelReason('');
      fetchBookings();
    } catch (err) {
      toast.error(err.message || 'Could not cancel booking');
    } finally {
      setCancelLoading(false);
    }
  };

  const canCancel = (booking) => {
    const isAllowedStatus = booking.status === 'PENDING' || booking.status === 'APPROVED';
    const isFuture = new Date(booking.startTime) > new Date();
    return isAllowedStatus && isFuture;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Campus Reservations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review status updates, scheduled time slots, and manage reservations
          </p>
        </div>
        <Link
          to="/resources"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-200 transition-colors self-start sm:self-auto"
        >
          <CalendarDays className="w-4 h-4" />
          <span>New Reservation</span>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setSelectedStatus(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedStatus === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings Table / List */}
      {loading ? (
        <LoadingSpinner message="Retrieving your reservation history..." />
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Reservations Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            You don't have any bookings matching this filter status.
          </p>
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-semibold text-xs rounded-xl hover:bg-indigo-100 transition-colors"
          >
            <span>Explore Campus Facilities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">ID & Resource</th>
                  <th className="py-3.5 px-6">Scheduled Time Window</th>
                  <th className="py-3.5 px-6">Purpose</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Admin Remarks</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm">
                        {item.resourceName}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{item.resourceLocation}</span>
                        <span>•</span>
                        <span>#{item.id}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">
                        {formatTimeRange(item.startTime, item.endTime)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Submitted: {formatDateTime(item.createdAt)}
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
                      {canCancel(item) ? (
                        <button
                          type="button"
                          onClick={() => setCancellingBooking(item)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-300 font-medium">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Cancel Booking Request</h3>
                <p className="text-xs text-slate-500">Booking #{cancellingBooking.id} • {cancellingBooking.resourceName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel this reservation? The reserved time slot will become available for other campus students and faculty.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for cancellation (optional):
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Event postponed, schedule changed"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCancellingBooking(null);
                  setCancelReason('');
                }}
                disabled={cancelLoading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
              >
                {cancelLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Ban className="w-3.5 h-3.5" />
                    <span>Confirm Cancellation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
