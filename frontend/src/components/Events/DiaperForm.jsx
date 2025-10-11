import { useState } from 'react';
import { LuDroplets, LuToilet } from "react-icons/lu";

const diaperTypes = [
  { value: 'pee', label: 'Pee', icon: LuDroplets, color: 'text-blue-600' },
  { value: 'poop', label: 'Poop', icon: LuToilet, color: 'text-orange-600' },
  { value: 'mixed', label: 'Both', icon: LuToilet, color: 'text-red-600' }
];

const consistencies = [
  { value: 'soft', label: 'Soft' },
  { value: 'firm', label: 'Firm' },
  { value: 'runny', label: 'Runny' },
  { value: 'watery', label: 'Watery' }
];

export default function DiaperForm({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    type: 'diaper',
    diaper_type: 'pee',
    consistency:'',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      diaper: {
        type: formData.diaper_type,
        ...(formData.diaper_type === 'poop' || formData.diaper_type === 'mixed'
            ? { consistency: formData.consistency }
            : {})
      },
      notes: formData.notes,
      type: formData.type
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Diaper Type */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-800">Type</label>
        <div className="grid grid-cols-2 gap-2">
          {diaperTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData(prev => ({
                    ...prev,
                    diaper_type: type.value,
                    consistency: type.value === 'poop' || type.value === 'mixed'
                      ? prev.consistency
                      : ''}))}
              className={`clay-gentle w-full p-4 text-left transition-all flex items-center gap-2 ${
                formData.diaper_type === type.value
                  ? 'bg-green-100 border-green-300 border-2'
                  : 'bg-white/80 border-transparent border-2'}
                  ${type.value === 'mixed' ? 'col-span-2 justify-center' : ''}                
                `}
            >
                <type.icon className={`w-5 h-5 ${type.color}`} />
                <span className="font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

    {/*Consistency*/}
    {(formData.diaper_type === 'poop' || formData.diaper_type === 'mixed') && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-800">Consistency</label>
          <div className="grid grid-cols-2 gap-3">
            {consistencies.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, consistency: c.value }))
                }
                className={`clay-gentle p-4 text-center transition-all
                  ${formData.consistency === c.value
                    ? 'bg-green-100 border-green-300 border-2'
                    : 'bg-white/80 border-transparent border-2'}
                `}
              >
                <span className="font-medium">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}


      {/* Notes */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-800">Notes (optional)</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Notes"
          rows={3}
          className="clay-element-inset w-full p-4 bg-white border-none outline-none text-gray-800 resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="clay-button w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-4 font-semibold disabled:opacity-70"
      >
        {isSubmitting ? 'Logging...' : 'Log Diaper Change'}
      </button>
    </form>
  );
}