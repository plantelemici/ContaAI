import React from 'react';
import { Calendar, X } from 'lucide-react';

interface DateFilterProps {
  selectedMonth: string;
  selectedYear: string;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
  onClear: () => void;
  showClear?: boolean;
}

export const DateFilter: React.FC<DateFilterProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  onClear,
  showClear = true
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  
  const months = [
    { value: '', label: 'Toate lunile' },
    { value: '01', label: 'Ianuarie' },
    { value: '02', label: 'Februarie' },
    { value: '03', label: 'Martie' },
    { value: '04', label: 'Aprilie' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Iunie' },
    { value: '07', label: 'Iulie' },
    { value: '08', label: 'August' },
    { value: '09', label: 'Septembrie' },
    { value: '10', label: 'Octombrie' },
    { value: '11', label: 'Noiembrie' },
    { value: '12', label: 'Decembrie' }
  ];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-400" />
        <span className="text-gray-400 text-sm font-medium">Perioada:</span>
      </div>
      
      <select
        value={selectedMonth}
        onChange={(e) => onMonthChange(e.target.value)}
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
      >
        {months.map(month => (
          <option key={month.value} value={month.value} className="bg-gray-800">
            {month.label}
          </option>
        ))}
      </select>

      <select
        value={selectedYear}
        onChange={(e) => onYearChange(e.target.value)}
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[100px]"
      >
        <option value="" className="bg-gray-800">Toate anii</option>
        {years.map(year => (
          <option key={year} value={year.toString()} className="bg-gray-800">
            {year}
          </option>
        ))}
      </select>

      {showClear && (selectedMonth || selectedYear) && (
        <button
          onClick={onClear}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Șterge filtrul de dată"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  );
};