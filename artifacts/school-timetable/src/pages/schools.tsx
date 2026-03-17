import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { School, Plus, Pencil, Trash2, ChevronRight } from "lucide-react";

interface SchoolItem {
  id: number;
  name: string;
  address?: string;
  gradeType: string;
  minGrade: number;
  maxGrade: number;
  customGrades?: string;
}

const emptyForm = {
  name: "",
  address: "",
  gradeType: "standard",
  minGrade: 1,
  maxGrade: 12,
  customGrades: "",
};

export default function SchoolsPage() {
  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolItem | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const fetchSchools = () =>
    fetch("/api/schools", { credentials: "include" })
      .then(r => r.json())
      .then(setSchools);

  useEffect(() => { fetchSchools(); }, []);

  const openAdd = () => {
    setEditingSchool(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (s: SchoolItem, e: React.MouseEvent) => {
    e.preventDefault();
    setEditingSchool(s);
    setForm({
      name: s.name,
      address: s.address || "",
      gradeType: s.gradeType,
      minGrade: s.minGrade,
      maxGrade: s.maxGrade,
      customGrades: s.customGrades || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const body = {
        name: form.name,
        address: form.address || undefined,
        gradeType: form.gradeType,
        minGrade: form.gradeType === "other" ? 0 : Number(form.minGrade),
        maxGrade: form.gradeType === "other" ? 0 : Number(form.maxGrade),
        customGrades: form.gradeType === "other" ? form.customGrades : undefined,
      };
      if (editingSchool) {
        await fetch(`/api/schools/${editingSchool.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
      } else {
        await fetch("/api/schools", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
      }
      await fetchSchools();
      setDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId == null) return;
    await fetch(`/api/schools/${deleteId}`, { method: "DELETE", credentials: "include" });
    setDeleteId(null);
    fetchSchools();
  };

  const gradeLabel = (s: SchoolItem) =>
    s.gradeType === "other"
      ? `Custom: ${s.customGrades || "—"}`
      : `Grade ${s.minGrade} – ${s.maxGrade}`;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Schools</h1>
          <p className="text-muted-foreground mt-1">Manage all schools in the system</p>
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add School</Button>
      </div>

      <div className="space-y-3">
        {schools.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <School className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No schools added yet.</p>
              <Button className="mt-4" onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add First School</Button>
            </CardContent>
          </Card>
        ) : (
          schools.map(school => (
            <Card key={school.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Link href={`/schools/${school.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 cursor-pointer">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg shrink-0">
                        <School className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{school.name}</p>
                        <p className="text-sm text-muted-foreground">{gradeLabel(school)}</p>
                        {school.address && <p className="text-xs text-muted-foreground truncate">{school.address}</p>}
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <Button variant="ghost" size="sm" onClick={e => openEdit(school, e)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(school.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                    <Link href={`/schools/${school.id}`}>
                      <Button variant="ghost" size="sm"><ChevronRight className="w-4 h-4" /></Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSchool ? "Edit School" : "Add School"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>School Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Springfield High School" />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Main St, City" />
            </div>
            <div className="space-y-2">
              <Label>Grade Type *</Label>
              <Select value={form.gradeType} onValueChange={v => setForm(f => ({ ...f, gradeType: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (Grade 1–12)</SelectItem>
                  <SelectItem value="other">Other / Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.gradeType === "standard" ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Grade</Label>
                  <Select value={String(form.minGrade)} onValueChange={v => setForm(f => ({ ...f, minGrade: Number(v) }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(g => (
                        <SelectItem key={g} value={String(g)}>Grade {g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max Grade</Label>
                  <Select value={String(form.maxGrade)} onValueChange={v => setForm(f => ({ ...f, maxGrade: Number(v) }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(g => (
                        <SelectItem key={g} value={String(g)}>Grade {g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Custom Grades</Label>
                <Input
                  value={form.customGrades}
                  onChange={e => setForm(f => ({ ...f, customGrades: e.target.value }))}
                  placeholder="e.g. Nursery,KG,Grade 1,Grade 2"
                />
                <p className="text-xs text-muted-foreground">Comma-separated list of grade names</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading || !form.name}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteId != null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete School?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the school, all its teachers, classes, and timetable entries.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
