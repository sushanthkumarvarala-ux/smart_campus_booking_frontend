import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { format, addDays } from 'date-fns';
import { resourceService } from '../../services/resourceService';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  MapPin,
  Users,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Send,
  Lock,
} from 'lucide-react';

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();

  const [resource, setResource] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [availability, setAvailability] = useState(null);
  const [loadingResource, setLoadingResource] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      bookingDate: format(new Date(), 'yyyy-MM-dd'),
      startTime: '',
      endTime: '',
      purpose: '',
    },
  });

  useEffect(() => {
    fetchResource();
  }, [id]);

  useEffect(() => {
    if (id && selectedDate) {
      fetchAvailability(selectedDate);
      setValue('bookingDate', selectedDate);
    }
  }, [id, selectedDate]);

  const fetchResource = async () => {
    setLoadingResource(true);
    try {
      const data = await resourceService.getResourceById(id);
      setResource(data);
    } catch {
      toast.error('Could not find requested facility');
      navigate('/resources');
    } finally {
      setLoadingResource(false);
    }
  };

  const fetchAvailability = async (date) => {
    setLoadingSchedule(true);
    try {
      const data = await resourceService.getResourceAvailability(id, date);
      setAvailability(data);
    } catch {
      toast.error('Failed to load schedule for selected date');
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleSlotSelect = (slot) => {
    if (!slot.available) return;
    setValue('bookingDate', selectedDate);
    setValue('startTime', slot.startTime);
    setValue('endTime', slot.endTime);
    setBookingError('');
  };

  const onSubmitBooking = async (formData) => {
    if (!isAuthenticated) {
      toast.info('Please sign in to submit a booking');
      navigate('/login', { state: { from: { pathname: `/resources/${id}` } } });
      return;
    }

    setSubmittingBooking(true);
    setBookingError('');

    try {
      const startDateTime = `${formData.bookingDate}T${formData.startTime}:00`;
      const endDateTime = `${formData.bookingDate}T${formData.endTime}:00`;

      await bookingService.createBooking({
        resourceId: Number(id),
        startTime: startDateTime,
        endTime: endDateTime,
        purpose: formData.purpose,
      });

      toast.success('Booking submitted successfully! Awaiting admin review.');
      navigate('/my-bookings');
    } catch (err) {
      setBookingError(err.message || 'Booking conflict or invalid time interval.');
      toast.error(err.message || 'Could not complete booking');
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (loadingResource) {
    return <LoadingSpinner message="Loading facility details..." />;
  }

  if (!resource) return null;

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/resources"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Facilities</span>
        </Link>
      </div>

      {/* Main Grid: Details & Schedule on Left, Booking Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Facility Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold uppercase tracking-wider">
                {resource.type.replace('_', ' ')}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Max Capacity: {resource.capacity}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {resource.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-500" />
                <span>{resource.location}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>Operating Hours: {resource.openingTime} - {resource.closingTime}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Facility Description & Features
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {resource.description || 'Fully equipped facility with high-speed campus WiFi, modern acoustics, climate control, and digital AV support.'}
              </p>
            </div>
          </div>

          {/* Day Schedule & Hourly Availability Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <span>Check Hourly Availability</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a date to view current reservations and free intervals
                </p>
              </div>

              {/* Date Input */}
              <input
                type="date"
                min={format(new Date(), 'yyyy-MM-dd')}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Quick Date Switcher (Today, Tomorrow, Day After) */}
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((offset) => {
                const target = addDays(new Date(), offset);
                const isoStr = format(target, 'yyyy-MM-dd');
                const isSelected = selectedDate === isoStr;
                return (
                  <button
                    key={offset}
                    type="button"
                    onClick={() => setSelectedDate(isoStr)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : format(target, 'EEE, MMM d')}
                  </button>
                );
              })}
            </div>

            {/* Hourly Slot Grid */}
            {loadingSchedule ? (
              <LoadingSpinner message="Calculating available slots..." size="sm" />
            ) : availability?.slots && availability.slots.length > 0 ? (
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-3">
                  <span>Hourly Intervals for {selectedDate}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Available (Click to select)
                    </span>
                    <span className="flex items-center gap-1 text-rose-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Booked
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {availability.slots.map((slot, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => handleSlotSelect(slot)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        slot.available
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 hover:bg-emerald-100 hover:border-emerald-300 cursor-pointer shadow-sm'
                          : 'bg-slate-100/80 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                      }`}
                    >
                      <div className="text-xs font-bold">
                        {slot.startTime} - {slot.endTime}
                      </div>
                      <div className="text-[10px] font-semibold mt-1 flex items-center justify-center gap-1">
                        {slot.available ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Free</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-500" />
                            <span>Reserved</span>
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No slots configured for this date.</p>
            )}
          </div>
        </div>

        {/* Right Column: Reservation Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">Submit Booking</h3>
                <p className="text-xs text-slate-500">Subject to administrator review</p>
              </div>
            </div>

            {bookingError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{bookingError}</span>
              </div>
            )}

            {!isAuthenticated ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Sign in to Reserve</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Student or faculty authentication is required to submit booking requests.
                  </p>
                </div>
                <Link
                  to="/login"
                  state={{ from: { pathname: `/resources/${id}` } }}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
                >
                  Sign In to Continue
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmitBooking)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reservation Date
                  </label>
                  <input
                    type="date"
                    min={format(new Date(), 'yyyy-MM-dd')}
                    {...register('bookingDate', { required: 'Booking date is required' })}
                    onChange={(e) => {
                      setValue('bookingDate', e.target.value);
                      setSelectedDate(e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.bookingDate && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.bookingDate.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      {...register('startTime', { required: 'Start time is required' })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.startTime && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.startTime.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      {...register('endTime', { required: 'End time is required' })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.endTime && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.endTime.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Event / Booking Purpose
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. AI project final presentation with external mentor"
                    {...register('purpose', {
                      required: 'Purpose description is required',
                      minLength: { value: 5, message: 'Please provide at least 5 characters' },
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.purpose && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.purpose.message}</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingBooking}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all"
                  >
                    {submittingBooking ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Confirm & Submit Request</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    Operating window: {resource.openingTime} - {resource.closingTime}
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetail;
