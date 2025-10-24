import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthProvider";
import { LuMoon, LuBaby ,LuArrowLeft } from "react-icons/lu";
import { TbMilk } from "react-icons/tb";
import FeedingForm from "../components/Events/FeedingForm";
import SleepForm from "../components/Events/SleepingForm";
import DiaperForm from "../components/Events/DiaperForm";

const Logs = () => {
  const { activeBaby } = useContext(AuthContext);
  const [selectedType, setSelectedType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventTypes = [
  { type: 'feeding', icon: TbMilk, label: 'Feeding', color: 'from-blue-200 to-blue-300', iconColor: 'text-blue-600' },
  { type: 'sleeping', icon: LuMoon, label: 'Sleep', color: 'from-purple-200 to-purple-300', iconColor: 'text-purple-600' },
  { type: 'diaper', icon: LuBaby, label: 'Diaper', color: 'from-green-200 to-green-300', iconColor: 'text-green-600' }
];

  const navigate = useNavigate();

  const handleAddEvent = async (formData) => {
    const { type, subtype, amount, sleep_start, sleep_end, diaper, notes, timestamp } = formData;

    const errors = [];
    if (!type) errors.push("Event type is required");

    if (type === "feeding" && !amount && subtype ==='bottle') errors.push("Amount is required for feeding");
    if (type === "diaper") {
      if (!diaper?.type) errors.push("Diaper type is required");
      if (!diaper?.consistency &&(diaper?.type ==='poop' || diaper?.type === 'mixed')) errors.push("Diaper consistency is required");
    }

    if (errors.length > 0) {
      toast.error(errors[0])
      return;
    }

    let payload = { sleep_start, sleep_end, subtype, type, notes, timestamp: timestamp };
    console.log(payload.sleep_start);

    if (type === "feeding") {
      payload.amount = Number(amount);
    } else if (type === "diaper") {
      payload.diaper = {
        type: diaper?.type,
        consistency: diaper?.consistency,
      };
    }
    setIsSubmitting(true);

    try {
      const res = await api.post(`/logs?babyId=${activeBaby._id}`, payload);
      toast.success("Event logged!")
      navigate("/");
    } catch (err) {
      console.error("Failed to add event:", err);
      toast.error("Error adding event.")
    }
    finally{
      setIsSubmitting(false);
    }
  };

    const handleBack = () => {
    if (selectedType) {
      setSelectedType(null);
    } else {
      navigate("/");
    }
  };

  return (
    
    
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="clay-gentle bg-white/80 p-3"
        >
          <LuArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {selectedType ? `Log ${eventTypes.find(t => t.type === selectedType)?.label}` : 'Add New Event'}
          </h2>
          <p className="text-sm text-gray-600">
            {selectedType ? `For ${activeBaby.name}` : 'What would you like to track?'} {/* Modified line */}
          </p>
        </div>
      </div>

      {!selectedType ? (
        /* Event Type Selection */
        <div className="space-y-4">
          {eventTypes.map((eventType) => (
            <button
              key={eventType.type}
              onClick={() => setSelectedType(eventType.type)}
              className={`clay-element w-full bg-gradient-to-r ${eventType.color} p-6 text-left transition-all duration-200 hover:scale-[1.02]`}
            >
              <div className="flex items-center gap-4">
                <div className="clay-gentle bg-white/60 p-4">
                  <eventType.icon className={`w-8 h-8 ${eventType.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{eventType.label}</h3>
                  <p className="text-sm text-gray-600">
                    {eventType.type === 'feeding' && 'Track bottle or breastfeeding'}
                    {eventType.type === 'sleeping' && 'Log sleep duration and quality'}
                    {eventType.type === 'diaper' && 'Record diaper changes'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Event Form */
        <div>
          {selectedType === 'feeding' && (
            <FeedingForm onSubmit={handleAddEvent} isSubmitting={isSubmitting} />
          )}
          {selectedType === 'sleeping' &&(
            <SleepForm onSubmit={handleAddEvent} isSubmitting={isSubmitting}></SleepForm>
          )}
          {selectedType === 'diaper' &&(
            <DiaperForm onSubmit={handleAddEvent} isSubmitting={isSubmitting}></DiaperForm>
          )}
          
        </div>
      )}
    </div>
  );
};

export default Logs;
