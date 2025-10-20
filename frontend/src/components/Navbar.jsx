import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import { LuHouse, LuPlus, LuClock, LuSettings } from "react-icons/lu";


const Navbar = () => {
  const location = useLocation();
  const { activeBaby } = useContext(AuthContext);

  const navigationItems = [
  { title: "Dashboard", url: "/", icon: LuHouse },
  { title: "Add Event", url: `/AddEvent/${activeBaby?._id}`, icon: LuPlus },
  { title: "Timeline", url: `/timeline`, icon: LuClock },
  { title: "Settings", url: "/settings", icon: LuSettings },
  ];

  return (
    <nav className = "fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className = "clay-element bg-white/90 backdrop-blur-sm max-w-md mx-auto h-16 md:h-20 rounded-2xl shadow-lg">
        <div className = "nav-items-container h-full">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.title}
                to={item.url}
                className="flex flex-col items-center justify-center flex-1"
              >
                <item.icon className={`w-6 h-6 md:w-7 md:h-7 mb-1 transition-colors duration-200 ${
                    isActive ? 'text-purple-600' : 'text-gray-500'
                  }`}
                />
                <span className={`text-[10px] md:text-xs font-medium ${
                  isActive ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                  {item.title}
                </span>
              </Link>
            );
          })}
      </div>
    </div>
  </nav>
  );
};

export default Navbar;