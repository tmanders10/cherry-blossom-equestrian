'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Lock, Unlock, X, UserPlus } from 'lucide-react';

export default function ScheduleView() {
  const [activeWeeks, setActiveWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [bookingModal, setBookingModal] = useState({ open: false, lessonId: null, slotIndex: null });
  const [clientName, setClientName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
    if (savedCode) verifyCode(savedCode, true);
    fetchActiveWeeks();
  }, []);

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
      fetchLessonsForWeek(data[0].id);
    }
  }

  async function fetchLessonsForWeek(weekId) {
    const { data } = await supabase
      .from('active_lessons')
      .select('*, bookings(*)')
      .eq('active_week_id', weekId)
      .order('lesson_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (data) setLessons(data);
  }

  async function verifyCode(codeToTest, silent = false) {
    const { data } = await supabase.rpc('verify_community_passcode', { passcode_input: codeToTest });
    if (data === true) {
      setIsUnlocked(true);
      setPasscode(codeToTest);
      localStorage.setItem('cbe_community_code', codeToTest);
      setShowPasscodeModal(false);
      setErrorMessage('');
    } else if (!silent) {
      setErrorMessage('Incorrect passcode. Please try again.');
    }
  }

  async function handleBookSlot() {
    if (!clientName.trim()) return;
    const { data } = await supabase.rpc('client_book_slot', {
      p_lesson_id: bookingModal.lessonId,
      p_slot_index: bookingModal.slotIndex,
      p_client_name: clientName.trim(),
      p_passcode: passcode
    });

    if (data?.success) {
      setBookingModal({ open: false, lessonId: null, slotIndex: null });
      setClientName('');
      fetchLessonsForWeek(selectedWeek.id);
    } else {
      alert(data?.message || 'Error making booking');
    }
  }

  async function handleCancelBooking(bookingId) {
    if (!confirm('Are you sure you want to remove this sign-up?')) return;
    const { data } = await supabase.rpc('client_cancel_booking', {
      p_booking_id: bookingId,
      p_passcode: passcode
    });

    if (data?.success) {
      fetchLessonsForWeek(selectedWeek.id);
    } else {
      alert(data?.message || 'Error cancelling booking');
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
      const yOffset = -140;
      const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  // Set of days that actually have lessons scheduled
  const activeDaysSet = new Set(
    lessons.map((lesson) => {
      const d = new Date(lesson.lesson_date + 'T00:00:00');
      return d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    })
  );

  return (
    <div className="max-w-5xl mx-auto p-3 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-zinc-900 text-white p-3.5 rounded-lg shadow-md">
        <div>
          <h2 className="text-lg font-semibold">Lesson Schedule</h2>
          <p className="text-xs text-zinc-400">4-Week Rolling Availability</p>
        </div>

        <button
          onClick={() => isUnlocked ? (setIsUnlocked(false), localStorage.removeItem('cbe_community_code')) : setShowPasscodeModal(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition ${
            isUnlocked ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          {isUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          {isUnlocked ? 'Unlocked' : 'Unlock'}
        </button>
      </div>

      {/* STICKY TOP CONTAINER */}
      <div className="sticky top-0 z-30 bg-zinc-50 pt-1 pb-3 border-b border-zinc-200 shadow-sm space-y-2">
        {/* Condensed 4-Week Selector Tabs */}
        <div className="grid grid-cols-4 gap-1.5 bg-zinc-200 p-1 rounded-lg text-center">
          {activeWeeks.map((week) => {
            const dateObj = new Date(week.week_start_date + 'T00:00:00');
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', timeZone: 'UTC' });
            const isSelected = selectedWeek?.id === week.id;

            return (
              <button
                key={week.id}
                onClick={() => {
                  setSelectedWeek(week);
                  setSelectedDay('Monday'); // Default to 'M' when selecting a week
                  fetchLessonsForWeek(week.id);
                }}
                className={`py-1.5 text-xs font-semibold rounded transition ${
                  isSelected ? 'bg-black text-white shadow-sm' : 'text-zinc-700 hover:bg-zinc-300'
                }`}
              >
                Wk. {formattedDate}
              </button>
            );
          })}
        </div>

        {/* Day Quick Jump Buttons */}
        <div className="flex justify-between gap-1 pt-1">
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
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-100'
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Schedule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {lessons.map((lesson, index) => {
          const bookedMap = {};
          lesson.bookings?.forEach((b) => { bookedMap[b.slot_index] = b; });

          const lessonDateObj = new Date(lesson.lesson_date + 'T00:00:00');
          const fullDayName = lessonDateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
          const monthDayDate = lessonDateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', timeZone: 'UTC' });

          const isFirstLessonOfDay = index === 0 || lessons[index - 1]?.lesson_date !== lesson.lesson_date;

          return (
            <div
              key={lesson.id}
              id={isFirstLessonOfDay ? `day-section-${fullDayName.toLowerCase()}` : undefined}
              className="border border-zinc-200 rounded-lg p-4 bg-white shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start border-b pb-2">
                <div>
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                    {fullDayName.toUpperCase()} — {monthDayDate}
                  </span>
                  <h3 className="font-serif text-lg font-normal">
                    {formatTime12Hr(lesson.start_time)} - {lesson.title}
                  </h3>
                </div>
                {lesson.admin_note && (
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                    {lesson.admin_note}
                  </span>
                )}
              </div>

              {/* Slot Listing */}
              <div className="space-y-1.5">
                {Array.from({ length: lesson.max_capacity }).map((_, idx) => {
                  const slotNum = idx + 1;
                  const booking = bookedMap[slotNum];

                  return (
                    <div key={slotNum} className="flex justify-between items-center text-sm p-1.5 rounded bg-zinc-50 border border-zinc-100">
                      <span className="text-zinc-500 font-mono w-6 text-xs">{slotNum}.</span>
                      <span className="flex-1 font-medium text-zinc-800 text-sm">
                        {booking ? booking.client_name : <span className="text-zinc-400 italic font-normal">Available Slot</span>}
                      </span>

                      {booking && isUnlocked && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove sign-up"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}

                      {!booking && isUnlocked && (
                        <button
                          onClick={() => setBookingModal({ open: true, lessonId: lesson.id, slotIndex: slotNum })}
                          className="flex items-center gap-1 text-xs bg-black text-white px-2.5 py-1 rounded hover:bg-zinc-800"
                        >
                          <UserPlus className="w-3 h-3" /> Sign Up
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

      {/* Community Passcode Unlock Modal */}
      {showPasscodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-serif font-bold">Community Sign-In</h3>
            <p className="text-xs text-zinc-600">Enter the community passcode to enable lesson sign-ups and updates.</p>
            <input
              type="password"
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            />
            {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowPasscodeModal(false)} className="px-3 py-1.5 text-xs text-zinc-600">Cancel</button>
              <button onClick={() => verifyCode(passcode)} className="px-3 py-1.5 text-xs bg-black text-white rounded">Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Up Modal */}
      {bookingModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-serif font-bold">Reserve Lesson Slot</h3>
            <p className="text-xs text-zinc-600">Please enter rider's First Name and Last Initial (e.g., "Sofie H.").</p>
            <input
              type="text"
              placeholder="First Name & Last Initial"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setBookingModal({ open: false, lessonId: null, slotIndex: null })} className="px-3 py-1.5 text-xs text-zinc-600">Cancel</button>
              <button onClick={handleBookSlot} className="px-3 py-1.5 text-xs bg-black text-white rounded">Confirm Sign-Up</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
