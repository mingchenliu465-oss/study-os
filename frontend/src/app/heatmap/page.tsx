"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Calendar, Flame } from "lucide-react";

function HeatmapCell({
  date,
  minutes,
  maxMinutes,
}: {
  date: string;
  minutes: number;
  maxMinutes: number;
}) {
  const intensity = maxMinutes > 0 ? minutes / maxMinutes : 0;
  const level =
    minutes === 0
      ? 0
      : intensity < 0.25
      ? 1
      : intensity < 0.5
      ? 2
      : intensity < 0.75
      ? 3
      : 4;

  const colors = [
    "bg-muted",
    "bg-emerald-500/20",
    "bg-emerald-500/40",
    "bg-emerald-500/60",
    "bg-emerald-500",
  ];

  return (
    <div
      title={`${date}: ${minutes} 分钟`}
      className={`aspect-square rounded-sm ${colors[level]} transition-colors hover:ring-1 hover:ring-primary`}
    />
  );
}

export default function HeatmapPage() {
  const [data, setData] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    api.getHeatmap().then(setData);
    api.getGradeTrends().then(() => {});
    fetch("http://localhost:8000/api/heatmap/streak")
      .then((r) => r.json())
      .then((d) => setStreak(d.streak));
  }, []);

  const year = new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const days: Date[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  const dataMap = new Map(data.map((d) => [d.date, d.total_minutes]));
  const maxMinutes = Math.max(...data.map((d) => d.total_minutes), 1);

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  const firstDay = days[0].getDay();
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push(new Date(year - 1, 11, 31 - firstDay + 1 + i));
  }

  days.forEach((day) => {
    currentWeek.push(day);
    if (day.getDay() === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const monthLabels = [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
          <Calendar className="mr-2 h-5 w-5 text-primary" />
          <span className="text-sm font-semibold">学习热力图</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 flex items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold">{year} 年学习记录</h1>
            <p className="text-sm text-muted-foreground">每日学习时长可视化</p>
          </div>
          <Card className="ml-auto border-border/50 bg-card/50">
            <CardContent className="flex items-center gap-2 py-2 px-4">
              <Flame className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">连续 {streak} 天</span>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50 bg-card/50 overflow-x-auto">
          <CardContent className="p-6">
            <div className="min-w-[800px]">
              <div className="mb-2 flex gap-1 text-xs text-muted-foreground">
                {monthLabels.map((m) => (
                  <div key={m} className="w-8 text-center">{m}</div>
                ))}
              </div>
              <div className="flex gap-1">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-1">
                    {week.map((day) => {
                      const iso = day.toISOString().split("T")[0];
                      const minutes = dataMap.get(iso) || 0;
                      return (
                        <HeatmapCell
                          key={iso}
                          date={iso}
                          minutes={minutes}
                          maxMinutes={maxMinutes}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span>少</span>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-3 w-3 rounded-sm ${
                      [
                        "bg-muted",
                        "bg-emerald-500/20",
                        "bg-emerald-500/40",
                        "bg-emerald-500/60",
                        "bg-emerald-500",
                      ][i]
                    }`}
                  />
                ))}
                <span>多</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
