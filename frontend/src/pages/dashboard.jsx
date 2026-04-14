import { useMemo, useEffect } from "react";
import AppLayout      from "@/components/Layout/AppLayout";
import { useBoardStore } from "@/state/boardStore";
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { CheckCircle2, Clock, ListTodo } from "lucide-react";

const STAT_CONFIG = [
  { key: "total",      label: "Total Tasks",  color: "bg-indigo-50/50  border-indigo-100/50",  text: "text-[#5243F0]",   dot: null },
  { key: "done",       label: "Completed",    color: "bg-green-50/50   border-green-100/50",   text: "text-green-600",   dot: "bg-green-500" },
  { key: "review",     label: "In Review",    color: "bg-fuchsia-50/50 border-fuchsia-100/50", text: "text-fuchsia-600", dot: "bg-fuchsia-500" },
  { key: "inprogress", label: "In Progress",  color: "bg-orange-50/50  border-orange-100/50",  text: "text-orange-600",  dot: "bg-orange-500" },
];

export default function DashboardPage() {
  const {
    tasks,
    currentProject,
    activeProject,
    fetchTasks,
  } = useBoardStore();

  const project = currentProject || activeProject || null;

  // Dashboard open / project change → ensure tasks loaded
  useEffect(() => {
    if (project?._id) {
      fetchTasks(project._id);
    }
  }, [project?._id]);
  const stats = useMemo(() => ({
    total:      tasks.length,
    done:       tasks.filter(t => t.column === "done").length,
    review:     tasks.filter(t => t.column === "review").length,
    inprogress: tasks.filter(t => t.column === "inprogress").length,
  }), [tasks]);

  const chartData = useMemo(() => {
    const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

    const now   = new Date();
    const dow   = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dow + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    tasks.forEach(t => {
      const d = new Date(t.createdAt);
      if (d >= monday && d <= sunday) {
        const label = DAY_LABELS[d.getDay()];
        counts[label] = (counts[label] || 0) + 1;
      }
    });

    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => ({
      name:  day,
      tasks: counts[day],
    }));
  }, [tasks]);

  const recentActivity = useMemo(() => {
    return [...tasks]
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
      )
      .slice(0, 5)
      .map(t => {
        const ts   = t.updatedAt || t.createdAt;
        const diff = Date.now() - new Date(ts).getTime();
        const mins = Math.floor(diff / 60000);
        const hrs  = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        const timeAgo =
          mins < 1 ? "Just now" :
          mins < 60 ? `${mins}m ago` :
          hrs  < 24 ? `${hrs}h ago` :
          days < 7 ? `${days}d ago` :
          new Date(ts).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          });

        const colMeta = {
          done:       { action: "Completed",     dot: "bg-green-500" },
          inprogress: { action: "In Progress",   dot: "bg-orange-400" },
          review:     { action: "In Review",     dot: "bg-purple-400" },
          todo:       { action: "Added to Todo", dot: "bg-blue-400" },
        };
        const meta = colMeta[t.column] || {
          action: "Updated",
          dot: "bg-gray-300",
        };

        return {
          id:       t.id,
          action:   meta.action,
          title:    t.title,
          timeAgo,
          dot:      meta.dot,
          priority: t.priority,
        };
      });
  }, [tasks]);

  const projectName = project?.name || "Your Project";

  return (
    <AppLayout>
      <div className="pt-0 pb-6">
        {/* Stat cards */}
        <div className="px-6 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {STAT_CONFIG.map(({ key, label, color, text, dot }) => (
            <div
              key={key}
              className={`p-6 rounded-3xl border transition-transform hover:-translate-y-1 ${color}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {dot && (
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${dot.replace(
                      "bg-",
                      "border-"
                    )}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${dot}`} />
                  </div>
                )}
                <span className={`font-semibold text-sm ${text}`}>{label}</span>
              </div>
              <p className="text-[32px] font-bold text-[#1B1C22] leading-none">
                {stats[key]}
              </p>
            </div>
          ))}
        </div>

        <div className="px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 rounded-3xl border border-[#E4E6EF] bg-white shadow-sm flex flex-col p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-[#1B1C22]">
                  Task Activity
                </h3>
                <p className="text-xs text-[#8E92A4] mt-0.5">
                  Tasks created this week — {projectName}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#8E92A4] bg-[#F4F5F7] px-3 py-1.5 rounded-lg border border-[#E4E6EF]">
                <Clock className="h-3.5 w-3.5" />
                This Week
              </div>
            </div>
            <div className="flex-1 w-full min-h-[260px]">
              {chartData.every(d => d.tasks === 0) ? (
                <div className="flex flex-col items-center justify-center h-64 text-[#C7C9DE]">
                  <ListTodo className="h-10 w-10 mb-2 opacity-40" />
                  <p className="text-sm font-semibold">
                    No tasks created this week yet
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData}>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#B0B4C8", fontSize: 12 }}
                      dy={8}
                    />
                    <Tooltip
                      cursor={{ fill: "#F4F5F7" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #E4E6EF",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontSize: "12px",
                      }}
                      formatter={value => [`${value} tasks`, "Created"]}
                    />
                    <Bar
                      dataKey="tasks"
                      fill="#5243F0"
                      radius={[6, 6, 6, 6]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-3xl border border-[#E4E6EF] bg-white p-6 flex flex-col shadow-sm">
            <h3 className="text-base font-bold text-[#1B1C22] mb-4">
              Recent Activity
            </h3>
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-[#C7C9DE] py-10">
                <CheckCircle2 className="h-9 w-9 mb-2 opacity-40" />
                <p className="text-sm font-semibold">No activity yet</p>
                <p className="text-xs mt-1">Create tasks to see activity</p>
              </div>
            ) : (
              <div
                className="flex-1 overflow-y-auto space-y-4 pr-1"
                style={{ scrollbarWidth: "none" }}
              >
                {recentActivity.map(item => (
                  <div key={item.id} className="flex gap-3 items-start">
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${item.dot}`}
                    />
                    <div className="min-w-0">
                      <p className="text-[13px] text-[#8E92A4] leading-snug">
                        <span className="font-bold text-[#1B1C22]">
                          {item.action}
                        </span>
                        {" · "}
                        <span className="truncate">{item.title}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-[#B0B4C8]">
                          {item.timeAgo}
                        </span>
                        {item.priority && (
                          <span className="text-[9px] font-bold uppercase tracking-wide text-[#B0B4C8]">
                            {item.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

