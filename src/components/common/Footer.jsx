import React from 'react';
import { CalendarDays, Shield, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
            <CalendarDays className="w-4 h-4 text-indigo-600" />
            <span>Smart Campus Resource Booking & Management System</span>
          </div>

          <p className="text-xs text-slate-500">
            Engineered with Spring Boot 3.3, Java 21, MySQL 8, React 18, and Tailwind CSS.
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Role-Based JWT Security
            </span>
            <span>•</span>
            <span>Concurrent Conflict Prevention</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
