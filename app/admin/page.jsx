'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, Plus, Trash2, Edit3, Save, Calendar, Users, Key, RefreshCw } from 'lucide-react';

export default function AdminPage() {
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [activeTab, setActiveTab] = useState('active-weeks'); // 'active-weeks' | 'master-plan' | 'settings'

  // Master Plan State
  const [masterLessons, setMasterLessons] = useState([]);
  const [newMasterLesson, setNewMasterLesson] = useState({ day_of_week: 1, start_time: '16:30', title: 'Group Lesson', max_capacity: 4 });

  // Active Weeks State
  const [activeWeeks, setActiveWeeks] = useState([]);
  const [selectedActiveWeek, setSelectedActiveWeek] = useState(null);
  const [activeLessons, setActiveLessons] = useState([]);

  // Settings State
  const [newCommunityPasscode, setNewCommunityPasscode] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const savedAdmin = localStorage.getItem('cbe_admin_code');
    if (savedAdmin) verifyAdminCode(savedAdmin, true);
  }, []);

  async function verifyAdminCode(codeToTest, silent = false) {
    // Verifies against community passcode or admin credential
    const { data } = await supabase.rpc('verify_community_passcode', { passcode_input: codeToTest });
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

  // --- MASTER PLAN FUNCTIONS ---
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
      alert('Error adding master lesson slot');
    }
  }

  async function handleDeleteMasterLesson(id) {
    if (!confirm('Delete this recurring slot template?')) return;
    await supabase.from('master_lessons').delete().eq('id', id);
    fetchMasterPlan();
  }

  // --- ACTIVE WEEKS FUNCTIONS ---
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

  // --- SETTINGS FUNCTIONS ---
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

  if (!isAdminUnlocked) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-sm w-full p-6 space-y-4 shadow-xl text-zinc-900">
          <div className="flex items-center gap-2 text-zinc-800 font-serif font-bold text-xl">
            <Lock className="w-5 h-5 text-amber-600" />
            Admin Portal Access
          </div>
          <p className="text-xs text-zinc-600">Enter passcode to manage Master Schedule and Active Weeks.</p>
          <input
            type="password"
            placeholder="Enter passcode"
            value={adminPasscode}
            onChange={(e) => setAdminPasscode(e.target.value)}
            className="w-full border rounded p-2 text-sm"
          />
          <button
            onClick={() => verifyAdminCode(adminPasscode)}
            className="w-full bg-black text-white py-2 rounded text-sm font-medium hover:bg-zinc-800"
          >
            Authenticate Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      {/* Top Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-black text-white p-6 rounded-lg shadow-md gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold">Admin Management Portal</h1>
          <p className="text-xs text-amber-500 uppercase tracking-widest">Cherry Blossom Equestrian</p>
        </div>
        <button
          onClick={() => { localStorage.removeItem('cbe_admin_code'); setIsAdminUnlocked(false); }}
          className="text-xs bg-zinc-800 px-3 py-1.5 rounded hover:bg-zinc-700 text-zinc-300"
        >
          Exit Admin Mode
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-zinc-200">
        <button
          onClick={() => setActiveTab('active-weeks')}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm transition border-b-2 ${
            activeTab === 'active-weeks' ? 'border-amber-600 text-amber-700 font-bold' : 'border-transparent text-zinc-600 hover:text-black'
          }`}
        >
          <Calendar className="w-4 h-4" /> Active Weeks Overrides
        </button>
        <button
          onClick={() => setActiveTab('master-plan')}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm transition border-b-2 ${
            activeTab === 'master-plan' ? 'border-amber-600 text-amber-700 font-bold' : 'border-transparent text-zinc-600 hover:text-black'
          }`}
        >
          <Users className="w-4 h-4" /> Master Plan Template
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm transition border-b-2 ${
            activeTab === 'settings' ? 'border-amber-600 text-amber-700 font-bold' : 'border-transparent text-zinc-600 hover:text-black'
          }`}
        >
          <Key className="w-4 h-4" /> System Settings
        </button>
      </div>

      {/* TAB 1: ACTIVE WEEKS OVERRIDES */}
      {activeTab === 'active-weeks' && (
        <div className="space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {activeWeeks.map((week) => (
              <button
                key={week.id}
                onClick={() => { setSelectedActiveWeek(week); fetchActiveLessons(week.id); }}
                className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition ${
                  selectedActiveWeek?.id === week.id ? 'bg-black text-white' : 'bg-zinc-200 text-zinc-800'
                }`}
              >
                Week of {new Date(week.week_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLessons.map((lesson) => {
              const bookedMap = {};
              lesson.bookings?.forEach((b) => { bookedMap[b.slot_index] = b; });

              return (
                <div key={lesson.id} className="border rounded-lg p-4 bg-white shadow-sm space-y-3">
                  <div className="flex justify-between items-start border-b pb-2">
                    <div>
                      <span className="text-xs font-bold text-amber-700 uppercase">
                        {new Date(lesson.lesson_date).toLocaleDateString('en-US', { weekday: 'long', month: 'numeric', day: 'numeric' })}
                      </span>
                      <h3 className="font-serif text-lg">{lesson.start_time.slice(0, 5)} - {lesson.title}</h3>
                    </div>

                    <input
                      type="text"
                      placeholder="Add Note (e.g. Sick, Show)"
                      defaultValue={lesson.admin_note || ''}
                      onBlur={(e) => handleUpdateAdminNote(lesson.id, e.target.value)}
                      className="text-xs border rounded px-2 py-1 bg-amber-50 w-36"
                    />
                  </div>

                  <div className="space-y-1.5">
                    {Array.from({ length: lesson.max_capacity }).map((_, idx) => {
                      const slotNum = idx + 1;
                      const booking = bookedMap[slotNum];

                      return (
                        <div key={slotNum} className="flex justify-between items-center text-sm p-2 rounded bg-zinc-50 border">
                          <span className="text-zinc-400 font-mono text-xs">{slotNum}.</span>
                          <span className="flex-1 font-medium ml-2">
                            {booking ? booking.client_name : <span className="text-zinc-400 italic">Empty Slot</span>}
                          </span>

                          {booking ? (
                            <button
                              onClick={() => handleAdminRemoveBooking(booking.id)}
                              className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAdminAddBooking(lesson.id, slotNum)}
                              className="text-amber-700 hover:text-amber-900 text-xs flex items-center gap-1 font-medium"
                            >
                              <Plus className="w-3.5 h-3.5" /> Assign Rider
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
      )}

      {/* TAB 2: MASTER PLAN TEMPLATE */}
      {activeTab === 'master-plan' && (
        <div className="space-y-6">
          <div className="bg-zinc-100 p-4 rounded-lg border space-y-3">
            <h3 className="font-bold text-sm text-zinc-800">Add New Recurring Master Slot</h3>
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
                className="bg-black text-white text-sm font-medium rounded p-2 hover:bg-zinc-800 col-span-2 md:col-span-1"
              >
                Add Slot
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {masterLessons.map((lesson) => (
              <div key={lesson.id} className="border rounded p-4 bg-white flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-amber-700 uppercase">{daysOfWeek[lesson.day_of_week - 1]}</span>
                  <h4 className="font-serif text-base">{lesson.start_time.slice(0, 5)} - {lesson.title} ({lesson.max_capacity} Slots)</h4>
                </div>
                <button
                  onClick={() => handleDeleteMasterLesson(lesson.id)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white border rounded-lg p-6 max-w-md space-y-4">
          <h3 className="font-bold text-lg font-serif">Update Community Passcode</h3>
          <p className="text-xs text-zinc-600">This passcode allows riders/parents to unlock "Edit Mode" and book available slots.</p>
          <input
            type="text"
            placeholder="New Passcode (e.g., CBE2026)"
            value={newCommunityPasscode}
            onChange={(e) => setNewCommunityPasscode(e.target.value)}
            className="w-full border rounded p-2 text-sm"
          />
          <button
            onClick={handleChangePasscode}
            className="bg-black text-white text-sm px-4 py-2 rounded hover:bg-zinc-800 font-medium"
          >
            Update Passcode
          </button>
        </div>
      )}
    </div>
  );
}
