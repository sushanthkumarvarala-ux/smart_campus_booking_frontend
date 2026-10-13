import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatTimeRange } from '../../utils/formatDate';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  Building,
  Users,
  ArrowRight,
  TrendingUp,
  Shield,
  Layers,
  Check,
  X,
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, pendingData] = await Promise.all([
        bookingService.getDashboardStats(),
        bookingService.getAdminBookings('PENDING'),
      ]);
      setStats(statsData);
      setPendingBookings(pendingData.slice(0, 5)); // show top 5 pending
    } catch {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprove = async (id) => {
    try {
      await bookingService.approveBooking(id, 'Approved via Admin Quick Actions');
      toast.success(`Booking #${id} approved successfully`);
      loadDashboardData();
    } catch (err) {
      toast.error(err.message || 'Could not approve booking');
    }
  };

  const handleQuickReject = async (id) => {
    try {
      await bookingService.rejectBooking(id, 'Conflict or unavailable slot');
      toast.success(`Booking #${id} rejected`);
      loadDashboardData();
    } catch (err) {
      toast.error(err.message || 'Could not reject booking');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Aggregating campus analytics..." />;
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time monitoring of campus reservations, facility operations, and pending approvals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/bookings"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-200 transition-colors"
          >
            Review All Bookings
          </Link>
          <Link
            to="/admin/resources"
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Facilities Catalog
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Requests</span>
            <CalendarDays className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalBookings || 0}</div>
          <span className="text-[10px] text-slate-400">All-time bookings</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm bg-gradient-to-br from-white to-amber-50/40">
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <span className="text-xs font-bold text-amber-800">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{stats?.pendingBookings || 0}</div>
          <span className="text-[10px] text-amber-600 font-semibold">Requires action</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats?.approvedBookings || 0}</div>
          <span className="text-[10px] text-slate-400">Scheduled events</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Rejected</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-800">{stats?.rejectedBookings || 0}</div>
          <span className="text-[10px] text-slate-400">Denied requests</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Campus Venues</span>
            <Building className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.activeResources || 0}</div>
          <span className="text-[10px] text-slate-400">Active of {stats?.totalResources || 0} total</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Campus Users</span>
            <Users className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalUsers || 0}</div>
          <span className="text-[10px] text-slate-400">{stats?.totalStudents || 0} students • {stats?.totalFaculty || 0} faculty</span>
        </div>
      </div>

      {/* Pending Approvals Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-base font-bold text-slate-900">
              Pending Booking Requests Queue
            </h2>
          </div>
          <Link
            to="/admin/bookings?status=PENDING"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All Pending ({stats?.pendingBookings || 0})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingBookings.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No pending booking requests at this time. All caught up!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingBookings.map((b) => (
              <div
                key={b.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {b.resourceName}
                    </span>
                    <span className="text-xs text-slate-400">#{b.id}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    Requested by: <span className="text-slate-900 font-semibold">{b.userName}</span> ({b.userEmail} • {b.userRole})
                  </div>
                  <div className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTimeRange(b.startTime, b.endTime)}</span>
                  </div>
                  <p className="text-xs text-slate-500 italic mt-1">
                    "{b.purpose}"
                  </p>
                </div>

                {/* Quick Approve / Reject Actions */}
                <div className="flex items-center gap-2 self-start md:self-center">
                  <button
                    onClick={() => handleQuickApprove(b.id)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleQuickReject(b.id)}
                    className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
