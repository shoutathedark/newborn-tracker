import { LuClock2, LuMoon, LuBaby, LuMilk } from "react-icons/lu";
import { format } from 'date-fns';

const eventIcons = {
  feeding: LuMilk,
  sleeping: LuMoon,
  diaper: LuBaby
};

const eventColors = {
  feeding: 'from-blue-200 to-blue-300',
  sleeping: 'from-purple-200 to-purple-300',
  diaper: 'from-green-200 to-green-300'
};

const eventIconColors = {
  feeding: 'text-blue-700',
  sleeping: 'text-purple-700',
  diaper: 'text-green-700'
};

export default function RecentEvents({ events, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="clay-element bg-white/70 p-4">
            <div className="animate-pulse flex gap-3">
              <div className="w-12 h-12 bg-gray-300 rounded-2xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded-full w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded-full w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="clay-element bg-white/70 p-6 text-center">
        <div className="clay-gentle bg-gray-200 inline-flex p-4 mb-3">
          <LuClock2 className="w-6 h-6 text-gray-500" />
        </div>
        <p className="text-gray-600">No recent activities</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const Icon = eventIcons[event.type];
        const eventTime = format(new Date(event.timestamp), 'h:mm a');
        const sleepStart = event.sleep_start ? format(new Date(event.sleep_start), 'h:mm a') : null;
        const sleepEnd = event.sleep_end ? format(new Date(event.sleep_end), 'h:mm a') : null;

        
        return (
          <div 
            key={event._id} 
            className={`clay-element bg-gradient-to-r ${eventColors[event.type]} p-4`}
          >
            <div className="flex items-center gap-3">
              <div className="clay-gentle bg-white/70 p-3">
                <Icon className={`w-5 h-5 ${eventIconColors[event.type]}`} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 capitalize">
                  {event.type}
                  {event.type === 'feeding' && event.feeding_type && 
                    ` - ${event.feeding_type.replace('_', ' ')}`}
                </p>
                <p className="text-sm text-gray-700">
                  {event.type === 'sleeping'
                  ? `${sleepStart || '-'} → ${sleepEnd || '-'}`
                  : eventTime}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
