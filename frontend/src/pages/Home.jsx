import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import StatsCard from "../components/Statscard"
import RecentEvents from "../components/Home/RecentEvents";
import { AuthContext } from "../context/AuthProvider";
import { LuCalendarMinus2, LuMoon, LuBaby } from "react-icons/lu";
import { TbMilk } from "react-icons/tb";

const Home = () => {
  const [babies, setBabies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBaby , setActiveBaby] = useState([]);
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBabies = async () => {
      try {
        const res = await api.get("/babies");
        setBabies(res.data);
        setIsLoading(false);
        if(res.data.length > 0){
          setActiveBaby(res.data[0]);  
        }

      } catch (err) {
        console.error("Failed to fetch babies:", err);
      }
    };

    if (user) fetchBabies();
  }, [user]);

/*  useEffect(() => {
    const fetchBabyData = async () => {
      if (!activeBaby) return;

      try {
        const [eventsRes, summaryRes] = await Promise.all([
          api.get(`/babies/${activeBaby._id}/events?today=true`), // e.g. /events?today=true
          api.get(`/babies/${activeBaby._id}/summary?today=true`), // e.g. /summary?today=true
        ]);

        setEvents(eventsRes.data);
        setSummary(summaryRes.data);
      } catch (err) {
        console.error("Failed to fetch baby data:", err);
      }
    };

    fetchBabyData();
  }, [activeBaby]); */

  const calculateBabyAge = () => {
  if (!activeBaby) return "";
  const dob = new Date(activeBaby.dob);
  const today = new Date();

  if (today < dob) return "Not born yet";

  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  // Adjust days if negative
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += prevMonth;
  }

  // Adjust months if negative
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  let ageParts = [];
  if (years > 0) ageParts.push(`${years} year${years > 1 ? "s" : ""}`);
  if (months > 0) ageParts.push(`${months} month${months > 1 ? "s" : ""}`);
  if (days > 0) ageParts.push(`${days} day${days > 1 ? "s" : ""}`);

  return ageParts.length > 0 ? ageParts.join(" ") + " old" : "0 days old";
};

  const handleBabyChange = (e) => {
    const selectedId = e.target.value;
    const selectedBaby = babies.find((b) => b._id === selectedId);
    setActiveBaby(selectedBaby);
  };


  return (
    /*Welcome section, Missing baby switcher*/
    <div className = "space-y-6 py-4">
      <div className = "clay-element bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 p-6">
      <div className="flex justify-center">
        {babies.length > 1 ?(
          <select 
            onChange={(e) => {handleBabyChange}} 
            value={activeBaby.id}
            className="clay-gentle text-2xl font-bold text-gray-800 bg-transparent border-none outline-none appearance-none text-center p-2"
        >
          {babies.map(baby => (
            <option key={baby.id} value={baby.id}>{baby.name}</option>
          ))}
          </select>
      ) : (
          <h3 className="text-2xl font-bold text-gray-800">{activeBaby.name}</h3>
      )}
    </div>
        <div className="text-center mt-4">
          <h2 className="text-sm font-medium text-gray-700">Welcome back, {user?.name}!</h2>
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <LuCalendarMinus2 className="w-4 h-4"/>
              <p className="text-sm">Born {new Date(activeBaby.dob).toLocaleDateString()}</p>
            </div>
            <p className="text-lg font-semibold text-purple-700">{calculateBabyAge()}</p>
          </div>
        </div>
      </div>

      {/* Today's Stats, Missing function to calculate stats and feed */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 px-2">Today's Summary</h3>
        <div className="grid grid-cols-3 gap-3">
          <StatsCard icon={TbMilk} label="Feedings" value='' color="from-blue-200 to-blue-300" iconColor="text-blue-600" />
          <StatsCard icon={LuMoon} label="Sleep" value='' color="from-purple-200 to-purple-300" iconColor="text-purple-600" />
          <StatsCard icon={LuBaby} label="Diapers" value='' color="from-mint-200 to-green-300" iconColor="text-green-600" />
        </div>
      </div>


      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
          {/*Insert Link to View All Logs*/}
        </div>
        <RecentEvents events={events.slice(0, 5)} isLoading={isLoading} />
      </div>
      {/*<h3>Your Babies</h3>
      {babies.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {babies.map((baby) => (
            <li
              key={baby._id}
              style={{
                marginBottom: "0.5rem",
                padding: "0.75rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/logs/${baby._id}`)}
            >
              <strong>{baby.name}</strong> — {baby.gender} —{" "}
              {new Date(baby.dob).toLocaleDateString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No babies found</p>
      )}
*/}
    </div>
  );
};

export default Home;
