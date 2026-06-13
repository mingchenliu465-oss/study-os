"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import {
  TrendingUp,
  Plus,
  Trophy,
  AlertTriangle,
  BarChart3,
  BookOpen,
} from "lucide-react";

const SUBJECTS = ["语文", "数学", "英语", "物理", "化学", "生物"];
const EXAM_TYPES = ["月考", "期中", "期末"];

export default function GradesPage() {
  const [grades, setGrades] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [activeSubject, setActiveSubject] = useState("全部");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    subject: "数学",
    exam_type: "月考",
    score: "",
    max_score: "100",
    exam_date: "",
  });

  const fetchData = () => {
    api.getGrades().then(setGrades);
    api.getGradeAnalysis().then(setAnalysis);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const submit = async () => {
    await api.createGrade({
      subject: form.subject,
      exam_type: form.exam_type,
      score: parseFloat(form.score),
      max_score: parseFloat(form.max_score),
      exam_date: form.exam_date,
    });
    setShowForm(false);
    setForm({ ...form, score: "", exam_date: "" });
    fetchData();
  };

  const filtered =
    activeSubject === "全部"
      ? grades
      : grades.filter((g) => g.subject === activeSubject);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
          <TrendingUp className="mr-2 h-5 w-5 text-primary" />
          <span className="text-sm font-semibold">成绩分析</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Analysis Cards */}
        {analysis && (
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <CardTitle className="text-sm">优势学科</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {analysis.strongest ? (
                  <>
                    <div className="text-2xl font-bold">{analysis.strongest.subject}</div>
                    <p className="text-xs text-muted-foreground">
                      均分 {analysis.strongest.average} · {analysis.strongest.suggestion}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">暂无数据</p>
                )}
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <CardTitle className="text-sm">薄弱学科</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {analysis.weakest ? (
                  <>
                    <div className="text-2xl font-bold">{analysis.weakest.subject}</div>
                    <p className="text-xs text-muted-foreground">
                      均分 {analysis.weakest.average} · {analysis.weakest.suggestion}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">暂无数据</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Subject Filter */}
        <div className="mb-4 flex items-center justify-between">
          <Tabs value={activeSubject} onValueChange={setActiveSubject}>
            <TabsList>
              <TabsTrigger value="全部">全部</TabsTrigger>
              {SUBJECTS.map((s) => (
                <TabsTrigger key={s} value={s}>{s}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-1 h-4 w-4" />
            录入成绩
          </Button>
        </div>

        {/* Add Form */}
        {showForm && (
          <Card className="mb-6 border-border/50 bg-card/50">
            <CardContent className="grid gap-3 p-4 sm:grid-cols-5">
              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.exam_type}
                onChange={(e) => setForm({ ...form, exam_type: e.target.value })}
              >
                {EXAM_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <Input
                placeholder="分数"
                type="number"
                value={form.score}
                onChange={(e) => setForm({ ...form, score: e.target.value })}
              />
              <Input
                placeholder="满分"
                type="number"
                value={form.max_score}
                onChange={(e) => setForm({ ...form, max_score: e.target.value })}
              />
              <Input
                placeholder="考试日期"
                type="date"
                value={form.exam_date}
                onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
              />
              <Button className="sm:col-span-5" onClick={submit}>保存</Button>
            </CardContent>
          </Card>
        )}

        {/* Grades List */}
        <div className="space-y-2">
          {filtered.map((g) => (
            <Card key={g.id} className="border-border/50 bg-card/50">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{g.subject} · {g.exam_type}</p>
                    <p className="text-xs text-muted-foreground">{g.exam_date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{g.score}</div>
                  <div className="text-xs text-muted-foreground">/ {g.max_score}</div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">暂无成绩记录</p>
          )}
        </div>
      </main>
    </div>
  );
}
