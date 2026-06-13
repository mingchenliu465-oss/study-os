"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Clock,
  Flame,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Timer,
  BarChart3,
} from "lucide-react";
import { api } from "@/lib/api";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  accent,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  description?: string;
  accent?: string;
}) {
  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-muted-foreground">{title}</CardDescription>
          <div className={`rounded-md p-1.5 ${accent || "bg-primary/10 text-primary"}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getDashboardStats()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        加载中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-destructive">
        加载失败: {error}
      </div>
    );
  }

  const formatTime = (m: number) => {
    const h = Math.floor(m / 60);
    const min = m % 60;
    return h > 0 ? `${h}小时 ${min}分钟` : `${min}分钟`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">StudyOS</span>
          </div>
          <nav className="hidden gap-1 md:flex">
            {[
              { label: "首页", icon: BarChart3, href: "/", active: true },
              { label: "计划", icon: CheckCircle2, href: "/todos" },
              { label: "成绩", icon: TrendingUp, href: "/grades" },
              { label: "热力图", icon: Calendar, href: "/heatmap" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  item.active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-lg font-semibold tracking-tight">学习仪表盘</h1>
          <p className="text-sm text-muted-foreground">追踪进度，保持专注，稳步提升</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="高考倒计时"
            value={`${stats?.gaokao_days ?? "--"} 天`}
            icon={Calendar}
            description="距离 2026 高考"
            accent="bg-orange-500/10 text-orange-500"
          />
          <StatCard
            title="今日学习"
            value={formatTime(stats?.today_minutes ?? 0)}
            icon={Clock}
            description="专注时间"
            accent="bg-blue-500/10 text-blue-500"
          />
          <StatCard
            title="本周学习"
            value={formatTime(stats?.week_minutes ?? 0)}
            icon={TrendingUp}
            description="本周累计"
            accent="bg-emerald-500/10 text-emerald-500"
          />
          <StatCard
            title="连续学习"
            value={`${stats?.streak_days ?? 0} 天`}
            icon={Flame}
            description="保持连胜"
            accent="bg-red-500/10 text-red-500"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Task Completion */}
          <Card className="border-border/50 bg-card/50 backdrop-blur lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm font-medium">今日任务完成率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary/20">
                  <span className="text-lg font-bold">{stats?.task_completion_rate ?? 0}%</span>
                </div>
                <div className="flex-1">
                  <Progress value={stats?.task_completion_rate ?? 0} className="h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    完成今日计划，保持高效学习节奏
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Progress */}
          <Card className="border-border/50 bg-card/50 backdrop-blur lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium">各科进度</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(stats?.subject_progress ?? []).map((s: any) => (
                <div key={s.subject} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{s.subject}</span>
                    <span className="text-muted-foreground">{s.count} 次考试 · 均分 {s.average}</span>
                  </div>
                  <Progress value={Math.min(s.average, 100)} className="h-1.5" />
                </div>
              ))}
              {(!stats?.subject_progress || stats.subject_progress.length === 0) && (
                <p className="text-sm text-muted-foreground">暂无成绩数据，去成绩分析页添加吧</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Grades */}
        <Card className="mt-6 border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-sm font-medium">最近成绩</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(stats?.recent_grades ?? []).map((g: any) => (
                <Badge
                  key={`${g.id}-${g.exam_date}`}
                  variant="secondary"
                  className="text-xs"
                >
                  {g.subject} · {g.exam_type} · {g.score}分
                </Badge>
              ))}
              {(!stats?.recent_grades || stats.recent_grades.length === 0) && (
                <p className="text-sm text-muted-foreground">暂无成绩记录</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
