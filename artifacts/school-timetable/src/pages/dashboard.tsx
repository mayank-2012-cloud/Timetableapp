import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { School, Users, GraduationCap, Calendar, ChevronRight } from "lucide-react";

interface Stats {
  schools: number;
  teachers: number;
  classes: number;
}

interface SchoolItem {
  id: number;
  name: string;
  gradeType: string;
  minGrade: number;
  maxGrade: number;
  customGrades?: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ schools: 0, teachers: 0, classes: 0 });
  const [schools, setSchools] = useState<SchoolItem[]>([]);

  useEffect(() => {
    fetch("/api/schools", { credentials: "include" })
      .then(r => r.json())
      .then(async (schoolList: SchoolItem[]) => {
        setSchools(schoolList);
        let totalTeachers = 0;
        let totalClasses = 0;
        for (const school of schoolList) {
          const [t, c] = await Promise.all([
            fetch(`/api/schools/${school.id}/teachers`, { credentials: "include" }).then(r => r.json()),
            fetch(`/api/schools/${school.id}/classes`, { credentials: "include" }).then(r => r.json()),
          ]);
          totalTeachers += t.length;
          totalClasses += c.length;
        }
        setStats({ schools: schoolList.length, teachers: totalTeachers, classes: totalClasses });
      })
      .catch(console.error);
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your school management system</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <School className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Schools</p>
                <p className="text-2xl font-bold">{stats.schools}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Teachers</p>
                <p className="text-2xl font-bold">{stats.teachers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold">{stats.classes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Schools</CardTitle>
          <Link href="/schools">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {schools.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <School className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No schools yet.</p>
              <Link href="/schools">
                <Button className="mt-4" size="sm">Add Your First School</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {schools.map(school => (
                <Link key={school.id} href={`/schools/${school.id}`}>
                  <div className="flex items-center justify-between py-3 hover:bg-muted/50 px-2 rounded-lg cursor-pointer transition-colors">
                    <div>
                      <p className="font-medium">{school.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {school.gradeType === "other"
                          ? `Custom: ${school.customGrades}`
                          : `Grade ${school.minGrade} – ${school.maxGrade}`}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground mt-10 pb-2">
        This App Is Made By <span className="font-semibold text-foreground">Mayank Suryakant Ghule</span> And Powered By <span className="font-semibold text-blue-600 dark:text-blue-400">Nexus</span> Which Owned By Mayank
      </p>
    </div>
  );
}
