"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Plus, Trash2, CheckCircle2, Circle, Calendar } from "lucide-react";

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-500/10 text-red-500 border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

const PRIORITY_LABELS: Record<string, string> = {
  high: "高优先级",
  medium: "中优先级",
  low: "低优先级",
};

export default function TodosPage() {
  const [todos, setTodos] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [loading, setLoading] = useState(true);

  const fetchTodos = () => {
    api.getTodos().then((data) => {
      setTodos(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (!newTitle.trim()) return;
    await api.createTodo({ title: newTitle, priority: newPriority });
    setNewTitle("");
    fetchTodos();
  };

  const toggleTodo = async (todo: any) => {
    await api.updateTodo(todo.id, { completed: !todo.completed });
    fetchTodos();
  };

  const deleteTodo = async (id: number) => {
    await api.deleteTodo(id);
    fetchTodos();
  };

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
          <CheckCircle2 className="mr-2 h-5 w-5 text-primary" />
          <span className="text-sm font-semibold">每日计划</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">今日任务</h1>
            <p className="text-sm text-muted-foreground">
              {completedCount}/{todos.length} 已完成
            </p>
          </div>
          <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${todos.length ? (completedCount / todos.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <Card className="mb-6 border-border/50 bg-card/50">
          <CardContent className="flex gap-2 p-4">
            <Input
              placeholder="添加新任务..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              className="flex-1"
            />
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
            <Button onClick={addTodo} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {todos.map((todo) => (
            <Card
              key={todo.id}
              className={`border-border/50 bg-card/50 transition-opacity ${
                todo.completed ? "opacity-50" : ""
              }`}
            >
              <CardContent className="flex items-center gap-3 p-3">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodo(todo)}
                />
                <div className="flex-1">
                  <p
                    className={`text-sm ${
                      todo.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {todo.title}
                  </p>
                  {todo.description && (
                    <p className="text-xs text-muted-foreground">{todo.description}</p>
                  )}
                </div>
                <Badge variant="outline" className={PRIORITY_COLORS[todo.priority] || ""}>
                  {PRIORITY_LABELS[todo.priority] || todo.priority}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteTodo(todo.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {todos.length === 0 && !loading && (
            <p className="text-center text-sm text-muted-foreground py-8">暂无任务，添加一个吧</p>
          )}
        </div>
      </main>
    </div>
  );
}
