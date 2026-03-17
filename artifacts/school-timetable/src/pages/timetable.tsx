import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock } from "lucide-react";

interface SchoolItem { id: number; name: string; }
interface ClassItem { id: number; grade: string; sections: string; }
interface TimetableEntry {
  id: number; classId: number; className?: string; teacherId: number; teacherName?: string;
  section: string; subject: string; dayOfWeek: string; startTime: string; endTime: string; room?: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const COLORS: Record<string, string> = {
  Monday: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border-blue-200 dark:border-blue-800",
  Tuesday: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 border-purple-200 dark:border-purple-800",
  Wednesday: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800",
  Thursday: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 border-amber-200 dark:border-amber-800",
  Friday: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200 border-rose-200 dark:border-rose-800",
  Saturday: "bg-slate-100 text-slate-800 dark:bg-slate-800/30 dark:text-slate-200 border-slate-200 dark:border-slate-700",
};

export default function TimetablePage() {
  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSection, setSelectedSection] = useState<string>("all");

  useEffect(() => {
    fetch("/api/schools", { credentials: "include" })
      .then(r => r.json())
      .then((list: SchoolItem[]) => {
        setSchools(list);
        if (list.length > 0) setSelectedSchool(String(list[0].id));
      });
  }, []);

  useEffect(() => {
    if (!selectedSchool) return;
    setSelectedClass("all"); setSelectedSection("all");
    fetch(`/api/schools/${selectedSchool}/classes`, { credentials: "include" })
      .then(r => r.json()).then(setClasses);
    fetch(`/api/schools/${selectedSchool}/timetable`, { credentials: "include" })
      .then(r => r.json()).then(setEntries);
  }, [selectedSchool]);

  const selectedClassItem = classes.find(c => c.id === Number(selectedClass));
  const availableSections = selectedClassItem ? selectedClassItem.sections.split(",").map(s => s.trim()) : [];

  const filtered = entries.filter(e => {
    if (selectedClass !== "all" && e.classId !== Number(selectedClass)) return false;
    if (selectedSection !== "all" && e.section !== selectedSection) return false;
    return true;
  });

  const byDay = DAYS.reduce((acc, day) => {
    acc[day] = filtered.filter(e => e.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<string, TimetableEntry[]>);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Timetable</h1>
        <p className="text-muted-foreground mt-1">View weekly timetable by school, class, and section</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="space-y-1 min-w-[180px]">
          <label className="text-sm font-medium">School</label>
          <Select value={selectedSchool} onValueChange={setSelectedSchool}>
            <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
            <SelectContent>
              {schools.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 min-w-[180px]">
          <label className="text-sm font-medium">Class</label>
          <Select value={selectedClass} onValueChange={v => { setSelectedClass(v); setSelectedSection("all"); }}>
            <SelectTrigger><SelectValue placeholder="All classes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.grade}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {selectedClass !== "all" && (
          <div className="space-y-1 min-w-[180px]">
            <label className="text-sm font-medium">Section</label>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {availableSections.map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {!selectedSchool ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Select a school to view the timetable.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No timetable entries for the selected filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {DAYS.filter(d => byDay[d].length > 0).map(day => (
            <Card key={day}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{day}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {byDay[day].map(entry => (
                  <div key={entry.id} className={`p-3 rounded-lg border text-sm ${COLORS[day] || ""}`}>
                    <p className="font-semibold">{entry.subject}</p>
                    <p className="text-xs opacity-80 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />{entry.startTime} – {entry.endTime}
                    </p>
                    <p className="text-xs opacity-80">{entry.className} · Sec {entry.section}</p>
                    <p className="text-xs opacity-80">{entry.teacherName}</p>
                    {entry.room && <p className="text-xs opacity-70">Room: {entry.room}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
