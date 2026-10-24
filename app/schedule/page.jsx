import ScheduleView from '../../components/ScheduleView';

export const metadata = {
  title: 'Lesson Schedule | Cherry Blossom Equestrian',
};

export default function SchedulePage() {
  return (
    <main className="min-h-screen bg-zinc-50 py-8">
      <ScheduleView />
    </main>
  );
}
