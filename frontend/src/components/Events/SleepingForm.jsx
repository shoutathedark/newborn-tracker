import { useState } from 'react';
import { LuClock } from "react-icons/lu";
import { format, formatInTimeZone } from 'date-fns-tz';

export default function SleepForm({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    type: 'sleeping',
    sleep_start: '',
    sleep_end: format(new Date(), "yyyy-MM-dd HH:mm", { timeZone: "Asia/Singapore" }),
    timestamp: '',
    notes: ''
  });

  const toUTC = (localDateTimeStr) => {
    // Accepts "YYYY-MM-DDTHH:mm" or "YYYY-MM-DD HH:mm"
    const m = localDateTimeStr.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})$/);
    if (!m) throw new Error('Invalid datetime format: ' + localDateTimeStr);

    const [, y, mo, d, h, min] = m.map(Number);
    // Construct milliseconds since epoch for the *local SGT time*, then convert to UTC by subtracting 8 hours.
    // Use Date.UTC to avoid environment-local parsing differences.
    const msForSgtLocal = Date.UTC(y, mo - 1, d, h, min, 0, 0); // this gives the UTC ms for the same Y/M/D/H/MIN values
    // Because Date.UTC treats those fields as UTC, we need to subtract 8 hours to get the true UTC moment
    const msUtc = msForSgtLocal - 8 * 60 * 60 * 1000;
    return new Date(msUtc).toISOString(); // e.g. "2025-10-24T23:33:00.000Z"
  };

  const handleSubmit = (e) => {
    const payload = {
    ...formData,
    sleep_start: toUTC(formData.sleep_start),
    sleep_end: toUTC(formData.sleep_end),
    timestamp: toUTC(formData.sleep_start)
  };
    e.preventDefault();
    onSubmit(payload);
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