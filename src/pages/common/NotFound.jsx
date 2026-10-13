import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="py-24 text-center">
      <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900">404 - Page Not Found</h1>
      <p className="mt-2 text-slate-500 max-w-md mx-auto text-sm">
        The requested campus resource or management screen does not exist.
      </p>
      <Link
        to="/resources"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
      >
        <Home className="w-4 h-4" />
        Return to Facilities
      </Link>
    </div>
  );
};

export default NotFound;
