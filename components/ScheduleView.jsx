'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Calendar, UserCheck, Plus, Lock } from 'lucide-react';

export default function ScheduleView() {
  const [activeWeeks, setActiveWeeks] = useState([]);
  const [selectedActiveWeek, setSelectedActiveWeek] = useState(null);
  const [activeLessons, setActiveLessons] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [isEditUnlocked, setIsEditUnlocked] = useState(false);

  // Dynamic Header Height Measurement for Sticky Banner Offset Calibration
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const daysList = [
    { label: 'M', fullDay: 'Monday' },
    { label: 'Tu', fullDay: 'Tuesday' },
    { label: 'W', fullDay: 'Wednesday' },
    { label: 'Th', fullDay: 'Thursday' },
    { label: 'Fr', fullDay: 'Friday' },
    { label: 'Sa', fullDay: 'Saturday' },
    { label: 'Su', fullDay: 'Sunday' },
  ];

  useEffect(() => {
    fetchActiveWeeks();
  }, []);

  // Calculate top controls height dynamically and update offset on resize
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, [activeWeeks, selectedActiveWeek]);

  async function fetchActiveWeeks() {
    const { data } = await supabase
      .from('active_weeks')
      .select('*')
      .eq('is_archived', false)
      .order('week_start_date', { ascending: true })
      .limit(4);

    if (data && data.length > 0) {
      setActiveWeeks(data);
      setSelectedActiveWeek(data[0]);
      fetchActiveLessons(data[0].id);
    }
  }

  async function fetchActiveLessons(weekId) {
    const { data } = await supabase
      .from('active_lessons')
      .select('*, bookings(*)')
      .eq('active_week_id', weekId)
      .order('lesson_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (data) setActiveLessons(data);
  }

  async function handleUnlockEditMode() {
    const inputPasscode = prompt('Enter Community Passcode to unlock slot booking:');
    if (!inputPasscode) return;

    const { data } = await supabase.rpc('verify_community_passcode', { passcode_input: inputPasscode.trim() });
    if (data === true) {
      setIsEditUnlocked(true);
      alert('Edit Mode unlocked! You can now assign open slots.');
    } else {
      alert('Incorrect passcode.');
    }
  }

  async function handlePublicBooking(lessonId, slotIndex) {
    if (!isEditUnlocked) {
      const inputPasscode = prompt('Enter Community Passcode to book this slot:');
      if (!inputPasscode) return;

      const { data } = await supabase.rpc('verify_community_passcode', { passcode_input: inputPasscode.trim() });
      if (data !== true) {
        alert('Incorrect passcode.');
        return;
      }
      setIsEditUnlocked(true);
    }

    const name = prompt('Enter rider Name & Last Initial (e.g., Sofie H.):');
    if (!name || !name.trim()) return;

    const { error } = await supabase.from('bookings').insert([{
      active_lesson_id: lessonId,
      slot_index: slotIndex,
      client_name: name.trim(),
      is_regular: false
    }]);

    if (!error) {
      fetchActiveLessons(selectedActiveWeek.id);
    } else {
      alert('Error saving booking.');
    }
  }

  function formatTime12Hr(timeString) {
    if (!timeString) return '';
    const [hoursStr, minutesStr] = timeString.split(':');
    let hours = parseInt(hoursStr, 10);
    const suffix = hours >= 12 ? 'p' : 'a';
    hours = hours % 12 || 12;
    return `${hours}:${minutesStr}${suffix}`;
  }

  function scrollToDay(dayName) {
    setSelectedDay(dayName);
    const targetElement = document.getElementById(`schedule-day-section-${dayName.toLowerCase()}`);
    if (targetElement) {
      const mobileOffset = 52;
      const yOffset = -(headerHeight + mobileOffset + 10);
      const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  const activeDaysSet = new Set(
    activeLessons.map((lesson) => {
      const d = new Date(lesson.lesson_date + 'T00:00:00');
      return d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    })
  );

  const groupedActiveLessons = activeLessons.reduce((acc, lesson) => {
    if (!acc[lesson.lesson_date]) acc[lesson.lesson_date] = [];
    acc[lesson.lesson_date].push(lesson);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto p-3 md:p-6 space-y-4">
      {/* STICKY HEADER CONTROLS (Accounts for mobile site header top-[52px]) */}
      <div
        ref={headerRef}
        className="sticky top-[52px] md:top-0 z-30 bg-white/95 backdrop-blur-xs pt-2 pb-2 border-b border-zinc-200 shadow-xs space-y-2"
      >
        {/* Title & Edit Mode Unlock Bar */}
        <div className="flex justify-between items-center bg-black text-white p-3.5 rounded-lg shadow-md">
          <div>
            <h1
              className="text-base font-bold text-[#e8b4b8]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Training & Lesson Schedule
            </h1>
            <p className="text-[10px] text-amber-500 uppercase tracking-widest">
              Cherry Blossom Equestrian
            </p>
          </div>

          <button
            onClick={handleUnlockEditMode}
            className={`text-xs px-2.5 py-1 rounded flex items-center gap-1 font-medium transition ${
              isEditUnlocked
                ? 'bg-amber-600 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {isEditUnlocked ? <UserCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {isEditUnlocked ? 'Edit Unlocked' : 'Unlock Edit'}
          </button>
        </div>

        {/* Active Week Selector Tabs */}
        <div className="grid grid-cols-4 gap-1.5 bg-zinc-100 p-1 rounded-lg text-center">
          {activeWeeks.map((week) => {
            const dateObj = new Date(week.week_start_date + 'T00:00:00');
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', timeZone: 'UTC' });
            const isSelected = selectedActiveWeek?.id === week.id;

            return (
              <button
                key={week.id}
                onClick={() => {
                  setSelectedActiveWeek(week);
                  setSelectedDay('Monday');
                  fetchActiveLessons(week.id);
                }}
                className={`py-1 text-xs font-semibold rounded transition ${
                  isSelected ? 'bg-black text-[#e8b4b8] shadow-sm' : 'text-zinc-700 hover:bg-zinc-200'
                }`}
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Wk. {formattedDate}
              </button>
            );
          })}
        </div>

        {/* Day Jump Bar */}
        <div className="flex justify-between gap-1 px-1">
          {daysList.map((day) => {
            const hasLessons = activeDaysSet.has(day.fullDay);
            const isDaySelected = selectedDay === day.fullDay;

            return (
              <button
                key={day.label}
                disabled={!hasLessons}
                onClick={() => scrollToDay(day.fullDay)}
                className={`flex-1 py-1 rounded text-xs font-bold transition text-center shadow-xs border ${
                  !hasLessons
                    ? 'bg-zinc-100 text-zinc-300 border-zinc-200 cursor-not-allowed opacity-60'
                    : isDaySelected
                    ? 'bg-black text-[#e8b4b8] border-black'
                    : 'bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-100'
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* DAILY SCHEDULE LISTINGS */}
      <div className="space-y-6 pt-1">
        {Object.keys(groupedActiveLessons).map((dateStr) => {
          const dayLessons = groupedActiveLessons[dateStr];
          const lessonDateObj = new Date(dateStr + 'T00:00:00');
          const fullDayName = lessonDateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
          const monthDayDate = lessonDateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', timeZone: 'UTC' });

          return (
            <div
              key={dateStr}
              id={`schedule-day-section-${fullDayName.toLowerCase()}`}
              className="space-y-2"
            >
              {/* Sticky Day Banner with Calculated Height Offset */}
              <div
                className="sticky z-20 bg-amber-50/95 backdrop-blur-xs border-y border-amber-200/80 px-3 py-1.5 shadow-xs flex justify-between items-center rounded-sm"
                style={{ top: `calc(52px + ${headerHeight}px)` }}
              >
                <span
                  className="text-xs font-extrabold text-amber-900 uppercase tracking-wider"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {fullDayName} — {monthDayDate}
                </span>
                <span className="text-[10px] text-amber-700 font-medium">
                  {dayLessons.length} {dayLessons.length === 1 ? 'Session' : 'Sessions'}
                </span>
              </div>

              {/* Sessions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-1">
                {dayLessons.map((lesson) => {
                  const bookedMap = {};
                  lesson.bookings?.forEach((b) => { bookedMap[b.slot_index] = b; });

                  return (
                    <div
                      key={lesson.id}
                      className="border rounded-lg p-3 bg-white shadow-xs space-y-2"
                    >
                      <div className="flex justify-between items-center border-b pb-1.5 gap-2">
                        <h3
                          className="text-base font-normal text-zinc-900"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {formatTime12Hr(lesson.start_time)} - {lesson.title}
                        </h3>

                        {lesson.admin_note && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                            {lesson.admin_note}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        {Array.from({ length: lesson.max_capacity }).map((_, idx) => {
                          const slotNum = idx + 1;
                          const booking = bookedMap[slotNum];

                          return (
                            <div key={slotNum} className="flex justify-between items-center text-xs p-1 rounded bg-zinc-50 border">
                              <span className="text-zinc-400 font-mono text-[11px]">{slotNum}.</span>
                              <span className="flex-1 font-medium ml-2 text-xs text-zinc-800">
                                {booking ? booking.client_name : <span className="text-zinc-400 italic font-normal">Empty Slot</span>}
                              </span>

                              {!booking && (
                                <button
                                  onClick={() => handlePublicBooking(lesson.id, slotNum)}
                                  className="text-amber-700 hover:text-amber-900 text-[11px] flex items-center gap-0.5 font-medium"
                                >
                                  <Plus className="w-3 h-3" /> Assign
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
