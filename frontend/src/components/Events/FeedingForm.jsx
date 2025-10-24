import { useState } from 'react';
import { LuMilk, LuCircleDot, LuTablets } from "react-icons/lu";
import { format, fromZonedTime } from 'date-fns-tz';

const feedingTypes = [
  { value: 'bottle', label: 'Bottle', icon: LuMilk }, 
  { value: 'breastfeeding_left', label: 'Left Breast', icon: LuCircleDot },
  { value: 'breastfeeding_right', label: 'Right Breast', icon: LuCircleDot },
  { value: 'breastfeeding_both', label: 'Both Breasts', icon: LuTablets }
];

export default function FeedingForm({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    type: 'feeding',
    subtype: 'bottle',
    timestamp: format(new Date(), "yyyy-MM-dd HH:mm:ss", { timeZone: "Asia/Singapore" }),
    amount: '',
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
    const submitData = { ...formData, timestamp: toUTCISOString(formData.timestamp)};
    if (submitData.amount) {
      submitData.amount = parseFloat(submitData.amount);
    }
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Feeding Type */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-800">Type</label>
        <div className="grid grid-cols-2 gap-2">
          {feedingTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, subtype: type.value }))}
              className={`clay-gentle p-4 text-left transition-all ${
                formData.subtype === type.value
                  ? 'bg-blue-100 border-blue-300 border-2'
                  : 'bg-white/100 border-transparent border-2'
              }`}
            >
              <div className="flex items-center gap-2">
                <type.icon className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">{type.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      {formData.subtype === 'bottle' && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-800">Amount (ml)</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            placeholder="60"
            className="clay-element-inset w-full p-4 bg-white border-none outline-none text-gray-800"
          />
        </div>
      )}
      {/* Timestamp */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-800">Feed Time</label>
          <input
            type="datetime-local"
            value={formData.timestamp}
            onChange={(e) => setFormData(prev => ({ ...prev, timestamp: e.target.value }))}
            required
            className="clay-element-inset w-full p-4 bg-white border-none outline-none text-gray-800"
          />
        </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-800">Notes (optional)</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Any additional notes..."
          rows={3}
          className="clay-element-inset w-full p-4 bg-white border-none outline-none text-gray-800 resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="clay-button w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 font-semibold disabled:opacity-70"
      >
        {isSubmitting ? 'Logging...' : 'Log Feeding'}
      </button>
    </form>
  );
}
