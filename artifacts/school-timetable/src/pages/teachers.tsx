import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface SchoolItem {
  id: number;
  name: string;
}

interface Teacher {
  id: number;
  schoolId: number;
  name: string;
  email?: string;
  phone?: string;
  subjects?: string;
}

interface TeacherWithSchool extends Teacher {
  schoolName: string;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherWithSchool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/schools", { credentials: "include" })
      .then(r => r.json())
      .then(async (schools: SchoolItem[]) => {
        const all: TeacherWithSchool[] = [];
        for (const school of schools) {
          const t: Teacher[] = await fetch(`/api/schools/${school.id}/teachers`, { credentials: "include" }).then(r => r.json());
          all.push(...t.map(teacher => ({ ...teacher, schoolName: school.name })));
        }
        setTeachers(all);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">All Teachers</h1>
        <p className="text-muted-foreground mt-1">Teachers across all schools ({teachers.length} total)</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : teachers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No teachers added yet. Go to a school to add teachers.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {teachers.map(t => (
            <Card key={`${t.schoolId}-${t.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.schoolName}</p>
                    {t.email && <p className="text-sm text-muted-foreground">{t.email}</p>}
                    {t.subjects && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {t.subjects.split(",").map(s => (
                          <Badge key={s.trim()} variant="secondary" className="text-xs">{s.trim()}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
