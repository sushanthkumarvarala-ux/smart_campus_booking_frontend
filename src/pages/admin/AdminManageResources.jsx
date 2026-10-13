import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { resourceService } from '../../services/resourceService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Building,
  MapPin,
  Users,
  Clock,
  X,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

const RESOURCE_TYPES = [
  'SEMINAR_HALL',
  'CLASSROOM',
  'LAB',
  'SPORTS_FACILITY',
  'PROJECTOR',
  'EQUIPMENT',
];

const AdminManageResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      // pass null active so admins see both active and inactive facilities
      const data = await resourceService.getAdminResources({
        keyword: keyword.trim() || undefined,
      });
      setResources(data);
    } catch {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingResource(null);
    reset({
      name: '',
      type: 'SEMINAR_HALL',
      location: '',
      capacity: 30,
      description: '',
      openingTime: '08:00',
      closingTime: '20:00',
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (resource) => {
    setEditingResource(resource);
    reset({
      name: resource.name,
      type: resource.type,
      location: resource.location,
      capacity: resource.capacity,
      description: resource.description || '',
      openingTime: resource.openingTime,
      closingTime: resource.closingTime,
      active: resource.active,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingResource(null);
    reset();
  };

  const onSubmitResource = async (formData) => {
    setModalLoading(true);
    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        active: Boolean(formData.active),
      };

      if (editingResource) {
        await resourceService.updateResource(editingResource.id, payload);
        toast.success(`Resource '${payload.name}' updated successfully`);
      } else {
        await resourceService.createResource(payload);
        toast.success(`New resource '${payload.name}' created successfully`);
      }

      handleCloseModal();
      fetchResources();
    } catch (err) {
      toast.error(err.message || 'Failed to save resource');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteResource = async (resource) => {
    if (!window.confirm(`Are you sure you want to deactivate or remove '${resource.name}'?`)) {
      return;
    }

    try {
      await resourceService.deleteResource(resource.id);
      toast.success(`Resource '${resource.name}' removed or marked inactive`);
      fetchResources();
    } catch (err) {
      toast.error(err.message || 'Could not delete resource');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Facilities Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure seminar halls, classrooms, laboratories, and operating hours
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-200 transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Resource</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchResources()}
          placeholder="Filter resources by name, location, or room..."
          className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        <button
          onClick={fetchResources}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
        >
          Filter
        </button>
      </div>

      {/* Resources Table */}
      {loading ? (
        <LoadingSpinner message="Loading facilities list..." />
      ) : resources.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
          No campus resources found. Click "Add New Resource" to provision facilities.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Facility Name</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Location</th>
                  <th className="py-3.5 px-6">Capacity</th>
                  <th className="py-3.5 px-6">Operating Window</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resources.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400">ID: #{item.id}</div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {item.type.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {item.location}
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {item.capacity}
                    </td>

                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {item.openingTime} - {item.closingTime}
                    </td>

                    <td className="py-4 px-6">
                      {item.active ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-semibold text-xs">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Resource"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteResource(item)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Deactivate / Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Resource Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingResource ? 'Edit Facility Details' : 'Create New Campus Resource'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitResource)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resource Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Newton Seminar Hall B"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.name && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Resource Type
                  </label>
                  <select
                    {...register('type', { required: 'Type is required' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {RESOURCE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    {...register('capacity', {
                      required: 'Capacity is required',
                      min: { value: 1, message: 'Must be at least 1' },
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.capacity && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.capacity.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location (Building & Room)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Engineering Block 1, Floor 2"
                  {...register('location', { required: 'Location is required' })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.location && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.location.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Opening Time (Daily)
                  </label>
                  <input
                    type="time"
                    {...register('openingTime', { required: 'Opening time is required' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Closing Time (Daily)
                  </label>
                  <input
                    type="time"
                    {...register('closingTime', { required: 'Closing time is required' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description & Equipment Details
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Equipped with 4K laser projector, audio mixers, and podium."
                  {...register('description')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheckbox"
                  {...register('active')}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="activeCheckbox" className="text-xs font-medium text-slate-700">
                  Facility is Active & Open for Bookings
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={modalLoading}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                >
                  {modalLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{editingResource ? 'Save Changes' : 'Create Facility'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManageResources;
