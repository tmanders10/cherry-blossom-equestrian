'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Calendar, UserCheck, Lock, Unlock, AlertCircle } from 'lucide-react';

export default function SchedulePage() {
  const [activeWeeks, setActiveWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Monday');

  // Edit Mode / Community Unlock State
  const [isEditUnlocked, setIsEditUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);

  // Measured Header Container Height for Sticky Days Alignment
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
    const savedCode = localStorage.getItem('cbe_community_code');
    if (savedCode) verifyCommunityCode(savedCode, true);
    fetchActiveWeeks();
  }, []);

  // Calculate sticky header offset dynamically
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, [selectedWeek, activeWeeks]);

  async function fetchActiveWeeks() {
    const { data } = await supabase
      .from('active_weeks')
      .select('*')
      .eq('is_archived', false)
      .order('week_start_date', { ascending: true })
      .limit(4);

    if (data && data.length > 0) {
      setActiveWeeks(data);
      setSelectedWeek(data[0]);
      fetchLessons(data[0].id);
    }
  }

  async function fetchLessons(weekId) {
    const { data } = await supabase
      .from('active_lessons')
      .select('*, bookings(*)')
      .eq('active_week_id', weekId)
      .order('lesson_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (data) setLessons(data);
  }

  async function verifyCommunityCode(codeToTest, silent = false) {
    const { data } = await supabase.rpc('verify_community_passcode', { passcode_input: codeToTest });
    if (data === true) {
      setIsEditUnlocked(true);
      localStorage.setItem('cbe_community_code', codeToTest);
      setShowPasscodeModal(false);
    } else if (!silent) {
      alert('Incorrect passcode.');
    }
  }

  async function handleBookSlot(lessonId, slotIndex) {
    if (!isEditUnlocked) {
      setShowPasscodeModal(true);
      return;
    }

    const name = prompt('Enter Rider Name & Last Initial (e.g., Sofie H.):');
    if (!name) return;

    const { error } = await supabase.from('bookings').insert([{
      active_lesson_id: lessonId,
      slot_index: slotIndex,
      client_name: name.trim(),
      is_regular: false
    }]);

    if (!error) {
      fetchLessons(selectedWeek.id);
    } else {
      alert('Could not book slot. Please try again.');
    }
  }

  async function handleCancelBooking(bookingId) {
    if (!isEditUnlocked) {
      setShowPasscodeModal(true);
      return;
    }

    if (!confirm('Cancel this booking?')) return;

    const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
    if (!error) {
      fetchLessons(selectedWeek.id);
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
    const targetElement = document.getElementById(`day-section-${dayName.toLowerCase()}`);
    if (targetElement) {
      const mobileOffset = typeof window !== 'undefined' && window.innerWidth < 768 ? 52 : 0;
      const yOffset = -(headerHeight + mobileOffset + 10);
      const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  const activeDaysSet = new Set(
    lessons.map((lesson) => {
      const d = new Date(lesson.lesson_date + 'T00:00:00');
      return d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    })
  );

  const groupedLessons = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.lesson_date]) acc[lesson.lesson_date] = [];
    acc[lesson.lesson_date].push(lesson);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto p-3 md:p-6 space-y-4">
      {/* MEASURED STICKY HEADER CONTAINER */}
      <div
        ref={headerRef}
        className="sticky top-[52px] md:top-0 z-30 bg-white/95 backdrop-blur-xs pt-2 pb-2 border-b border-zinc-200 shadow-xs space-y-2"
      >
        {/* Top Branding Card - White Subtitle Font */}
        <div className="flex justify-between items-center bg-black text-white p-3.5 rounded-lg shadow-md">
          <div>
            <h1
              className="text-base font-bold text-[#e8b4b8]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Training Schedule & Booking
            </h1>
            <p className="text-[10px] text-zinc-300 uppercase tracking-widest">
              Cherry Blossom Equestrian
            </p>
          </div>

          <button
            onClick={() => {
              if (isEditUnlocked) {
                localStorage.removeItem('cbe_community_code');
                setIsEditUnlocked(false);
              } else {
                setShowPasscodeModal(true);
              }
            }}
            className="flex items-center gap-1.5 text-xs bg-zinc-800 px-3 py-1.5 rounded hover:bg-zinc-700 text-zinc-200 transition"
          >
            {isEditUnlocked ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-400" /> Lock Edit
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Unlock Edit Mode
              </>
            )}
          </button>
        </div>

        {/* Week Selector Grid */}
        <div className="grid grid-cols-4 gap-1.5 bg-zinc-100 p-1 rounded-lg text-center">
          {activeWeeks.map((week) => {
            const dateObj = new Date(week.week_start_date + 'T00:00:00');
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', timeZone: 'UTC' });
            const isSelected = selectedWeek?.id === week.id;

            return (
              <button
                key={week.id}
                onClick={() => {
                  setSelectedWeek(week);
                  setSelectedDay('Monday');
                  fetchLessons(week.id);
                }}
                className={`py-1 text-xs font-semibold rounded transition ${
                  isSelected
                    ? 'bg-black text-[#e8b4b8] shadow-xs'
                    : 'text-zinc-700 hover:bg-zinc-200'
                }`}
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Wk. {formattedDate}
              </button>
            );
          })}
        </div>

        {/* Day Quick Jump Navigation */}
        <div className="flex justify-between gap-1">
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

      {/* SCHEDULE LIST BY DAY */}
      <div className="space-y-6 pt-1">
        {Object.keys(groupedLessons).map((dateStr) => {
          const dayLessons = groupedLessons[dateStr];
          const lessonDateObj = new Date(dateStr + 'T00:00:00');
          const fullDayName = lessonDateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
          const monthDayDate = lessonDateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', timeZone: 'UTC' });

          return (
            <div
              key={dateStr}
              id={`day-section-${fullDayName.toLowerCase()}`}
              className="space-y-2"
            >
              {/* Sticky Day Banner with Desktop Offset Calibration */}
              <div
                className="sticky z-20 bg-amber-50/95 backdrop-blur-xs border-y border-amber-200/80 px-3 py-1.5 shadow-xs flex justify-between items-center rounded-sm top-[calc(52px+var(--header-height,0px))] md:top-[var(--header-height,0px)]"
                style={{ '--header-height': `${headerHeight}px` }}
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

              {/* Lesson Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-1">
                {dayLessons.map((lesson) => {
                  const bookedMap = {};
                  lesson.bookings?.forEach((b) => { bookedMap[b.slot_index] = b; });

                  return (
                    <div key={lesson.id} className="border rounded-lg p-3 bg-white shadow-xs space-y-2">
                      <div className="flex justify-between items-center border-b pb-1.5 gap-2">
                        <h3
                          className="text-base font-normal text-zinc-900"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {formatTime12Hr(lesson.start_time)} - {lesson.title}
                        </h3>

                        {lesson.admin_note && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-medium">
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
                              <span className="flex-1 font-medium ml-2 text-xs">
                                {booking ? booking.client_name : <span className="text-zinc-400 italic font-normal">Empty Slot</span>}
                              </span>

                              {booking ? (
                                isEditUnlocked && (
                                  <button
                                    onClick={() => handleCancelBooking(booking.id)}
                                    className="text-red-600 hover:text-red-800 text-[11px] font-medium"
                                  >
                                    Cancel
                                  </button>
                                )
                              ) : (
                                <button
                                  onClick={() => handleBookSlot(lesson.id, slotNum)}
                                  className="text-amber-700 hover:text-amber-900 text-[11px] font-semibold"
                                >
                                  + Book
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

      {/* PASSCODE MODAL */}
      {showPasscodeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-zinc-900 font-bold text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              <Lock className="w-5 h-5 text-amber-600" /> Enter Passcode
            </div>
            <p className="text-xs text-zinc-600">Enter community passcode to unlock booking and cancellation controls.</p>
            <input
              type="password"
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPasscodeModal(false)}
                className="px-3 py-1.5 text-xs border rounded text-zinc-600 hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                onClick={() => verifyCommunityCode(passcode)}
                className="px-3 py-1.5 text-xs bg-black text-[#e8b4b8] font-semibold rounded hover:bg-zinc-800"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
