const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJson(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const api = {
  getDashboardStats: () => fetchJson("/api/dashboard/stats"),
  getTodos: () => fetchJson("/api/todos/"),
  createTodo: (data: any) => fetchJson("/api/todos/", { method: "POST", body: JSON.stringify(data) }),
  updateTodo: (id: number, data: any) =>
    fetchJson(`/api/todos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTodo: (id: number) => fetchJson(`/api/todos/${id}`, { method: "DELETE" }),
  getGrades: () => fetchJson("/api/grades/"),
  createGrade: (data: any) => fetchJson("/api/grades/", { method: "POST", body: JSON.stringify(data) }),
  getHeatmap: () => fetchJson("/api/heatmap/current-year"),
  getGradeTrends: () => fetchJson("/api/grades/stats/trends"),
  getGradeAnalysis: () => fetchJson("/api/grades/stats/analysis"),
};
