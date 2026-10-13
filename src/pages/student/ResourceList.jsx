import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resourceService } from '../../services/resourceService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Search,
  MapPin,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Building,
  GraduationCap,
  FlaskConical,
  Trophy,
  Tv,
  Cpu,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', label: 'All Resources', icon: Building },
  { id: 'SEMINAR_HALL', label: 'Seminar Halls', icon: Building },
  { id: 'CLASSROOM', label: 'Classrooms', icon: GraduationCap },
  { id: 'LAB', label: 'Laboratories', icon: FlaskConical },
  { id: 'SPORTS_FACILITY', label: 'Sports Arena', icon: Trophy },
  { id: 'PROJECTOR', label: 'Projectors', icon: Tv },
  { id: 'EQUIPMENT', label: 'Lab Equipment', icon: Cpu },
];

const ResourceList = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const toast = useToast();

  useEffect(() => {
    fetchResources();
  }, [selectedCategory]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = { active: true };
      if (selectedCategory !== 'ALL') {
        params.type = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.keyword = searchQuery.trim();
      }
      const data = await resourceService.getResources(params);
      setResources(data);
    } catch (err) {
      toast.error('Failed to load campus facilities');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const getCategoryColor = (type) => {
    switch (type) {
      case 'SEMINAR_HALL':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'LAB':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'CLASSROOM':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SPORTS_FACILITY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PROJECTOR':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'EQUIPMENT':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="gradient-header rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 mb-4 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Campus Resource System</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Reserve Campus Facilities with Zero Conflicts
          </h1>
          <p className="mt-3 text-sm sm:text-base text-indigo-100">
            Explore state-of-the-art auditoriums, computing labs, sports venues, and media equipment. Check live availability and book in seconds.
          </p>

          {/* Search Bar inside Hero */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by facility name, building, or room..."
                className="w-full pl-10 pr-4 py-3 bg-white text-slate-800 placeholder-slate-400 rounded-xl text-sm focus:outline-none shadow-md"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-xl text-sm transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <span>Search</span>
            </button>
          </form>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Facilities Grid */}
      {loading ? (
        <LoadingSpinner message="Loading campus facilities..." />
      ) : resources.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Facilities Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or selecting a different category tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getCategoryColor(
                      item.type
                    )}`}
                  >
                    {item.type.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.capacity} {item.capacity === 1 ? 'Unit' : 'Cap'}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {item.name}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{item.location}</span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed flex-1">
                  {item.description || 'Modern facility equipped with standard campus amenities and network connectivity.'}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Hours: {item.openingTime} - {item.closingTime}</span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100">
                <Link
                  to={`/resources/${item.id}`}
                  className="w-full py-2.5 px-4 bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-200 hover:border-indigo-600 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <span>Check Schedule & Book</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceList;
