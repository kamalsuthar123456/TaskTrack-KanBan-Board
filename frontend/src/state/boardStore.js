import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const LATENCY_MS = 1200;
const FAILURE_RATE = 0.05;

function uid() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function mockApi() {
  await sleep(LATENCY_MS);
  if (Math.random() < FAILURE_RATE) {
    return { ok: false, error: 'Network error occurred' };
  }
  return { ok: true };
}

export const useBoardStore = create(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: async (title, priority = 'low') => {
        if (typeof title !== 'string' || !title.trim()) {
          return { ok: false, error: 'Invalid title' };
        }

        const prevTasks = get().tasks;

        const task = {
          id: uid(),
          title: title.trim(),
          priority,
          column: 'todo',
          createdAt: Date.now(),   // ✅ set on creation
          updatedAt: Date.now(),   // ✅ same as createdAt initially
          pending: true,
        };

        set({ tasks: [task, ...prevTasks] });

        const res = await mockApi();

        if (!res.ok) {
          set({ tasks: prevTasks });
          return res;
        }

        set({
          tasks: get().tasks.map((t) =>
            t.id === task.id ? { ...t, pending: false } : t
          ),
        });

        return res;
      },

      moveTask: async (id, column) => {
        const prevTasks = get().tasks;

        set({
          tasks: prevTasks.map((t) =>
            t.id === id
              ? { ...t, column, updatedAt: Date.now(), pending: true }  // ✅ update timestamp on move
              : t
          ),
        });

        const res = await mockApi();

        if (!res.ok) {
          set({ tasks: prevTasks });
          return res;
        }

        set({
          tasks: get().tasks.map((t) =>
            t.id === id ? { ...t, pending: false } : t
          ),
        });

        return res;
      },

      deleteTask: async (id) => {
        const prevTasks = get().tasks;

        set({
          tasks: prevTasks.map((t) =>
            t.id === id ? { ...t, pending: true } : t
          ),
        });

        const res = await mockApi();

        if (!res.ok) {
          set({ tasks: prevTasks });
          return res;
        }

        set({
          tasks: get().tasks.filter((t) => t.id !== id),
        });

        return res;
      },

      updateTask: async (id, updates) => {
        const prevTasks = get().tasks;

        set({
          tasks: prevTasks.map((t) =>
            t.id === id
              ? { ...t, ...updates, updatedAt: Date.now(), pending: true }  // ✅ update timestamp on edit
              : t
          ),
        });

        const res = await mockApi();

        if (!res.ok) {
          set({ tasks: prevTasks });
          return res;
        }

        set({
          tasks: get().tasks.map((t) =>
            t.id === id ? { ...t, pending: false } : t
          ),
        });

        return res;
      },
    }),
    {
      name: 'krypton-kanban-storage',

      partialize: (state) => ({
        tasks: state.tasks.filter((t) => !t.pending),
      }),

      merge: (persisted, current) => ({
        ...current,
        tasks: (persisted?.tasks ?? []).filter(
          (t) =>
            t &&
            typeof t.id === 'string' &&
            typeof t.title === 'string' &&
            typeof t.column === 'string'
        ),
      }),
    }
  )
);
