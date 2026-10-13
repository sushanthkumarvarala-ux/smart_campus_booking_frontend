import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 text-2xl font-black text-white">
          <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30">
            <CalendarDays className="w-6 h-6 text-white" />
          </div>
          <span>SmartCampus<span className="text-indigo-400">Booking</span></span>
        </Link>
        <p className="mt-2 text-sm text-slate-400">
          Intelligent campus resource reservation & facility scheduling
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/10 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
