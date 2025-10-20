import { useState, useEffect, useCallback, useContext } from "react";
import api from "../api/axiosConfig";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { LuCalendar, LuArrowLeft, LuX } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import DatePicker from "react-datepicker";

import EventItem from "../components/Timeline/EventItem";
import FilterButtons from "../components/Timeline/FilterButtons";
import "react-datepicker/dist/react-datepicker.css";

export default function Timeline() {
  const { activeBaby } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigate = useNavigate();

  const loadEvents = useCallback(async () => {
    if (!activeBaby) {
      setEvents([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get(`/logs?babyId=${activeBaby._id}`, {
        params: { date: selectedDate },
      });
      setEvents(res.data || []);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setTimeout(()=>setIsLoading(false), 200);
    }
  }, [activeBaby, selectedDate]);

  const filterEvents = useCallback(() => {
    let filtered = events;

    if (activeFilter !== "all") {
      filtered = filtered.filter((event) => event.type === activeFilter);
    }

    if (selectedDate) {
      filtered = filtered.filter((event) =>
        isSameDay(
          new Date(event.timestamp || event.sleep_end || event.sleep_start),
          new Date(selectedDate)
        )
      );
    }

    setFilteredEvents(filtered);
  }, [events, activeFilter, selectedDate]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    filterEvents();
  }, [events, activeFilter, selectedDate, filterEvents]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const clearDateFilter = () => {
    setSelectedDate(null);
  };

  const groupEventsByDate = (events) => {
    const groups = {};
    events.forEach((event) => {
      const baseTime = event.timestamp || event.sleep_end || event.sleep_start;
      const dateKey = format(new Date(baseTime), "yyyy-MM-dd");
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(event);
    });
    return groups;
  };

  const getDateLabel = (dateKey) => {
    const date = new Date(dateKey);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMM d");
  };

  const groupedEvents = groupEventsByDate(filteredEvents);

  if (!activeBaby) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="clay-element bg-white p-8 rounded-lg shadow-md max-w-sm w-full">
          <p className="text-lg font-semibold text-gray-700 mb-4">
            No baby profile selected.
          </p>
          <p className="text-gray-600 mb-6">
            Please add or select a baby profile to view the activity timeline.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 relative">
      {/* Header */}
      <div className="flex items-center gap-4 relative">
        <button
          onClick={() => navigate("/")}
          className="clay-gentle bg-white/80 p-3"
        >
          <LuArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800">Activity Timeline</h2>
          <p className="text-sm text-gray-600">
            {filteredEvents.length} events
            {selectedDate &&
              ` on ${format(new Date(selectedDate), "MMM d, yyyy")}`}
          </p>
        </div>

        {/* Calendar Icon */}
        <button
          onClick={() => setShowDatePicker((prev) => !prev)}
          className="clay-gentle bg-white/80 p-3 rounded-full"
        >
          <LuCalendar size={22} color="#555" />
        </button>

        {/* React DatePicker popup */}
        {showDatePicker && (
          <div className="absolute right-0 top-14 z-50 bg-white p-3 rounded-lg shadow-lg">
            <DatePicker
              selected={selectedDate}
              onChange={handleDateSelect}
              inline
              onClickOutside={() => setShowDatePicker(false)}
              maxDate={new Date()}
            />
          </div>
        )}
      </div>

      {/* Date Filter Badge */}
      {selectedDate && (
        <div className="flex justify-center">
          <div className="clay-gentle bg-purple-200 px-4 py-2 flex items-center gap-2">
            <span className="text-sm font-medium text-purple-800">
              {format(new Date(selectedDate), "MMM d, yyyy")}
            </span>
            <button
              onClick={clearDateFilter}
              className="text-purple-600 hover:text-purple-800"
            >
              <LuX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <FilterButtons
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      {/* Timeline */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="clay-element bg-white/60 p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-300 rounded-full w-1/4"></div>
                    <div className="h-3 bg-gray-300 rounded-full w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded-full w-1/2"></div>
                  </div>
                </div>
              ))}
          </div>
        ) : Object.keys(groupedEvents).length === 0 ? (
          <div className="clay-element bg-gradient-to-br from-gray-200 to-gray-300 p-8 text-center">
            <div className="clay-gentle bg-white/60 inline-flex p-4 mb-4">
              <LuCalendar className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No events found
            </h3>
            <p className="text-gray-500">
              {selectedDate
                ? `No events on ${format(
                    new Date(selectedDate),
                    "MMM d, yyyy"
                  )}`
                : activeFilter === "all"
                ? "Start tracking your baby's activities"
                : `No ${activeFilter} events found`}
            </p>
            {selectedDate && (
              <button
                onClick={clearDateFilter}
                className="clay-button bg-purple-500 text-white px-4 py-2 mt-4 text-sm"
              >
                Show All Events
              </button>
            )}
          </div>
        ) : (
          Object.entries(groupedEvents)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .map(([dateKey, dayEvents]) => (
              <div key={dateKey} className="space-y-4">
                <div className="clay-gentle bg-white/70 px-4 py-2 inline-block">
                  <h3 className="text-sm font-semibold text-gray-700">
                    {getDateLabel(dateKey)}
                  </h3>
                </div>
                <div className="space-y-3 ml-4">
                  {dayEvents.map((event) => (
                    <EventItem key={event._id} event={event} />
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
