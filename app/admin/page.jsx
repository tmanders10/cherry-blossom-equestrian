'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, Plus, Trash2, Calendar, Users, Key, UserPlus, X, Eye, EyeOff, History, Search, ChevronDown, Receipt, Copy, Check, Download, ChevronUp, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getAppEnvironment } from '../../lib/envUtils';




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
  const [archivedWeeks, setArchivedWeeks] = useState([]);
  const [selectedArchivedWeek, setSelectedArchivedWeek] = useState(null);
  const [archivedLessons, setArchivedLessons] = useState([]);
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  const [archiveSearchTerm, setArchiveSearchTerm] = useState('');
  const [showAllWeeksInArchive, setShowAllWeeksInArchive] = useState(false);
  const hasAutoScrolledRef = useRef(false);

  const [selectedInvoiceMonth, setSelectedInvoiceMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [invoiceLessons, setInvoiceLessons] = useState([]);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState('');
  const [expandedRiders, setExpandedRiders] = useState({});
  const [copiedRider, setCopiedRider] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);



  const [newOneOffLesson, setNewOneOffLesson] = useState({
    lesson_date: '',
    start_time: '16:30',
    title: 'Group Lesson',
    max_capacity: 4
  });

  const [isOneOffModalOpen, setIsOneOffModalOpen] = useState(false);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);

  const [newCommunityPasscode, setNewCommunityPasscode] = useState('');
  const [showNewCommunityPasscode, setShowNewCommunityPasscode] = useState(false);

  // Environment detection & manual rollover states (Dev/Test only)
  const [currentEnv, setCurrentEnv] = useState(null); // 'test' | 'dev' | 'prod'
  const [isRollingOver, setIsRollingOver] = useState(false);
  const [showRolloverConfirm, setShowRolloverConfirm] = useState(false);
  const [rolloverMessage, setRolloverMessage] = useState(null);

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
    setCurrentEnv(getAppEnvironment());
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
  }, [activeTab, activeWeeks, selectedActiveWeek, activeLessons, masterLessons, archivedWeeks, selectedArchivedWeek, archivedLessons]);

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
          const dayName = dayId
            .replace('admin-day-section-', '')
            .replace('master-day-section-', '')
            .replace('history-day-section-', '');
          const matchedDay = daysList.find(d => d.fullDay.toLowerCase() === dayName);
          if (matchedDay) {
            setSelectedDay(matchedDay.fullDay);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const dayElements = document.querySelectorAll('[id^="admin-day-section-"], [id^="master-day-section-"], [id^="history-day-section-"]');
    dayElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [activeTab, activeLessons, masterLessons, archivedLessons, headerHeight]);

  // Auto-scroll to current day of week on initial entry to Lesson Maintenance ONLY
  useEffect(() => {
    if (activeTab !== 'active-weeks') {
      hasAutoScrolledRef.current = false;
      return;
    }

    if (activeTab === 'active-weeks' && !hasAutoScrolledRef.current && activeLessons.length > 0 && headerHeight > 0) {
      const todayIndex = new Date().getDay();
      const currentDayName = daysOfWeek[todayIndex === 0 ? 6 : todayIndex - 1];
      
      const hasCurrentDayLessons = activeLessons.some((lesson) => {
        const d = new Date(lesson.lesson_date + 'T00:00:00');
        return d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }) === currentDayName;
      });

      if (hasCurrentDayLessons) {
        hasAutoScrolledRef.current = true;
        scrollToDay(currentDayName);
      }
    }
  }, [activeTab, activeLessons.length, headerHeight, selectedActiveWeek?.id]);


  async function verifyAdminCode(codeToTest, silent = false) {
    const { data } = await supabase.rpc('verify_admin_passcode', { passcode_input: codeToTest });
    if (data === true) {
      setIsAdminUnlocked(true);
      setAdminPasscode(codeToTest);
      localStorage.setItem('cbe_admin_code', codeToTest);
      fetchMasterPlan();
      fetchActiveWeeks();
      fetchArchivedWeeks();
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
      await fetchMasterPlan();
      setIsMasterModalOpen(false);
      setNewMasterLesson({ day_of_week: 1, start_time: '16:30', title: 'Group Lesson', max_capacity: 4 });
    } else {
      alert('Error adding master training session: ' + (error.message || ''));
    }
  }

  async function handleDeleteMasterLesson(id) {
    if (!confirm('Delete this recurring training session?')) return;
    await supabase.from('master_lessons').delete().eq('id', id);
    fetchMasterPlan();
  }

  async function handleAddMasterRegular(masterLessonId, slotIndex) {
    const name = prompt('Enter regular rider name & last initial:');
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

  function mergeAttendanceCache(lessons) {
    if (!lessons) return [];
    try {
      const stored = JSON.parse(localStorage.getItem('cbe_attendance_cache') || '{}');
      return lessons.map((lesson) => ({
        ...lesson,
        bookings: lesson.bookings?.map((b) => ({
          ...b,
          attendance_status: b.attendance_status || stored[b.id] || 'attended',
        })),
      }));
    } catch {
      return lessons;
    }
  }

  async function fetchActiveLessons(weekId) {
    const { data } = await supabase
      .from('active_lessons')
      .select('*, bookings(*)')
      .eq('active_week_id', weekId)
      .order('lesson_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (data) setActiveLessons(mergeAttendanceCache(data));
  }

  async function fetchArchivedWeeks(includeAll = false) {
    setIsLoadingArchive(true);
    let query = supabase
      .from('active_weeks')
      .select('*')
      .order('week_start_date', { ascending: false });

    if (!includeAll) {
      query = query.eq('is_archived', true);
    }

    const { data } = await query;

    if (data && data.length > 0) {
      setArchivedWeeks(data);
      setSelectedArchivedWeek(data[0]);
      fetchArchivedLessons(data[0].id);
    } else if (!includeAll) {
      // If no archived weeks exist yet in the database, check if any weeks exist at all
      const { data: allWeeks } = await supabase
        .from('active_weeks')
        .select('*')
        .order('week_start_date', { ascending: false });

      if (allWeeks && allWeeks.length > 0) {
        setArchivedWeeks(allWeeks);
        setSelectedArchivedWeek(allWeeks[0]);
        fetchArchivedLessons(allWeeks[0].id);
      } else {
        setArchivedWeeks([]);
        setSelectedArchivedWeek(null);
        setArchivedLessons([]);
      }
    } else {
      setArchivedWeeks([]);
      setSelectedArchivedWeek(null);
      setArchivedLessons([]);
    }
    setIsLoadingArchive(false);
  }

  async function fetchArchivedLessons(weekId) {
    const { data } = await supabase
      .from('active_lessons')
      .select('*, bookings(*)')
      .eq('active_week_id', weekId)
      .order('lesson_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (data) setArchivedLessons(mergeAttendanceCache(data));
  }

  async function handleUpdateAttendance(bookingId, newStatus) {
    // 1. Optimistic UI update across both activeLessons and archivedLessons
    setActiveLessons((prev) =>
      prev.map((l) => ({
        ...l,
        bookings: l.bookings?.map((b) =>
          b.id === bookingId ? { ...b, attendance_status: newStatus } : b
        ),
      }))
    );

    setArchivedLessons((prev) =>
      prev.map((l) => ({
        ...l,
        bookings: l.bookings?.map((b) =>
          b.id === bookingId ? { ...b, attendance_status: newStatus } : b
        ),
      }))
    );

    // 2. Save to local cache
    try {
      const stored = JSON.parse(localStorage.getItem('cbe_attendance_cache') || '{}');
      stored[bookingId] = newStatus;
      localStorage.setItem('cbe_attendance_cache', JSON.stringify(stored));
    } catch (e) {
      // ignore
    }

    // 3. Persist to Supabase
    try {
      await supabase
        .from('bookings')
        .update({ attendance_status: newStatus })
        .eq('id', bookingId);
    } catch (err) {
      console.warn('Attendance update note:', err);
    }
  }

  const monthOptions = useMemo(() => {
    const list = [];
    const now = new Date();
    // Only current month and past 11 months (no future months)
    for (let i = 0; i >= -11; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      list.push({ val, label });
    }
    return list;
  }, []);

  async function fetchMonthlyInvoicingData(yearMonthStr) {
    if (!yearMonthStr) return;
    setIsLoadingInvoice(true);
    const [year, month] = yearMonthStr.split('-');
    const startDate = `${year}-${month}-01`;
    const nextMonthObj = new Date(parseInt(year, 10), parseInt(month, 10), 0);
    const monthEndDate = `${year}-${month}-${String(nextMonthObj.getDate()).padStart(2, '0')}`;

    // Compute today's date in local YYYY-MM-DD
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Effective end date is either month end or today, whichever is earlier
    // (Future lessons that haven't happened yet are never counted)
    const effectiveEndDate = monthEndDate < todayStr ? monthEndDate : todayStr;

    if (startDate > todayStr) {
      setInvoiceLessons([]);
      setIsLoadingInvoice(false);
      return;
    }

    const { data } = await supabase
      .from('active_lessons')
      .select('*, bookings(*)')
      .gte('lesson_date', startDate)
      .lte('lesson_date', effectiveEndDate)
      .order('lesson_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (data) {
      setInvoiceLessons(mergeAttendanceCache(data));
    } else {
      setInvoiceLessons([]);
    }
    setIsLoadingInvoice(false);
  }

  useEffect(() => {
    if (activeTab === 'invoicing') {
      fetchMonthlyInvoicingData(selectedInvoiceMonth);
    }
  }, [activeTab, selectedInvoiceMonth]);

  const riderSummaries = useMemo(() => {
    const map = {};
    invoiceLessons.forEach((lesson) => {
      lesson.bookings?.forEach((b) => {
        const name = b.client_name?.trim();
        if (!name) return;
        if (!map[name]) {
          map[name] = {
            client_name: name,
            attended: 0,
            late_cancel: 0,
            excused: 0,
            billable: 0,
            sessions: [],
          };
        }
        const status = b.attendance_status || 'attended';
        if (status === 'attended') {
          map[name].attended += 1;
          map[name].billable += 1;
        } else if (status === 'late_cancel') {
          map[name].late_cancel += 1;
          map[name].billable += 1;
        } else if (status === 'excused') {
          map[name].excused += 1;
        }
        map[name].sessions.push({
          id: b.id,
          lesson_date: lesson.lesson_date,
          start_time: lesson.start_time,
          title: lesson.title,
          attendance_status: status,
        });
      });
    });

    return Object.values(map).sort((a, b) => a.client_name.localeCompare(b.client_name));
  }, [invoiceLessons]);

  const invoiceTotals = useMemo(() => {
    return riderSummaries.reduce(
      (acc, r) => {
        acc.billable += r.billable;
        acc.attended += r.attended;
        acc.late_cancel += r.late_cancel;
        acc.excused += r.excused;
        return acc;
      },
      { billable: 0, attended: 0, late_cancel: 0, excused: 0 }
    );
  }, [riderSummaries]);

  function toggleRiderExpand(name) {
    setExpandedRiders((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  }

  function formatLessonDateStr(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric', timeZone: 'UTC' });
  }

  function getMonthLabel(yearMonthStr) {
    const [year, month] = yearMonthStr.split('-');
    const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  async function copyRiderSummary(rider) {
    const monthLabel = getMonthLabel(selectedInvoiceMonth);
    let text = `Cherry Blossom Equestrian — ${monthLabel}\n`;
    text += `Rider: ${rider.client_name}\n`;
    text += `Total Billable Lessons: ${rider.billable} (${rider.attended} Attended, ${rider.late_cancel} Late Cancel)\n`;
    if (rider.excused > 0) {
      text += `Excused (Non-billable): ${rider.excused}\n`;
    }
    text += `\nLesson Details:\n`;
    rider.sessions.forEach((s) => {
      const statusLabel = s.attendance_status === 'late_cancel' ? 'Late Cancel' : s.attendance_status === 'excused' ? 'Excused' : 'Attended';
      text += `• ${formatLessonDateStr(s.lesson_date)} @ ${formatTime12Hr(s.start_time)} (${s.title}): ${statusLabel}\n`;
    });

    try {
      await navigator.clipboard.writeText(text);
      setCopiedRider(rider.client_name);
      setTimeout(() => setCopiedRider(null), 2500);
    } catch {
      // fallback
    }
  }

  async function copyAllSummaries() {
    const monthLabel = getMonthLabel(selectedInvoiceMonth);
    let text = `Cherry Blossom Equestrian — Monthly Invoicing Summary (${monthLabel})\n`;
    text += `Total Billable: ${invoiceTotals.billable} | Attended: ${invoiceTotals.attended} | Late Cancel: ${invoiceTotals.late_cancel} | Excused: ${invoiceTotals.excused}\n\n`;
    text += `----------------------------------------\n`;
    riderSummaries.forEach((r) => {
      text += `${r.client_name}: ${r.billable} Billable (${r.attended} Attended, ${r.late_cancel} Late Cancel${r.excused > 0 ? `, ${r.excused} Excused` : ''})\n`;
    });

    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch {
      // fallback
    }
  }

  function exportInvoiceCSV() {
    const headers = ['Rider Name', 'Total Billable Lessons', 'Attended', 'Late Cancel', 'Excused', 'Lesson Details'];
    const rows = riderSummaries.map((r) => {
      const details = r.sessions
        .map((s) => `${s.lesson_date} ${formatTime12Hr(s.start_time)} (${s.attendance_status})`)
        .join('; ');
      return [
        `"${r.client_name.replace(/"/g, '""')}"`,
        r.billable,
        r.attended,
        r.late_cancel,
        r.excused,
        `"${details.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CBE_Invoicing_${selectedInvoiceMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  async function handleAddOneOffLesson() {
    if (!selectedActiveWeek || !newOneOffLesson.lesson_date) return;

    const { error } = await supabase.from('active_lessons').insert([{
      active_week_id: selectedActiveWeek.id,
      lesson_date: newOneOffLesson.lesson_date,
      start_time: newOneOffLesson.start_time || '16:30',
      title: newOneOffLesson.title?.trim() || 'Group Lesson',
      max_capacity: newOneOffLesson.max_capacity || 4
    }]);

    if (!error) {
      await fetchActiveLessons(selectedActiveWeek.id);
      setIsOneOffModalOpen(false);
    } else {
      alert('Error adding one-off session: ' + (error.message || ''));
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
    const name = prompt('Enter rider name & last initial:');
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

  async function handleExecuteRollover() {
    setIsRollingOver(true);
    setRolloverMessage(null);

    try {
      const { data, error } = await supabase.rpc('rollover_active_weeks');

      if (error) {
        console.error('Manual rollover RPC error:', error);
        setRolloverMessage({
          type: 'error',
          text: `Rollover failed: ${error.message || 'Database error occurred while running stored procedure.'}`,
        });
      } else {
        // Refresh active weeks and archive weeks
        await fetchActiveWeeks();
        await fetchArchivedWeeks(showAllWeeksInArchive);
        setShowRolloverConfirm(false);
        setRolloverMessage({
          type: 'success',
          text: data?.message || 'Weekly rollover completed successfully! The 4 active weeks have been advanced.',
        });
      }
    } catch (err) {
      console.error('Rollover error:', err);
      setRolloverMessage({
        type: 'error',
        text: `Rollover error: ${err.message || 'An unexpected error occurred.'}`,
      });
    } finally {
      setIsRollingOver(false);
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

  function handleSwitchTab(tabName) {
    setActiveTab(tabName);
    setSelectedDay('Monday');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  function scrollToDay(dayName) {
    setSelectedDay(dayName);
    const prefix = activeTab === 'master-plan'
      ? 'master-day-section-'
      : activeTab === 'history'
      ? 'history-day-section-'
      : 'admin-day-section-';
    const targetElement = document.getElementById(`${prefix}${dayName.toLowerCase()}`);
    if (targetElement) {
      const mobileOffset = typeof window !== 'undefined' && window.innerWidth < 768 ? 52 : 0;
      const yOffset = -(headerHeight + mobileOffset + 10);
      const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  function formatLessonDateSafe(dateStr, options) {
    if (!dateStr || typeof dateStr !== 'string') return '';
    try {
      const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', options || { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
      }
    } catch {
      // fallback
    }
    return dateStr;
  }

  const activeWeekDatesList = useMemo(() => {
    if (!selectedActiveWeek?.week_start_date) return [];
    const dates = [];
    const [year, month, day] = selectedActiveWeek.week_start_date.split('-').map(Number);
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.UTC(year, month - 1, day + i));
      const dateStr = d.toISOString().split('T')[0];
      const fullDayName = d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
      const monthDayDate = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', timeZone: 'UTC' });
      dates.push({ dateStr, fullDayName, fullDay: fullDayName, monthDayDate, dayIndex: i + 1 });
    }
    return dates;
  }, [selectedActiveWeek?.week_start_date]);

  function openAddOneOffModal(targetDateStr) {
    let dateToUse = typeof targetDateStr === 'string' && targetDateStr ? targetDateStr : '';
    if (!dateToUse) {
      const currentDayName = (selectedDay || 'Monday').toString().toLowerCase();
      const match = (activeWeekDatesList || []).find(d => 
        (d?.fullDayName || d?.fullDay || '').toLowerCase() === currentDayName
      );
      dateToUse = match?.dateStr || activeWeekDatesList?.[0]?.dateStr || selectedActiveWeek?.week_start_date || new Date().toISOString().split('T')[0];
    }
    setNewOneOffLesson({
      lesson_date: dateToUse,
      start_time: '16:30',
      title: 'Group Lesson',
      max_capacity: 4
    });
    setIsOneOffModalOpen(true);
  }

  function openAddMasterModal(targetDayIndex) {
    let dayIdx = typeof targetDayIndex === 'number' ? targetDayIndex : 0;
    if (!dayIdx || dayIdx < 1 || dayIdx > 7) {
      const currentDayName = (selectedDay || 'Monday').toString().toLowerCase();
      const foundIdx = daysOfWeek.findIndex(d => (d || '').toLowerCase() === currentDayName);
      dayIdx = foundIdx !== -1 ? foundIdx + 1 : 1;
    }
    setNewMasterLesson({
      day_of_week: dayIdx,
      start_time: '16:30',
      title: 'Group Lesson',
      max_capacity: 4
    });
    setIsMasterModalOpen(true);
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

  const archivedDaysSet = new Set(
    archivedLessons.map((lesson) => {
      const d = new Date(lesson.lesson_date + 'T00:00:00');
      return d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    })
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

  const groupedArchivedLessons = archivedLessons.reduce((acc, lesson) => {
    if (!acc[lesson.lesson_date]) acc[lesson.lesson_date] = [];
    acc[lesson.lesson_date].push(lesson);
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
            <Lock className="w-5 h-5 text-zinc-900" />
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

        {/* Navigation: Mobile Dropdown View Switcher (< 768px) */}
        <div className="md:hidden">
          <label htmlFor="admin-tab-select" className="sr-only">Select Admin View</label>
          <div className="relative">
            <select
              id="admin-tab-select"
              value={activeTab}
              onChange={(e) => handleSwitchTab(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded-lg py-2 pl-3 pr-9 text-xs font-semibold text-zinc-900 shadow-xs focus:outline-none focus:ring-1 focus:ring-black appearance-none"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              <option value="active-weeks">📅 Lesson Maintenance</option>
              <option value="master-plan">👥 Master Template</option>
              <option value="history">🕰️ Past Weeks Archive</option>
              <option value="invoicing">📊 Monthly Invoicing</option>
              <option value="settings">⚙️ Settings</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Navigation: Desktop Horizontal Tabs (>= 768px) */}
        <div className="hidden md:flex gap-1.5 border-b border-zinc-200 text-xs pb-1 bg-zinc-50 px-1 rounded">
          <button
            onClick={() => handleSwitchTab('active-weeks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
              activeTab === 'active-weeks'
                ? 'bg-black text-[#e8b4b8] font-bold shadow-xs'
                : 'text-zinc-600 hover:text-black hover:bg-zinc-200'
            }`}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            <Calendar className="w-3.5 h-3.5" /> Lesson Maintenance
          </button>
          <button
            onClick={() => handleSwitchTab('master-plan')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
              activeTab === 'master-plan'
                ? 'bg-black text-[#e8b4b8] font-bold shadow-xs'
                : 'text-zinc-600 hover:text-black hover:bg-zinc-200'
            }`}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            <Users className="w-3.5 h-3.5" /> Master Template
          </button>
          <button
            onClick={() => handleSwitchTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
              activeTab === 'history'
                ? 'bg-black text-[#e8b4b8] font-bold shadow-xs'
                : 'text-zinc-600 hover:text-black hover:bg-zinc-200'
            }`}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            <History className="w-3.5 h-3.5" /> Past Weeks Archive
          </button>
          <button
            onClick={() => handleSwitchTab('invoicing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
              activeTab === 'invoicing'
                ? 'bg-black text-[#e8b4b8] font-bold shadow-xs'
                : 'text-zinc-600 hover:text-black hover:bg-zinc-200'
            }`}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            <Receipt className="w-3.5 h-3.5" /> Monthly Invoicing
          </button>
          <button
            onClick={() => handleSwitchTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
              activeTab === 'settings'
                ? 'bg-black text-[#e8b4b8] font-bold shadow-xs'
                : 'text-zinc-600 hover:text-black hover:bg-zinc-200'
            }`}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            <Key className="w-3.5 h-3.5" /> Settings
          </button>
        </div>

        {/* HISTORICAL WEEKS CONTROLS */}
        {activeTab === 'history' && (
          <div className="space-y-1.5 px-1">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-zinc-100 p-2 rounded-lg">
              <div className="flex items-center gap-2 flex-1">
                <label className="text-xs font-semibold text-zinc-700 whitespace-nowrap">Week:</label>
                {archivedWeeks.length > 0 ? (
                  <select
                    value={selectedArchivedWeek?.id || ''}
                    onChange={(e) => {
                      const wk = archivedWeeks.find((w) => w.id === e.target.value);
                      if (wk) {
                        setSelectedArchivedWeek(wk);
                        setSelectedDay('Monday');
                        fetchArchivedLessons(wk.id);
                      }
                    }}
                    className="w-full sm:w-auto flex-1 bg-white border border-zinc-300 rounded px-2.5 py-1.5 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    {archivedWeeks.map((week) => {
                      const d = new Date(week.week_start_date + 'T00:00:00');
                      const formatted = d.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        timeZone: 'UTC',
                      });
                      return (
                        <option key={week.id} value={week.id}>
                          Week of {formatted} {week.is_archived ? '(Archived)' : ''}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <span className="text-xs text-zinc-500 italic">No past weeks found</span>
                )}
              </div>

              {selectedArchivedWeek && (() => {
                const allArchivedBookings = archivedLessons.flatMap((l) => l.bookings || []);
                const attendedCount = allArchivedBookings.filter((b) => (b.attendance_status || 'attended') === 'attended').length;
                const lateCancelCount = allArchivedBookings.filter((b) => b.attendance_status === 'late_cancel').length;
                const excusedCount = allArchivedBookings.filter((b) => b.attendance_status === 'excused').length;
                const billableCount = attendedCount + lateCancelCount;

                return (
                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-1.5 text-[11px]">
                    <span className="bg-emerald-100 text-emerald-950 font-bold px-2 py-0.5 rounded border border-emerald-300">
                      {billableCount} Billable
                    </span>
                    {excusedCount > 0 && (
                      <span className="bg-zinc-200 text-zinc-700 font-medium px-1.5 py-0.5 rounded">
                        {excusedCount} Excused
                      </span>
                    )}
                    <span className="bg-zinc-100 text-zinc-600 font-medium px-1.5 py-0.5 rounded border border-zinc-200">
                      {archivedLessons.length} {archivedLessons.length === 1 ? 'Session' : 'Sessions'}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Day Quick Jump Navigation */}
            <div className="flex justify-between gap-1">
              {daysList.map((day) => {
                const hasLessons = archivedDaysSet.has(day.fullDay);
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
                      hasAutoScrolledRef.current = false;
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

            <div className="flex items-center gap-1.5">
              <div className="flex-1 flex justify-between gap-1">
                {daysList.map((day) => {
                  const hasLessons = activeDaysSet.has(day.fullDay);
                  const isDaySelected = selectedDay === day.fullDay;

                  return (
                    <button
                      key={day.label}
                      onClick={() => scrollToDay(day.fullDay)}
                      className={`flex-1 py-1 rounded text-xs font-bold transition text-center shadow-xs border ${
                        isDaySelected
                          ? 'bg-black text-[#e8b4b8] border-black'
                          : hasLessons
                          ? 'bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-100'
                          : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:bg-zinc-100'
                      }`}
                      title={hasLessons ? `${day.fullDay} (has sessions)` : `${day.fullDay} (no sessions scheduled)`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => openAddOneOffModal()}
                className="flex items-center gap-1 px-2.5 py-1 bg-black hover:bg-zinc-800 active:bg-zinc-900 text-[#e8b4b8] font-bold text-xs rounded border border-black shadow-2xs transition shrink-0 cursor-pointer"
                title="Add session to schedule"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Session</span>
              </button>
            </div>
          </div>
        )}

        {/* MASTER TEMPLATE DAY JUMP BAR */}
        {activeTab === 'master-plan' && (
          <div className="flex items-center gap-1.5 px-1">
            <div className="flex-1 flex justify-between gap-1">
              {daysList.map((day) => {
                const hasLessons = masterDaysSet.has(day.fullDay);
                const isDaySelected = selectedDay === day.fullDay;

                return (
                  <button
                    key={day.label}
                    onClick={() => scrollToDay(day.fullDay)}
                    className={`flex-1 py-1 rounded text-xs font-bold transition text-center shadow-xs border ${
                      isDaySelected
                        ? 'bg-black text-[#e8b4b8] border-black'
                        : hasLessons
                        ? 'bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-100'
                        : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:bg-zinc-100'
                    }`}
                    title={hasLessons ? `${day.fullDay} (has recurring sessions)` : `${day.fullDay} (empty)`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => openAddMasterModal()}
              className="flex items-center gap-1 px-2.5 py-1 bg-black hover:bg-zinc-800 active:bg-zinc-900 text-[#e8b4b8] font-bold text-xs rounded border border-black shadow-2xs transition shrink-0 cursor-pointer"
              title="Add recurring session to template"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Recurring</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: LESSON MAINTENANCE */}
      {activeTab === 'active-weeks' && (
        <div className="space-y-6 pt-1">
          {/* Grouped Daily Lessons */}
          <div className="space-y-6">
            {activeWeekDatesList.map(({ dateStr, fullDayName, monthDayDate }) => {
              const dayLessons = groupedActiveLessons[dateStr] || [];

              return (
                <div
                  key={dateStr}
                  id={`admin-day-section-${fullDayName.toLowerCase()}`}
                  className="space-y-2"
                >
                  <div
                    className="sticky z-20 bg-white/95 backdrop-blur-xs border-y border-zinc-200 border-l-4 border-l-[#e8b4b8] px-3.5 py-1.5 shadow-2xs flex justify-between items-center rounded-sm top-[calc(52px+var(--header-height,0px))] md:top-[var(--header-height,0px)]"
                    style={{ '--header-height': `${headerHeight}px` }}
                  >
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-xs font-bold text-zinc-900 uppercase tracking-wider"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {fullDayName} — {monthDayDate}
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                        {dayLessons.length} {dayLessons.length === 1 ? 'Session' : 'Sessions'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openAddOneOffModal(dateStr)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-black text-[#e8b4b8] hover:bg-zinc-800 active:bg-zinc-900 rounded text-[11px] font-bold shadow-2xs transition shrink-0 cursor-pointer"
                      title={`Add session to ${fullDayName}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Session</span>
                    </button>
                  </div>

                  {dayLessons.length === 0 ? (
                    <div className="border border-dashed border-zinc-300 rounded-lg p-3.5 text-center bg-zinc-50/60 mx-1">
                      <span className="text-xs text-zinc-500">No sessions scheduled for {fullDayName}.</span>
                      <button
                        type="button"
                        onClick={() => openAddOneOffModal(dateStr)}
                        className="ml-2 text-xs font-semibold text-zinc-900 hover:underline cursor-pointer"
                      >
                        + Add session
                      </button>
                    </div>
                  ) : (
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
                                className="text-[11px] border border-zinc-200 rounded px-1.5 py-0.5 bg-zinc-50 focus:bg-white focus:border-zinc-400 w-28 transition"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            {Array.from({ length: lesson.max_capacity }).map((_, idx) => {
                              const slotNum = idx + 1;
                              const booking = bookedMap[slotNum];

                              return (
                                <div key={slotNum} className="flex justify-between items-center text-xs p-1.5 rounded bg-zinc-50 border gap-1.5">
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    <span className="text-zinc-400 font-mono text-[11px] shrink-0">{slotNum}.</span>
                                    <span className="font-medium text-xs truncate">
                                      {booking ? booking.client_name : <span className="text-zinc-400 italic font-normal">Empty Slot</span>}
                                    </span>
                                  </div>

                                  {booking ? (
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <select
                                        value={booking.attendance_status || 'attended'}
                                        onChange={(e) => handleUpdateAttendance(booking.id, e.target.value)}
                                        className={`text-[10px] font-semibold rounded px-1.5 py-0.5 border cursor-pointer focus:outline-none transition ${
                                          (booking.attendance_status || 'attended') === 'attended'
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                            : booking.attendance_status === 'late_cancel'
                                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                                            : 'bg-zinc-100 text-zinc-700 border-zinc-300'
                                        }`}
                                      >
                                        <option value="attended">✓ Attended</option>
                                        <option value="late_cancel">✕ Late Cancel</option>
                                        <option value="excused">○ Excused</option>
                                      </select>
                                      <button
                                        onClick={() => handleAdminRemoveBooking(booking.id)}
                                        className="text-red-500 hover:text-red-700 p-0.5"
                                        title="Remove student"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleAdminAddBooking(lesson.id, slotNum)}
                                      className="text-zinc-700 hover:text-black font-semibold text-[11px] flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 px-2 py-0.5 rounded border border-zinc-200 transition shrink-0 cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" /> Assign
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Card Footer: Delete this lesson */}
                          <div className="pt-1.5 border-t border-zinc-100 flex justify-end">
                            <button
                              onClick={() => handleDeleteActiveLesson(lesson.id)}
                              className="text-[11px] text-zinc-400 hover:text-red-600 transition flex items-center gap-1 font-medium py-0.5 px-1 rounded hover:bg-red-50"
                              title="Delete this lesson"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete this lesson</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* TAB 2: MASTER PLAN TEMPLATE */}
      {activeTab === 'master-plan' && (
        <div className="space-y-6 pt-2">
          {/* Grouped Master Lessons */}
          <div className="space-y-6">
            {daysOfWeek.map((dayName, dayIdx) => {
              const dayLessons = groupedMasterLessons[dayName] || [];

              return (
                <div key={dayName} id={`master-day-section-${dayName.toLowerCase()}`} className="space-y-2">
                  <div
                    className="sticky z-20 bg-white/95 backdrop-blur-xs border-y border-zinc-200 border-l-4 border-l-[#e8b4b8] px-3.5 py-1.5 shadow-2xs flex justify-between items-center rounded-sm top-[calc(52px+var(--header-height,0px))] md:top-[var(--header-height,0px)]"
                    style={{ '--header-height': `${headerHeight}px` }}
                  >
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-xs font-bold text-zinc-900 uppercase tracking-wider"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {dayName}
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                        {dayLessons.length} {dayLessons.length === 1 ? 'Recurring Session' : 'Recurring Sessions'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openAddMasterModal(dayIdx + 1)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-black text-[#e8b4b8] hover:bg-zinc-800 active:bg-zinc-900 rounded text-[11px] font-bold shadow-2xs transition shrink-0 cursor-pointer"
                      title={`Add recurring session to ${dayName}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Session</span>
                    </button>
                  </div>

                  {dayLessons.length === 0 ? (
                    <div className="border border-dashed border-zinc-300 rounded-lg p-3.5 text-center bg-zinc-50/60 mx-1">
                      <span className="text-xs text-zinc-500">No recurring sessions scheduled on {dayName}.</span>
                      <button
                        type="button"
                        onClick={() => openAddMasterModal(dayIdx + 1)}
                        className="ml-2 text-xs font-semibold text-zinc-900 hover:underline cursor-pointer"
                      >
                        + Add session
                      </button>
                    </div>
                  ) : (
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
                                      className="text-zinc-700 hover:text-black font-semibold text-xs flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 px-2 py-0.5 rounded border border-zinc-200 transition cursor-pointer"
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
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: PAST WEEKS ARCHIVE */}
      {activeTab === 'history' && (
        <div className="space-y-6 pt-1">
          {/* Top Search & Filter Bar */}
          <div className="bg-white border rounded-lg p-3 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search rider name in this week..."
                value={archiveSearchTerm}
                onChange={(e) => setArchiveSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs border border-zinc-300 rounded-md bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
              {archiveSearchTerm && (
                <button
                  onClick={() => setArchiveSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 text-xs p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-zinc-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Archived Schedule</span>
            </div>
          </div>

          {isLoadingArchive ? (
            <div className="bg-white border rounded-lg p-8 text-center text-zinc-500 text-sm shadow-xs">
              Loading past weeks archive...
            </div>
          ) : archivedWeeks.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-6 sm:p-8 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-zinc-900 text-[#e8b4b8] flex items-center justify-center mx-auto shadow-2xs">
                <History className="w-6 h-6" />
              </div>
              <h3
                className="text-base font-bold text-zinc-900"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                No Archived Past Weeks Yet
              </h3>
              <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
                As training weeks conclude and roll over, their full schedules, lesson rosters, and rider bookings are permanently archived here for your historical records and invoicing reconciliation.
              </p>
            </div>
          ) : !selectedArchivedWeek ? (
            <div className="bg-white border rounded-lg p-6 text-center text-zinc-500 text-xs shadow-xs">
              Please select a past week above to view its schedule and roster.
            </div>
          ) : archivedLessons.length === 0 ? (
            <div className="bg-white border rounded-lg p-6 text-center text-zinc-500 text-xs shadow-xs">
              No lessons were recorded for the selected week.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(groupedArchivedLessons).map((dateStr) => {
                const dayLessons = groupedArchivedLessons[dateStr];
                const lessonDateObj = new Date(dateStr + 'T00:00:00');
                const fullDayName = lessonDateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
                const monthDayDate = lessonDateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', timeZone: 'UTC' });

                // Filter sessions by search term if active
                const filteredLessons = archiveSearchTerm.trim() === ''
                  ? dayLessons
                  : dayLessons.filter((lesson) =>
                      lesson.bookings?.some((b) =>
                        b.client_name?.toLowerCase().includes(archiveSearchTerm.toLowerCase().trim())
                      )
                    );

                if (filteredLessons.length === 0 && archiveSearchTerm.trim() !== '') {
                  return null;
                }

                return (
                  <div
                    key={dateStr}
                    id={`history-day-section-${fullDayName.toLowerCase()}`}
                    className="space-y-2"
                  >
                    <div
                      className="sticky z-20 bg-zinc-100/95 backdrop-blur-xs border-y border-zinc-300 px-3 py-1.5 shadow-xs flex justify-between items-center rounded-sm top-[calc(52px+var(--header-height,0px))] md:top-[var(--header-height,0px)]"
                      style={{ '--header-height': `${headerHeight}px` }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {fullDayName} — {monthDayDate}
                        </span>
                        <span className="text-[10px] bg-zinc-200 text-zinc-700 font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider">
                          Historical
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-600 font-medium">
                        {filteredLessons.length} {filteredLessons.length === 1 ? 'Session' : 'Sessions'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-1">
                      {filteredLessons.map((lesson) => {
                        const bookedMap = {};
                        lesson.bookings?.forEach((b) => { bookedMap[b.slot_index] = b; });
                        const bookedCount = lesson.bookings?.length || 0;
                        const isSearching = archiveSearchTerm.trim() !== '';
                        const displayedBookings = isSearching
                          ? (lesson.bookings || []).filter((b) =>
                              b.client_name?.toLowerCase().includes(archiveSearchTerm.toLowerCase().trim())
                            )
                          : (lesson.bookings || []);

                        return (
                          <div
                            key={lesson.id}
                            className="border rounded-lg p-3 bg-white shadow-xs space-y-2"
                          >
                            <div className="flex justify-between items-center border-b pb-1.5 gap-2">
                              <div>
                                <h3
                                  className="text-base font-normal text-zinc-900"
                                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                                >
                                  {formatTime12Hr(lesson.start_time)} - {lesson.title}
                                </h3>
                                <span className="text-[10px] text-zinc-500 font-medium">
                                  {isSearching
                                    ? `${displayedBookings.length} matched`
                                    : `${bookedCount} ${bookedCount === 1 ? 'rider' : 'riders'}`}
                                </span>
                              </div>

                              {lesson.admin_note && (
                                <span className="text-[10px] bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded border border-zinc-200 font-medium">
                                  {lesson.admin_note}
                                </span>
                              )}
                            </div>

                            <div className="space-y-1">
                              {displayedBookings.length > 0 ? (
                                displayedBookings.map((booking, bIdx) => (
                                  <div
                                    key={booking.id || bIdx}
                                    className={`flex justify-between items-center text-xs p-1.5 rounded border ${
                                      isSearching
                                        ? 'bg-[#fcf5f6] border-[#e8b4b8] font-semibold shadow-xs'
                                        : 'bg-zinc-50 border-zinc-200'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-zinc-400 font-mono text-[11px]">{bIdx + 1}.</span>
                                      <span className={`text-xs ${isSearching ? 'text-zinc-950 font-bold' : 'text-zinc-900 font-medium'}`}>
                                        {booking.client_name}
                                      </span>
                                    </div>

                                    <select
                                      value={booking.attendance_status || 'attended'}
                                      onChange={(e) => handleUpdateAttendance(booking.id, e.target.value)}
                                      className={`text-[10px] font-semibold rounded px-1.5 py-0.5 border cursor-pointer focus:outline-none transition ${
                                        (booking.attendance_status || 'attended') === 'attended'
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                          : booking.attendance_status === 'late_cancel'
                                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                                          : 'bg-zinc-100 text-zinc-700 border-zinc-300'
                                      }`}
                                    >
                                      <option value="attended">✓ Attended</option>
                                      <option value="late_cancel">✕ Late Cancel</option>
                                      <option value="excused">○ Excused</option>
                                    </select>
                                  </div>
                                ))
                              ) : (
                                <div className="text-[11px] text-zinc-400 italic py-1 px-1 bg-zinc-50 rounded border border-dashed border-zinc-200 text-center">
                                  No riders booked for this session
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MONTHLY INVOICING SUMMARY */}
      {activeTab === 'invoicing' && (
        <div className="space-y-4 pt-1">
          {/* Top Controls: Month Selector, Search & Export Actions */}
          <div className="bg-white border border-zinc-200 rounded-xl p-3 md:p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <label htmlFor="invoice-month-select" className="text-xs font-bold text-zinc-700 whitespace-nowrap uppercase tracking-wider">
                  Billing Month:
                </label>
                <div className="relative">
                  <select
                    id="invoice-month-select"
                    value={selectedInvoiceMonth}
                    onChange={(e) => setSelectedInvoiceMonth(e.target.value)}
                    className="bg-zinc-50 border border-zinc-300 rounded-lg py-1.5 pl-3 pr-8 text-xs font-semibold text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {monthOptions.map((m) => (
                      <option key={m.val} value={m.val}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={exportInvoiceCSV}
                  disabled={riderSummaries.length === 0}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg border border-zinc-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={copyAllSummaries}
                  disabled={riderSummaries.length === 0}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-black text-[#e8b4b8] hover:bg-zinc-800 rounded-lg shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? 'Copied All!' : 'Copy Summary'}</span>
                </button>
              </div>
            </div>

            {/* Rider Search Filter */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search rider name in this monthly invoice..."
                value={invoiceSearchTerm}
                onChange={(e) => setInvoiceSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs border border-zinc-300 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
              {invoiceSearchTerm && (
                <button
                  onClick={() => setInvoiceSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 text-xs p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Monthly Grand Totals Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl shadow-2xs">
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-lg p-2 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                Total Billable
              </span>
              <span className="text-lg font-bold text-emerald-950">
                {invoiceTotals.billable}
              </span>
              <span className="text-[10px] text-emerald-700 block font-medium">lessons</span>
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg p-2 text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider block">
                Attended
              </span>
              <span className="text-lg font-bold text-zinc-900">
                {invoiceTotals.attended}
              </span>
              <span className="text-[10px] text-zinc-500 block">present</span>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/80 rounded-lg p-2 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-800 tracking-wider block">
                Late Cancel
              </span>
              <span className="text-lg font-bold text-rose-950">
                {invoiceTotals.late_cancel}
              </span>
              <span className="text-[10px] text-rose-700 block font-medium">billed</span>
            </div>

            <div className="bg-zinc-100 border border-zinc-200 rounded-lg p-2 text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider block">
                Excused
              </span>
              <span className="text-lg font-bold text-zinc-800">
                {invoiceTotals.excused}
              </span>
              <span className="text-[10px] text-zinc-500 block">no charge</span>
            </div>
          </div>

          {/* Rider Breakdown Accordion Cards */}
          {isLoadingInvoice ? (
            <div className="text-center py-10 bg-white border rounded-xl shadow-xs text-xs text-zinc-500">
              Loading {getMonthLabel(selectedInvoiceMonth)} records...
            </div>
          ) : riderSummaries.length === 0 ? (
            <div className="text-center py-12 bg-white border border-dashed rounded-xl shadow-xs space-y-1.5 p-4">
              <Receipt className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="text-sm font-semibold text-zinc-800" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                No Bookings Found for {getMonthLabel(selectedInvoiceMonth)}
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                No active or archived lessons with booked riders were found in this calendar month.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1 text-xs text-zinc-500">
                <span>
                  Showing {riderSummaries.filter((r) => invoiceSearchTerm.trim() === '' || r.client_name.toLowerCase().includes(invoiceSearchTerm.toLowerCase().trim())).length} of {riderSummaries.length} Riders
                </span>
                <span className="text-[11px] italic text-zinc-400">
                  Tap rider card to view lesson dates
                </span>
              </div>

              {riderSummaries
                .filter((r) => invoiceSearchTerm.trim() === '' || r.client_name.toLowerCase().includes(invoiceSearchTerm.toLowerCase().trim()))
                .map((rider) => {
                  const isExpanded = !!expandedRiders[rider.client_name];
                  const isCopied = copiedRider === rider.client_name;

                  return (
                    <div
                      key={rider.client_name}
                      className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden transition"
                    >
                      {/* Compact Header Bar */}
                      <button
                        type="button"
                        onClick={() => toggleRiderExpand(rider.client_name)}
                        className="w-full text-left p-3.5 flex items-center justify-between gap-2 hover:bg-zinc-50 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span
                            className="font-normal text-base text-zinc-900 truncate"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                          >
                            {rider.client_name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Billable pill */}
                          <span className="bg-emerald-100 text-emerald-950 font-bold px-2 py-0.5 rounded text-xs border border-emerald-300">
                            {rider.billable} {rider.billable === 1 ? 'Lesson' : 'Lessons'}
                          </span>

                          {/* Quick breakdown label (hidden on smallest screens if needed) */}
                          <span className="hidden sm:inline text-[11px] text-zinc-500 font-medium">
                            ({rider.attended} attended{rider.late_cancel > 0 ? `, ${rider.late_cancel} late cancel` : ''}{rider.excused > 0 ? `, ${rider.excused} excused` : ''})
                          </span>

                          <div className="text-zinc-400 pl-1">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-zinc-100 bg-zinc-50/60 p-3.5 space-y-3">
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                              Sessions in {getMonthLabel(selectedInvoiceMonth)}:
                            </span>

                            {rider.sessions.map((session, sIdx) => (
                              <div
                                key={session.id || sIdx}
                                className="flex justify-between items-center text-xs p-2 rounded-lg bg-white border border-zinc-200 shadow-2xs gap-2"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-zinc-400 font-mono text-[11px] shrink-0">
                                    {sIdx + 1}.
                                  </span>
                                  <div className="truncate">
                                    <span className="font-semibold text-zinc-800">
                                      {formatLessonDateStr(session.lesson_date)}
                                    </span>
                                    <span className="text-zinc-500 text-[11px] ml-1.5">
                                      {formatTime12Hr(session.start_time)} • {session.title}
                                    </span>
                                  </div>
                                </div>

                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                                    session.attendance_status === 'attended'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : session.attendance_status === 'late_cancel'
                                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                                      : 'bg-zinc-100 text-zinc-700 border-zinc-300'
                                  }`}
                                >
                                  {session.attendance_status === 'attended'
                                    ? '✓ Attended'
                                    : session.attendance_status === 'late_cancel'
                                    ? '✕ Late Cancel'
                                    : '○ Excused'}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Footer Action: Copy Message for Parent */}
                          <div className="pt-2 border-t border-zinc-200/80 flex items-center justify-between">
                            <span className="text-[11px] text-zinc-500">
                              Total Due: <strong className="text-zinc-900">{rider.billable} billable {rider.billable === 1 ? 'lesson' : 'lessons'}</strong>
                            </span>

                            <button
                              onClick={() => copyRiderSummary(rider)}
                              className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 shadow-2xs transition"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-zinc-600" />
                                  <span>Copy Message</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-xl mt-2">
          {/* Card 1: Passcode */}
          <div className="bg-white border rounded-lg p-6 space-y-4 shadow-xs">
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

          {/* Card 2: Test & Dev Environment Tool - ONLY shown in Dev / Test environments */}
          {(currentEnv === 'test' || currentEnv === 'dev') && (
            <div className="bg-white border border-zinc-200 rounded-lg p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  {currentEnv === 'test' ? 'Test Environment Tool' : 'Dev Preview Tool'}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Hidden on Live Site
                </span>
              </div>

              <div>
                <h3
                  className="font-bold text-lg text-zinc-900"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Advance Weekly Rollover
                </h3>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                  Vercel only triggers the automatic weekly cron job in Production. Use this button to manually roll forward the 4 active weeks here in your {currentEnv === 'test' ? 'test' : 'dev'} database.
                </p>
              </div>

              {/* Current Active Weeks Badge List */}
              <div className="bg-zinc-50 border border-zinc-200 rounded p-3 text-xs space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block">
                  Current 4 Active Weeks in this DB:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeWeeks.length > 0 ? (
                    activeWeeks.map((week) => {
                      const d = new Date(week.week_start_date + 'T00:00:00');
                      const label = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', timeZone: 'UTC' });
                      return (
                        <span
                          key={week.id}
                          className="px-2 py-0.5 bg-white border border-zinc-300 rounded font-mono text-zinc-800 font-semibold text-[11px]"
                        >
                          Wk. {label}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-zinc-400 italic">No active weeks loaded</span>
                  )}
                </div>
              </div>

              {/* Status / Feedback message */}
              {rolloverMessage && (
                <div
                  className={`p-3 rounded text-xs flex items-start gap-2 ${
                    rolloverMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                      : 'bg-red-50 text-red-900 border border-red-300'
                  }`}
                >
                  {rolloverMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span className="font-medium">{rolloverMessage.text}</span>
                </div>
              )}

              {/* Action Button & Confirmation */}
              <div>
                {showRolloverConfirm ? (
                  <div className="p-4 bg-zinc-50 border border-zinc-300 rounded-lg space-y-3 shadow-xs">
                    <div className="flex items-start gap-2 text-xs text-zinc-900 font-medium">
                      <AlertCircle className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm text-zinc-900">Confirm Weekly Rollover?</p>
                        <p className="text-zinc-600 mt-1 text-xs leading-relaxed">
                          This will archive the oldest active week ({activeWeeks[0] ? `Wk. ${new Date(activeWeeks[0].week_start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', timeZone: 'UTC' })}` : 'earliest week'}), shift active weeks forward, and generate the next week from your Master Template.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleExecuteRollover}
                        disabled={isRollingOver}
                        className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-zinc-800 disabled:opacity-50 text-[#e8b4b8] rounded-md font-bold text-xs shadow-xs transition cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRollingOver ? 'animate-spin' : ''}`} />
                        <span>{isRollingOver ? 'Advancing Weeks...' : 'Yes, Advance Weeks Now'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRolloverConfirm(false)}
                        disabled={isRollingOver}
                        className="px-3.5 py-2 bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-700 rounded-md text-xs font-semibold shadow-2xs transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setRolloverMessage(null);
                        setShowRolloverConfirm(true);
                      }}
                      disabled={isRollingOver}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 active:bg-zinc-900 disabled:opacity-50 text-[#e8b4b8] text-xs sm:text-sm px-4 py-2.5 rounded-lg font-bold transition shadow-2xs border border-black cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Run Weekly Rollover Now</span>
                    </button>
                    <p className="text-[11px] text-zinc-500 mt-2">
                      Archives the oldest week, shifts existing weeks forward, and populates the new 4th week from your Master Template.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD ONE-OFF SESSION (Lesson Maintenance) */}
      {isOneOffModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsOneOffModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-zinc-200 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-zinc-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3
                  className="font-bold text-base text-[#e8b4b8]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Add One-Off Training Session
                </h3>
                <p className="text-[11px] text-zinc-400">
                  {selectedActiveWeek ? `Week of ${formatLessonDateSafe(selectedActiveWeek.week_start_date, { month: 'short', day: 'numeric', timeZone: 'UTC' })}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOneOffModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-md transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Date */}
              <div>
                <label className="font-bold text-zinc-700 block mb-1">
                  Session Date:
                </label>
                <input
                  type="date"
                  value={newOneOffLesson.lesson_date}
                  onChange={(e) => setNewOneOffLesson({ ...newOneOffLesson, lesson_date: e.target.value })}
                  className="w-full border border-zinc-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
                {newOneOffLesson.lesson_date && (
                  <span className="text-[11px] text-zinc-500 font-medium mt-1 block">
                    {formatLessonDateSafe(newOneOffLesson.lesson_date, { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                  </span>
                )}
              </div>

              {/* Time */}
              <div>
                <label className="font-bold text-zinc-700 block mb-1">
                  Start Time:
                </label>
                <input
                  type="time"
                  value={newOneOffLesson.start_time}
                  onChange={(e) => setNewOneOffLesson({ ...newOneOffLesson, start_time: e.target.value })}
                  className="w-full border border-zinc-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Title & Quick Chips */}
              <div>
                <label className="font-bold text-zinc-700 block mb-1">
                  Session Title:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Group Lesson, Private Lesson"
                  value={newOneOffLesson.title}
                  onChange={(e) => setNewOneOffLesson({ ...newOneOffLesson, title: e.target.value })}
                  className="w-full border border-zinc-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['Group Lesson', 'Private Lesson'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        const cap = chip.includes('Private') ? 1 : 4;
                        setNewOneOffLesson({ ...newOneOffLesson, title: chip, max_capacity: cap });
                      }}
                      className={`px-3 py-1 border rounded-full text-xs font-medium transition cursor-pointer ${
                        newOneOffLesson.title === chip
                          ? 'bg-black text-[#e8b4b8] border-black font-semibold'
                          : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800'
                      }`}
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capacity */}
              <div>
                <label className="font-bold text-zinc-700 block mb-1">
                  Max Capacity (Rider Slots):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={newOneOffLesson.max_capacity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (isNaN(val)) setNewOneOffLesson({ ...newOneOffLesson, max_capacity: '' });
                      else setNewOneOffLesson({ ...newOneOffLesson, max_capacity: Math.min(9, Math.max(1, val)) });
                    }}
                    className="w-14 text-center border border-zinc-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map((cap) => (
                      <button
                        key={cap}
                        type="button"
                        onClick={() => setNewOneOffLesson({ ...newOneOffLesson, max_capacity: cap })}
                        className={`w-8 h-8 rounded border text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                          Number(newOneOffLesson.max_capacity) === cap
                            ? 'bg-black text-[#e8b4b8] border-black font-bold'
                            : 'bg-zinc-50 border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        {cap}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-zinc-50 px-5 py-3.5 border-t border-zinc-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOneOffModalOpen(false)}
                className="px-4 py-2 border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddOneOffLesson}
                className="px-5 py-2 bg-black text-[#e8b4b8] rounded-lg text-xs font-bold hover:bg-zinc-800 shadow-xs transition cursor-pointer"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Add Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD RECURRING SESSION (Master Template) */}
      {isMasterModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsMasterModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-zinc-200 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-zinc-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3
                  className="font-bold text-base text-[#e8b4b8]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Add Recurring Training Session
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Master Template • Populates on weekly rollovers
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMasterModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-md transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Day of Week */}
              <div>
                <label className="font-bold text-zinc-700 block mb-1">
                  Day of Week:
                </label>
                <select
                  value={newMasterLesson.day_of_week}
                  onChange={(e) => setNewMasterLesson({ ...newMasterLesson, day_of_week: parseInt(e.target.value, 10) })}
                  className="w-full border border-zinc-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {daysOfWeek.map((day, idx) => (
                    <option key={day} value={idx + 1}>{day}</option>
                  ))}
                </select>
              </div>

              {/* Time */}
              <div>
                <label className="font-bold text-zinc-700 block mb-1">
                  Start Time:
                </label>
                <input
                  type="time"
                  value={newMasterLesson.start_time}
                  onChange={(e) => setNewMasterLesson({ ...newMasterLesson, start_time: e.target.value })}
                  className="w-full border border-zinc-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Title & Quick Chips */}
              <div>
                <label className="font-bold text-zinc-700 block mb-1">
                  Session Title:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Group Lesson, Private Lesson"
                  value={newMasterLesson.title}
                  onChange={(e) => setNewMasterLesson({ ...newMasterLesson, title: e.target.value })}
                  className="w-full border border-zinc-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['Group Lesson', 'Private Lesson'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        const cap = chip.includes('Private') ? 1 : 4;
                        setNewMasterLesson({ ...newMasterLesson, title: chip, max_capacity: cap });
                      }}
                      className={`px-3 py-1 border rounded-full text-xs font-medium transition cursor-pointer ${
                        newMasterLesson.title === chip
                          ? 'bg-black text-[#e8b4b8] border-black font-semibold'
                          : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800'
                      }`}
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capacity */}
              <div>
                <label className="font-bold text-zinc-700 block mb-1">
                  Max Capacity (Rider Slots):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={newMasterLesson.max_capacity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (isNaN(val)) setNewMasterLesson({ ...newMasterLesson, max_capacity: '' });
                      else setNewMasterLesson({ ...newMasterLesson, max_capacity: Math.min(9, Math.max(1, val)) });
                    }}
                    className="w-14 text-center border border-zinc-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map((cap) => (
                      <button
                        key={cap}
                        type="button"
                        onClick={() => setNewMasterLesson({ ...newMasterLesson, max_capacity: cap })}
                        className={`w-8 h-8 rounded border text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                          Number(newMasterLesson.max_capacity) === cap
                            ? 'bg-black text-[#e8b4b8] border-black font-bold'
                            : 'bg-zinc-50 border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        {cap}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-zinc-50 px-5 py-3.5 border-t border-zinc-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsMasterModalOpen(false)}
                className="px-4 py-2 border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddMasterLesson}
                className="px-5 py-2 bg-black text-[#e8b4b8] rounded-lg text-xs font-bold hover:bg-zinc-800 shadow-xs transition cursor-pointer"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Add Recurring Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
