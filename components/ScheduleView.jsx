'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Lock, Unlock, X, UserPlus } from 'lucide-react';

export default function ScheduleView() {
  const [activeWeeks, setActiveWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [bookingModal, setBookingModal] = useState({ open: false, lessonId: null, slotIndex: null });
  const [clientName, setClientName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-zinc-900 text-white p-4 rounded-lg shadow-md">
        <div>
          <h2 className="text-xl font-semibold">Lesson Schedule</h2>
          <p className="text-xs text-zinc-400">4-Week Rolling Availability</p>
        </div>

        <button
          onClick={() => isUnlocked ? (setIsUnlocked(false), localStorage.removeItem('cbe_community_code')) : setShowPasscodeModal(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${
            isUnlocked ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          {isUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          {isUnlocked ? 'Edit Mode Unlocked' : 'Unlock to Sign Up'}
        </button>
      </div>

      {/* Week Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-zinc-200">
        {activeWeeks.map((week) => (
          <button
            key={week.id}
            onClick={() => { setSelectedWeek(week); fetchLessonsForWeek(week.id); }}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition ${
              selectedWeek?.id === week.id ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Week of {new Date(week.week_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </button>
        ))}
      </div>

      {/* Daily Schedule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lessons.map((lesson) => {
          const bookedMap = {};
          lesson.bookings?.forEach((b) => { bookedMap[b.slot_index] = b; });

          return (
            <div key={lesson.id} className="border border-zinc-200 rounded-lg p-4 bg-white shadow-sm space-y-3">
              <div className="flex justify-between items-start border-b pb-2">
                <div>
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                    {new Date(lesson.lesson_date).toLocaleDateString('en-US', { weekday: 'long' })}
                  </span>
                  <h3 className="font-serif text-lg">{lesson.start_time.slice(0, 5)} - {lesson.title}</h3>
                </div>
                {lesson.admin_note && (
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
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
                      <span className="text-zinc-500 font-mono w-6">{slotNum}.</span>
                      <span className="flex-1 font-medium text-zinc-800">
                        {booking ? booking.client_name : <span className="text-zinc-400 italic">Available Slot</span>}
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
                          className="flex items-center gap-1 text-xs bg-black text-white px-2 py-1 rounded hover:bg-zinc-800"
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
