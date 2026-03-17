import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, Calendar, Plus, Pencil, Trash2, ArrowLeft, Clock } from "lucide-react";

interface School {
  id: number; name: string; address?: string; gradeType: string;
  minGrade: number; maxGrade: number; customGrades?: string;
}
interface Teacher {
  id: number; schoolId: number; name: string; email?: string; phone?: string; subjects?: string;
}
interface ClassItem {
  id: number; schoolId: number; grade: string; numSections: number; sections: string;
}
interface TimetableEntry {
  id: number; classId: number; className?: string; teacherId: number; teacherName?: string;
  section: string; subject: string; dayOfWeek: string; startTime: string; endTime: string; room?: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function generateSections(n: number) {
  return Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i)).join(",");
}

function TeachersTab({ schoolId }: { schoolId: number }) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subjects: "" });
  const [loading, setLoading] = useState(false);

  const fetch_ = () =>
    fetch(`/api/schools/${schoolId}/teachers`, { credentials: "include" })
      .then(r => r.json()).then(setTeachers);

  useEffect(() => { fetch_(); }, [schoolId]);

  const openAdd = () => { setEditing(null); setForm({ name: "", email: "", phone: "", subjects: "" }); setDialogOpen(true); };
  const openEdit = (t: Teacher) => {
    setEditing(t);
    setForm({ name: t.name, email: t.email || "", phone: t.phone || "", subjects: t.subjects || "" });
    setDialogOpen(true);
  };

  const save = async () => {
    setLoading(true);
    try {
      const body = { name: form.name, email: form.email || undefined, phone: form.phone || undefined, subjects: form.subjects || undefined };
      if (editing) {
        await fetch(`/api/schools/${schoolId}/teachers/${editing.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body),
        });
      } else {
        await fetch(`/api/schools/${schoolId}/teachers`, {
          method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body),
        });
      }
      await fetch_(); setDialogOpen(false);
    } finally { setLoading(false); }
  };

  const del = async () => {
    if (deleteId == null) return;
    await fetch(`/api/schools/${schoolId}/teachers/${deleteId}`, { method: "DELETE", credentials: "include" });
    setDeleteId(null); fetch_();
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Teacher</Button>
      </div>
      {teachers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>No teachers yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {teachers.map(t => (
            <Card key={t.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    {t.email && <p className="text-sm text-muted-foreground">{t.email}</p>}
                    {t.phone && <p className="text-sm text-muted-foreground">{t.phone}</p>}
                    {t.subjects && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {t.subjects.split(",").map(s => (
                          <Badge key={s.trim()} variant="secondary" className="text-xs">{s.trim()}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(t.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Teacher" : "Add Teacher"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="teacher@school.com" /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1234567890" /></div>
            <div className="space-y-2">
              <Label>Subjects</Label>
              <Input value={form.subjects} onChange={e => setForm(f => ({ ...f, subjects: e.target.value }))} placeholder="Math, Science, Physics" />
              <p className="text-xs text-muted-foreground">Comma-separated list of subjects</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={loading || !form.name}>{loading ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId != null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Teacher?</AlertDialogTitle>
            <AlertDialogDescription>This will also remove all their timetable entries.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={del} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ClassesTab({ schoolId }: { schoolId: number }) {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ClassItem | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ grade: "", numSections: 1, sections: "A" });
  const [loading, setLoading] = useState(false);

  const fetch_ = () =>
    fetch(`/api/schools/${schoolId}/classes`, { credentials: "include" })
      .then(r => r.json()).then(setClasses);

  useEffect(() => { fetch_(); }, [schoolId]);

  const openAdd = () => { setEditing(null); setForm({ grade: "", numSections: 1, sections: "A" }); setDialogOpen(true); };
  const openEdit = (c: ClassItem) => {
    setEditing(c);
    setForm({ grade: c.grade, numSections: c.numSections, sections: c.sections });
    setDialogOpen(true);
  };

  const handleNumSectionsChange = (n: number) => {
    setForm(f => ({ ...f, numSections: n, sections: generateSections(n) }));
  };

  const save = async () => {
    setLoading(true);
    try {
      const body = { grade: form.grade, numSections: Number(form.numSections), sections: form.sections };
      if (editing) {
        await fetch(`/api/schools/${schoolId}/classes/${editing.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body),
        });
      } else {
        await fetch(`/api/schools/${schoolId}/classes`, {
          method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body),
        });
      }
      await fetch_(); setDialogOpen(false);
    } finally { setLoading(false); }
  };

  const del = async () => {
    if (deleteId == null) return;
    await fetch(`/api/schools/${schoolId}/classes/${deleteId}`, { method: "DELETE", credentials: "include" });
    setDeleteId(null); fetch_();
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Class</Button>
      </div>
      {classes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>No classes yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {classes.map(c => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{c.grade}</p>
                    <p className="text-sm text-muted-foreground">{c.numSections} section{c.numSections !== 1 ? "s" : ""}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.sections.split(",").map(s => (
                        <Badge key={s.trim()} variant="outline" className="text-xs">Section {s.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Class" : "Add Class"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Grade / Class Name *</Label>
              <Input value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} placeholder="e.g. Grade 5, Class 10, Year 1" />
            </div>
            <div className="space-y-2">
              <Label>Number of Sections</Label>
              <Select value={String(form.numSections)} onValueChange={v => handleNumSectionsChange(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                    <SelectItem key={n} value={String(n)}>{n} Section{n > 1 ? "s" : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Section Names</Label>
              <Input value={form.sections} onChange={e => setForm(f => ({ ...f, sections: e.target.value }))} placeholder="A,B,C" />
              <p className="text-xs text-muted-foreground">Comma-separated section labels (auto-generated, you can customize)</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={loading || !form.grade}>{loading ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId != null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class?</AlertDialogTitle>
            <AlertDialogDescription>This will also remove all related timetable entries.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={del} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TimetableTab({ schoolId }: { schoolId: number }) {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TimetableEntry | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterDay, setFilterDay] = useState("All");
  const [form, setForm] = useState({
    classId: "", teacherId: "", section: "", subject: "",
    dayOfWeek: "Monday", startTime: "08:00", endTime: "09:00", room: ""
  });

  const fetchEntries = () =>
    fetch(`/api/schools/${schoolId}/timetable`, { credentials: "include" })
      .then(r => r.json()).then(setEntries);

  useEffect(() => {
    fetchEntries();
    fetch(`/api/schools/${schoolId}/classes`, { credentials: "include" }).then(r => r.json()).then(setClasses);
    fetch(`/api/schools/${schoolId}/teachers`, { credentials: "include" }).then(r => r.json()).then(setTeachers);
  }, [schoolId]);

  const selectedClass = classes.find(c => c.id === Number(form.classId));
  const availableSections = selectedClass ? selectedClass.sections.split(",").map(s => s.trim()) : [];

  const openAdd = () => {
    setEditing(null);
    setForm({ classId: "", teacherId: "", section: "", subject: "", dayOfWeek: "Monday", startTime: "08:00", endTime: "09:00", room: "" });
    setDialogOpen(true);
  };

  const openEdit = (e: TimetableEntry) => {
    setEditing(e);
    setForm({
      classId: String(e.classId), teacherId: String(e.teacherId), section: e.section,
      subject: e.subject, dayOfWeek: e.dayOfWeek, startTime: e.startTime, endTime: e.endTime, room: e.room || ""
    });
    setDialogOpen(true);
  };

  const save = async () => {
    setLoading(true);
    try {
      const body = {
        classId: Number(form.classId), teacherId: Number(form.teacherId),
        section: form.section, subject: form.subject, dayOfWeek: form.dayOfWeek,
        startTime: form.startTime, endTime: form.endTime, room: form.room || undefined
      };
      if (editing) {
        await fetch(`/api/schools/${schoolId}/timetable/${editing.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body),
        });
      } else {
        await fetch(`/api/schools/${schoolId}/timetable`, {
          method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body),
        });
      }
      await fetchEntries(); setDialogOpen(false);
    } finally { setLoading(false); }
  };

  const del = async () => {
    if (deleteId == null) return;
    await fetch(`/api/schools/${schoolId}/timetable/${deleteId}`, { method: "DELETE", credentials: "include" });
    setDeleteId(null); fetchEntries();
  };

  const displayed = filterDay === "All" ? entries : entries.filter(e => e.dayOfWeek === filterDay);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {["All", ...DAYS].map(d => (
            <Button key={d} variant={filterDay === d ? "default" : "outline"} size="sm" onClick={() => setFilterDay(d)}>{d === "All" ? "All Days" : d.substring(0, 3)}</Button>
          ))}
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Entry</Button>
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>No timetable entries.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map(entry => (
            <Card key={entry.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="secondary">{entry.dayOfWeek}</Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />{entry.startTime} – {entry.endTime}
                      </span>
                    </div>
                    <p className="font-semibold">{entry.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.className} · Section {entry.section}
                      {entry.room && ` · Room ${entry.room}`}
                    </p>
                    <p className="text-sm text-muted-foreground">Teacher: {entry.teacherName}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(entry)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(entry.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Timetable Entry" : "Add Timetable Entry"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Class *</Label>
              <Select value={form.classId} onValueChange={v => setForm(f => ({ ...f, classId: v, section: "" }))}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.grade}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Section *</Label>
              <Select value={form.section} onValueChange={v => setForm(f => ({ ...f, section: v }))} disabled={!form.classId}>
                <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                <SelectContent>
                  {availableSections.map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Teacher *</Label>
              <Select value={form.teacherId} onValueChange={v => setForm(f => ({ ...f, teacherId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                <SelectContent>
                  {teachers.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Subject *</Label><Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Mathematics" /></div>
            <div className="space-y-2">
              <Label>Day of Week *</Label>
              <Select value={form.dayOfWeek} onValueChange={v => setForm(f => ({ ...f, dayOfWeek: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Start Time *</Label><Input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} /></div>
              <div className="space-y-2"><Label>End Time *</Label><Input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Room</Label><Input value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} placeholder="e.g. Room 101" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={loading || !form.classId || !form.teacherId || !form.section || !form.subject}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId != null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
            <AlertDialogDescription>This timetable entry will be permanently deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={del} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function SchoolDetailPage() {
  const params = useParams();
  const schoolId = Number(params.schoolId);
  const [school, setSchool] = useState<School | null>(null);

  useEffect(() => {
    fetch(`/api/schools/${schoolId}`, { credentials: "include" })
      .then(r => r.json()).then(setSchool).catch(console.error);
  }, [schoolId]);

  if (!school) return <div className="p-6 text-muted-foreground">Loading...</div>;

  const gradeLabel = school.gradeType === "other"
    ? `Custom: ${school.customGrades}`
    : `Grade ${school.minGrade} – ${school.maxGrade}`;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link href="/schools">
        <Button variant="ghost" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />Back to Schools
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{school.name}</h1>
        <p className="text-muted-foreground">{gradeLabel}</p>
        {school.address && <p className="text-sm text-muted-foreground">{school.address}</p>}
      </div>

      <Tabs defaultValue="teachers">
        <TabsList className="mb-6">
          <TabsTrigger value="teachers"><Users className="w-4 h-4 mr-2" />Teachers</TabsTrigger>
          <TabsTrigger value="classes"><GraduationCap className="w-4 h-4 mr-2" />Classes</TabsTrigger>
          <TabsTrigger value="timetable"><Calendar className="w-4 h-4 mr-2" />Timetable</TabsTrigger>
        </TabsList>
        <TabsContent value="teachers"><TeachersTab schoolId={schoolId} /></TabsContent>
        <TabsContent value="classes"><ClassesTab schoolId={schoolId} /></TabsContent>
        <TabsContent value="timetable"><TimetableTab schoolId={schoolId} /></TabsContent>
      </Tabs>
    </div>
  );
}
