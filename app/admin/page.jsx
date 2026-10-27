'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, Plus, Trash2, Calendar, Users, Key, UserPlus, X, Eye, EyeOff } from 'lucide-react';

export default function AdminPage() {
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [showAdminPasscode, setShowAdminPasscode] = useState(false);
  const [activeTab, setActiveTab] = useState('active-weeks');

  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const [masterLessons, setMasterLessons] = useState([]);
  const [newMasterLesson, setNewMasterLesson] = useState({ day_of_week: 1, start_time: '16:30', title: 'Group Lesson', max_capacity: 4 });

  const [activeWeeks, setActiveWeeks] = useState([]);
  const [selectedActiveWeek, setSelectedActiveWeek] = useState(null);
  const [activeLessons, setActiveLessons] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Monday');

  const [newOneOffLesson, setNewOneOffLesson] = useState({
    lesson_date: '',
    start_time: '16:30',
    title: 'Group Lesson',
    max_capacity: 4
  });

  const [newCommunityPasscode, setNewCommunityPasscode] = useState('');
  const [showNewCommunityPasscode, setShowNewCommunityPasscode] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
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
    const savedAdmin = localStorage.getItem('cbe_admin_code');
    if (savedAdmin) verifyAdminCode(savedAdmin, true);
  }, []);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, [activeTab, activeWeeks, selectedActiveWeek, activeLessons, masterLessons]);

  // Dynamic Scroll Observer to Highlight Active Day Jump Button on Scroll
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: `-${headerHeight + 60}px 0px -60% 0px`,
      threshold: 0,
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const dayId = entry.target.id;
          const dayName = dayId.replace('admin-day-section-', '').replace('master-day-section-', '');
          const matchedDay = daysList.find(d => d.fullDay.toLowerCase() === dayName);
          if (matchedDay) {
            setSelectedDay(matchedDay.fullDay);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const dayElements = document.querySelectorAll('[id^="admin-day-section-"], [id^="master-day-section-"]');
    dayElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [activeTab, activeLessons, masterLessons, headerHeight]);

  // Auto-scroll to current day of week on initial lesson load
  useEffect(() => {
    if (activeLessons.length > 0 && headerHeight > 0) {
      const todayIndex = new Date().getDay();
      const currentDayName = daysOfWeek[todayIndex === 0 ? 6 : todayIndex - 1];
      
      const hasCurrentDayLessons = activeLessons.some((lesson) => {
        const d = new Date(lesson.lesson_date + 'T00:00:00');
        return d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }) === currentDayName;
      });

      if (hasCurrentDayLessons) {
        scrollToDay(currentDayName);
      }
    }
  }, [activeLessons, headerHeight]);

  async function verifyAdminCode(codeToTest, silent = false) {
    const { data } = await supabase.rpc('verify_admin_passcode', { passcode_input: codeToTest });
    if (data === true) {
      setIsAdminUnlocked(true);
      setAdminPasscode(codeToTest);
      localStorage.setItem('cbe_admin_code', codeToTest);
      fetchMasterPlan();
      fetchActiveWeeks();
    } else if (!silent) {
      alert('Incorrect passcode.');
    }
  }

  async function fetchMasterPlan() {
    const { data } = await supabase
      .from('master_lessons')
      .select('*, master_regulars(*)')
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (data) setMasterLessons(data);
  }

  async function handleAddMasterLesson() {
    const { error } = await supabase.from('master_lessons').insert([newMasterLesson]);
    if (!error) {
      fetchMasterPlan();
      setNewMasterLesson({ day_of_week: 1, start_time: '16:30', title: 'Group Lesson', max_capacity: 4 });
    } else {
      alert('Error adding master training session');
    }
  }

  async function handleDeleteMasterLesson(id) {
    if (!confirm('Delete this recurring training session?')) return;
    await supabase.from('master_lessons').delete().eq('id', id);
    fetchMasterPlan();
  }

  async function handleAddMasterRegular(masterLessonId, slotIndex) {
    const name = prompt('Enter regular rider Name & Last Initial (e.g., Sofie H.):');
    if (!name) return;

    await supabase.from('master_regulars').insert([{
      master_lesson_id: masterLessonId,
      slot_index: slotIndex,
      client_name: name.trim()
    }]);
    fetchMasterPlan();
  }

  async function handleRemoveMasterRegular(regularId) {
    if (!confirm('Remove regular rider from this master slot?')) return;
    await supabase.from('master_regulars').delete().eq('id', regularId);
    fetchMasterPlan();
  }

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
      setNewOneOffLesson(prev => ({ ...prev, lesson_date: data[0].week_start_date }));
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

  async function handleAddOneOffLesson() {
    if (!selectedActiveWeek || !newOneOffLesson.lesson_date) return;

    const { error } = await supabase.from('active_lessons').insert([{
      active_week_id: selectedActiveWeek.id,
      lesson_date: newOneOffLesson.lesson_date,
      start_time: newOneOffLesson.start_time,
      title: newOneOffLesson.title,
      max_capacity: newOneOffLesson.max_capacity
    }]);

    if (!error) {
      fetchActiveLessons(selectedActiveWeek.id);
      alert('One-off training session added successfully!');
    } else {
      alert('Error adding one-off session');
    }
  }

  async function handleDeleteActiveLesson(lessonId) {
    if (!confirm('Delete this training session from the active week schedule?')) return;
    await supabase.from('active_lessons').delete().eq('id', lessonId);
    fetchActiveLessons(selectedActiveWeek.id);
  }

  async function handleUpdateAdminNote(lessonId, note) {
    await supabase.from('active_lessons').update({ admin_note: note }).eq('id', lessonId);
    fetchActiveLessons(selectedActiveWeek.id);
  }

  async function handleAdminRemoveBooking(bookingId) {
    if (!confirm('Remove student from this slot?')) return;
    await supabase.from('bookings').delete().eq('id', bookingId);
    fetchActiveLessons(selectedActiveWeek.id);
  }

  async function handleAdminAddBooking(lessonId, slotIndex) {
    const name = prompt('Enter rider Name & Last Initial (e.g., Sofie H.):');
    if (!name) return;
    await supabase.from('bookings').insert([{
      active_lesson_id: lessonId,
      slot_index: slotIndex,
      client_name: name.trim(),
      is_regular: false
    }]);
    fetchActiveLessons(selectedActiveWeek.id);
  }

  async function handleChangePasscode() {
    if (!newCommunityPasscode.trim()) return;
    const { error } = await supabase
      .from('system_settings')
      .update({ value: newCommunityPasscode.trim() })
      .eq('key', 'community_passcode');

    if (!error) {
      alert('Community Passcode updated successfully!');
      setNewCommunityPasscode('');
    } else {
      alert('Error updating passcode');
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
    const prefix = activeTab === 'master-plan' ? 'master-day-section-' : 'admin-day-section-';
    const targetElement = document.getElementById(`${prefix}${dayName.toLowerCase()}`);
    if (targetElement) {
      const mobileOffset = typeof window !== 'undefined' && window.innerWidth < 768 ? 52 : 0;
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

  const masterDaysSet = new Set(
    masterLessons.map((lesson) => daysOfWeek[lesson.day_of_week - 1])
  );

  const groupedActiveLessons = activeLessons.reduce((acc, lesson) => {
    if (!acc[lesson.lesson_date]) acc[lesson.lesson_date] = [];
    acc[lesson.lesson_date].push(lesson);
    return acc;
  }, {});

  const groupedMasterLessons = masterLessons.reduce((acc, lesson) => {
    const dayName = daysOfWeek[lesson.day_of_week - 1];
    if (!acc[dayName]) acc[dayName] = [];
    acc[dayName].push(lesson);
    return acc;
  }, {});

  if (!isAdminUnlocked) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-sm w-full p-6 space-y-4 shadow-xl text-zinc-900">
          <div
            className="flex items-center gap-2 text-zinc-900 font-bold text-xl"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            <Lock className="w-5 h-5 text-amber-600" />
            Admin Portal Access
          </div>
          <p className="text-xs text-zinc-600">Enter passcode to manage Master Schedule and Active Weeks.</p>
          <div className="relative">
            <input
              type={showAdminPasscode ? 'text' : 'password'}
              placeholder="Enter passcode"
              value={adminPasscode}
              onChange={(e) => setAdminPasscode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verifyAdminCode(adminPasscode)}
              className="w-full border rounded p-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
            <button
              type="button"
              onClick={() => setShowAdminPasscode(!showAdminPasscode)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-800"
            >
              {showAdminPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={() => verifyAdminCode(adminPasscode)}
            className="w-full bg-black text-[#e8b4b8] py-2 rounded text-sm font-medium hover:bg-zinc-800 transition"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Authenticate Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-3 md:p-6 space-y-4">
      {/* MEASURED STICKY HEADER CONTAINER */}
      <div
        ref={headerRef}
        className="sticky top-[52px] md:top-0 z-30 bg-white/95 backdrop-blur-xs pt-2 pb-2 border-b border-zinc-200 shadow-xs space-y-2"
      >
        {/* Top Header Card */}
        <div className="flex justify-between items-center bg-black text-white p-3.5 rounded-lg shadow-md">
          <div>
            <h1
              className="text-base font-bold text-[#e8b4b8]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Admin Portal
            </h1>
            <p className="text-[10px] text-zinc-300 uppercase tracking-widest">
              Cherry Blossom Equestrian
            </p>
          </div>
          <button
            onClick={() => { localStorage.removeItem('cbe_admin_code'); setIsAdminUnlocked(false); }}
            className="text-xs bg-zinc-800 px-2.5 py-1 rounded hover:bg-zinc-700 text-zinc-300 transition"
          >
            Exit
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-zinc-200 text-xs pb-1 bg-zinc-50 px-1 rounded">
          <button
            onClick={() => { setActiveTab('active-weeks'); setSelectedDay('Monday'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
              activeTab === 'active-weeks'
                ? 'bg-black text-[#e8b4b8] font-bold'
                : 'text-zinc-600 hover:text-black hover:bg-zinc-200'
            }`}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            <Calendar className="w-3.5 h-3.5" /> Lesson Maintenance
          </button>
          <button
            onClick={() => { setActiveTab('master-plan'); setSelectedDay('Monday'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
              activeTab === 'master-plan'
                ? 'bg-black text-[#e8b4b8] font-bold'
                : 'text-zinc-600 hover:text-black hover:bg-zinc-200'
            }`}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            <Users className="w-3.5 h-3.5" /> Master Template
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
              activeTab === 'settings'
                ? 'bg-black text-[#e8b4b8] font-bold'
                : 'text-zinc-600 hover:text-black hover:bg-zinc-200'
            }`}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            <Key className="w-3.5 h-3.5" /> Settings
          </button>
        </div>

        {/* ACTIVE WEEKS CONTROLS */}
        {activeTab === 'active-weeks' && (
          <div className="space-y-1.5 px-1">
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
                      setNewOneOffLesson(prev => ({ ...prev, lesson_date: week.week_start_date }));
                      fetchActiveLessons(week.id);
                    }}
                    className={`py-1 text-xs font-semibold rounded transition ${
                      isSelected ? 'bg-black text-[#e8b4b8] shadow-xs' : 'text-zinc-700 hover:bg-zinc-200'
                    }`}
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Wk. {formattedDate}
                  </button>
                );
              })}
            </div>

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
        )}

        {/* MASTER TEMPLATE DAY JUMP BAR */}
        {activeTab === 'master-plan' && (
          <div className="flex justify-between gap-1 px-1">
            {daysList.map((day) => {
              const hasLessons = masterDaysSet.has(day.fullDay);
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
        )}
      </div>

      {/* TAB 1: LESSON MAINTENANCE */}
      {activeTab === 'active-weeks' && (
        <div className="space-y-6 pt-1">
          {/* Add One-Off Session Form */}
          <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200 space-y-2">
            <h3
              className="font-bold text-xs text-amber-900 flex items-center gap-1.5"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              <Plus className="w-3.5 h-3.5 text-amber-700" /> Add One-Off Training Session
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <input
                type="date"
                value={newOneOffLesson.lesson_date}
                onChange={(e) => setNewOneOffLesson({ ...newOneOffLesson, lesson_date: e.target.value })}
                className="border rounded p-1.5 text-xs bg-white"
              />

              <input
                type="time"
                value={newOneOffLesson.start_time}
                onChange={(e) => setNewOneOffLesson({ ...newOneOffLesson, start_time: e.target.value })}
                className="border rounded p-1.5 text-xs bg-white"
              />

              <input
                type="text"
                placeholder="Title (Evaluation, Private)"
                value={newOneOffLesson.title}
                onChange={(e) => setNewOneOffLesson({ ...newOneOffLesson, title: e.target.value })}
                className="border rounded p-1.5 text-xs bg-white"
              />

              <input
                type="number"
                min="1"
                max="10"
                value={newOneOffLesson.max_capacity}
                onChange={(e) => setNewOneOffLesson({ ...newOneOffLesson, max_capacity: parseInt(e.target.value) })}
                className="border rounded p-1.5 text-xs bg-white"
              />

              <button
                onClick={handleAddOneOffLesson}
                className="bg-black text-[#e8b4b8] text-xs font-semibold rounded p-1.5 hover:bg-zinc-800 transition col-span-2 md:col-span-1"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Add Session
              </button>
            </div>
          </div>

          {/* Grouped Daily Lessons */}
          <div className="space-y-6">
            {Object.keys(groupedActiveLessons).map((dateStr) => {
              const dayLessons = groupedActiveLessons[dateStr];
              const lessonDateObj = new Date(dateStr + 'T00:00:00');
              const fullDayName = lessonDateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
              const monthDayDate = lessonDateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', timeZone: 'UTC' });

              return (
                <div
                  key={dateStr}
                  id={`admin-day-section-${fullDayName.toLowerCase()}`}
                  className="space-y-2"
                >
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

                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                placeholder="Note (Sick, Show)"
                                defaultValue={lesson.admin_note || ''}
                                onBlur={(e) => handleUpdateAdminNote(lesson.id, e.target.value)}
                                className="text-[11px] border rounded px-1.5 py-0.5 bg-amber-50 w-28"
                              />
                              <button
                                onClick={() => handleDeleteActiveLesson(lesson.id)}
                                className="text-red-500 hover:text-red-700 p-0.5"
                                title="Delete Session"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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
                                    <button
                                      onClick={() => handleAdminRemoveBooking(booking.id)}
                                      className="text-red-600 hover:text-red-800 text-[11px] flex items-center gap-0.5 font-medium"
                                    >
                                      <Trash2 className="w-3 h-3" /> Remove
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleAdminAddBooking(lesson.id, slotNum)}
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
      )}

      {/* TAB 2: MASTER PLAN TEMPLATE */}
      {activeTab === 'master-plan' && (
        <div className="space-y-6 pt-2">
          {/* Add Recurring Session Form */}
          <div className="bg-zinc-100 p-4 rounded-lg border space-y-3">
            <h3
              className="font-bold text-sm text-zinc-800"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Add Recurring Training Session
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <select
                value={newMasterLesson.day_of_week}
                onChange={(e) => setNewMasterLesson({ ...newMasterLesson, day_of_week: parseInt(e.target.value) })}
                className="border rounded p-2 text-sm bg-white"
              >
                {daysOfWeek.map((day, idx) => (
                  <option key={day} value={idx + 1}>{day}</option>
                ))}
              </select>

              <input
                type="time"
                value={newMasterLesson.start_time}
                onChange={(e) => setNewMasterLesson({ ...newMasterLesson, start_time: e.target.value })}
                className="border rounded p-2 text-sm bg-white"
              />

              <input
                type="text"
                placeholder="Title (Group/Private)"
                value={newMasterLesson.title}
                onChange={(e) => setNewMasterLesson({ ...newMasterLesson, title: e.target.value })}
                className="border rounded p-2 text-sm bg-white"
              />

              <input
                type="number"
                min="1"
                max="10"
                value={newMasterLesson.max_capacity}
                onChange={(e) => setNewMasterLesson({ ...newMasterLesson, max_capacity: parseInt(e.target.value) })}
                className="border rounded p-2 text-sm bg-white"
              />

              <button
                onClick={handleAddMasterLesson}
                className="bg-black text-[#e8b4b8] text-sm font-semibold rounded p-2 hover:bg-zinc-800 transition col-span-2 md:col-span-1"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Add Session
              </button>
            </div>
          </div>

          {/* Grouped Master Lessons */}
          <div className="space-y-6">
            {Object.keys(groupedMasterLessons).map((dayName) => {
              const dayLessons = groupedMasterLessons[dayName];

              return (
                <div key={dayName} id={`master-day-section-${dayName.toLowerCase()}`} className="space-y-2">
                  <div
                    className="sticky z-20 bg-amber-50/95 backdrop-blur-xs border-y border-amber-200/80 px-3 py-1.5 shadow-xs flex justify-between items-center rounded-sm top-[calc(52px+var(--header-height,0px))] md:top-[var(--header-height,0px)]"
                    style={{ '--header-height': `${headerHeight}px` }}
                  >
                    <span
                      className="text-xs font-extrabold text-amber-900 uppercase tracking-wider"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {dayName}
                    </span>
                    <span className="text-[10px] text-amber-700 font-medium">
                      {dayLessons.length} {dayLessons.length === 1 ? 'Recurring Session' : 'Recurring Sessions'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
                    {dayLessons.map((lesson) => {
                      const regularMap = {};
                      lesson.master_regulars?.forEach((r) => { regularMap[r.slot_index] = r; });

                      return (
                        <div key={lesson.id} className="border rounded-lg p-4 bg-white shadow-sm space-y-3">
                          <div className="flex justify-between items-center border-b pb-2">
                            <div>
                              <h4
                                className="text-base font-normal text-zinc-900"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                              >
                                {formatTime12Hr(lesson.start_time)} - {lesson.title}
                              </h4>
                            </div>
                            <button
                              onClick={() => handleDeleteMasterLesson(lesson.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete Recurring Session"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            {Array.from({ length: lesson.max_capacity }).map((_, idx) => {
                              const slotNum = idx + 1;
                              const regular = regularMap[slotNum];

                              return (
                                <div key={slotNum} className="flex justify-between items-center text-sm p-1.5 rounded bg-zinc-50 border">
                                  <span className="text-zinc-400 font-mono text-xs">{slotNum}.</span>
                                  <span className="flex-1 font-medium ml-2 text-xs">
                                    {regular ? regular.client_name : <span className="text-zinc-400 italic font-normal">Unassigned Regular</span>}
                                  </span>

                                  {regular ? (
                                    <button
                                      onClick={() => handleRemoveMasterRegular(regular.id)}
                                      className="text-red-500 hover:text-red-700 p-1"
                                      title="Remove Regular"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleAddMasterRegular(lesson.id, slotNum)}
                                      className="text-amber-700 hover:text-amber-900 text-xs flex items-center gap-1 font-medium"
                                    >
                                      <UserPlus className="w-3.5 h-3.5" /> Assign Regular
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
      )}

      {/* TAB 3: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white border rounded-lg p-6 max-w-md space-y-4 mt-2 shadow-xs">
          <h3
            className="font-bold text-lg text-zinc-900"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Update Community Passcode
          </h3>
          <p className="text-xs text-zinc-600">This passcode allows riders/parents to unlock "Edit Mode" and book available slots.</p>
          <div className="relative">
            <input
              type={showNewCommunityPasscode ? 'text' : 'password'}
              placeholder="New Passcode (e.g., CBE2026)"
              value={newCommunityPasscode}
              onChange={(e) => setNewCommunityPasscode(e.target.value)}
              className="w-full border rounded p-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
            <button
              type="button"
              onClick={() => setShowNewCommunityPasscode(!showNewCommunityPasscode)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-800"
            >
              {showNewCommunityPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={handleChangePasscode}
            className="bg-black text-[#e8b4b8] text-sm px-4 py-2 rounded hover:bg-zinc-800 font-semibold transition"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Update Passcode
          </button>
        </div>
      )}
    </div>
  );
}
