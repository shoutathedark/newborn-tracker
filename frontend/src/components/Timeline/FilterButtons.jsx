import { LuMilk, LuBaby, LuMoonStar, LuGrid3X3 } from "react-icons/lu";

const filters = [
  { value: 'all', label: 'All', icon: LuGrid3X3 },
  { value: 'feeding', label: 'Feeding', icon: LuMilk },
  { value: 'sleeping', label: 'Sleep', icon: LuMoonStar },
  { value: 'diaper', label: 'Diaper', icon: LuBaby }
];

export default function FilterButtons({ activeFilter, setActiveFilter }) {
  return (
    <div className="clay-element bg-white/80 p-2">
      <div className="grid grid-cols-4 gap-1">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`clay-gentle p-3 transition-all ${
              activeFilter === filter.value
                ? 'bg-purple-100 border-purple-300 border-2'
                : 'bg-white/60 border-transparent border-2'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <filter.icon className={`w-4 h-4 ${
                activeFilter === filter.value ? 'text-purple-600' : 'text-gray-600'
              }`} />
              <span className={`text-xs font-medium ${
                activeFilter === filter.value ? 'text-purple-600' : 'text-gray-600'
              }`}>
                {filter.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
