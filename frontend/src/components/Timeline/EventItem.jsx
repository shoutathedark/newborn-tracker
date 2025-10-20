import { LuMilk, LuBaby, LuClock, LuMoonStar, LuStar, LuDroplets } from "react-icons/lu";
import { format } from 'date-fns-tz';

const eventIcons = {
  feeding: LuMilk,
  sleeping: LuMoonStar,
  diaper: LuBaby
};

const eventColors = {
  feeding: 'from-blue-100 to-blue-200',
  sleeping: 'from-purple-100 to-purple-200',
  diaper: 'from-green-100 to-green-200'
};

const eventIconColors = {
  feeding: 'text-blue-600',
  sleeping: 'text-purple-600',
  diaper: 'text-green-600'
};

export default function EventItem({ event }) {
  const Icon = eventIcons[event.type];
  const eventTime = format(new Date(event.timestamp), 'h:mm a');

  const renderDetails = () => {
    switch (event.type) {
      case 'feeding':
        return (
          <div className="space-y-1">
            {event.amount && (
              <p className="text-sm text-gray-600">{event.amount}ml</p>
            )}
          </div>
        );
      case 'sleeping':
        if (event.sleep_start && event.sleep_end) {
          const duration = ((new Date(event.sleep_end) - new Date(event.sleep_start)) / (1000 * 60 * 60)).toFixed(1);
          return (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <LuClock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{duration}h</span>
              </div>
            </div>
          );
        }
        return null;
      case 'diaper':
        return (
          <div className="flex items-center gap-1">
            <LuDroplets className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 capitalize">{event.diaper_type}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`clay-element bg-gradient-to-r ${eventColors[event.type]} p-4`}>
      <div className="flex gap-3">
        <div className="clay-gentle bg-white/60 p-2">
          <Icon className={`w-5 h-5 ${eventIconColors[event.type]}`} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-800 capitalize">{event.type}</h4>
            <span className="text-sm text-gray-600">{eventTime}</span>
          </div>
          {renderDetails()}
          {event.notes && (
            <p className="text-sm text-gray-600 mt-2 italic">{event.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}
