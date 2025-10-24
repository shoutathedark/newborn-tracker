import { useState } from 'react';
import { LuClock } from "react-icons/lu";
import { format, fromZonedTime } from 'date-fns-tz';

export default function SleepForm({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    type: 'sleeping',
    sleep_start: '',
    sleep_end: format(new Date(), "yyyy-MM-dd HH:mm", { timeZone: "Asia/Singapore" }),
    timestamp: '',
    notes: ''
  });

  const toUTCISOString = (localString) => {
    if (!localString) return null;

    const parsed = parse(localString, "yyyy-MM-dd HH:mm", new Date());
    const utcDate = fromZonedTime(parsed, "Asia/Singapore");
    return utcDate.toISOString(); 
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {...formData,
      sleep_start: toUTCISOString(formData.sleep_start),
      sleep_end: toUTCISOString(formData.sleep_end),
      timestamp: toUTCISOString(formData.timestamp)
    }
    onSubmit(submitData);
  };

  const calculateDuration = () => {
    if (formData.sleep_start && formData.sleep_end) {
      const start = new Date(formData.sleep_start);
      const end = new Date(formData.sleep_end);
      const diffMs = end - start;
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours > 0) {
        return `${diffHours.toFixed(1)} hours`;
      }
    }
    return '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sleep Times */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-800">Sleep Start</label>
          <input
            type="datetime-local"
            value={formData.sleep_start}
            onChange={(e) => setFormData(prev => ({ ...prev, sleep_start: e.target.value, timestamp: e.target.value }))}
            required
            className="clay-element-inset w-full p-4 bg-white border-none outline-none text-gray-800"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-800">Sleep End</label>
          <input
            type="datetime-local"
            value={formData.sleep_end}
            onChange={(e) => setFormData(prev => ({ ...prev, sleep_end: e.target.value }))}
            required
            className="clay-element-inset w-full p-4 bg-white border-none outline-none text-gray-800"
          />
        </div>

        {/* Duration Display */}
        {calculateDuration() && (
          <div className="clay-gentle bg-purple-100 p-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <LuClock className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">
                Duration: {calculateDuration()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-800">Notes (optional)</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="How was the sleep?"
          rows={3}
          className="clay-element-inset w-full p-4 bg-white border-none outline-none text-gray-800 resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="clay-button w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 font-semibold disabled:opacity-70"
      >
        {isSubmitting ? 'Logging...' : 'Log Sleep'}
      </button>
    </form>
  );
}