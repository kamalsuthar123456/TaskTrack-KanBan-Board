import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const LATENCY_MS = 1200;
const FAILURE_RATE = 0.15;

function uid() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function mockApi() {
  await sleep(LATENCY_MS);
  if (Math.random() < FAILURE_RATE) {
    return { ok: false, error: "Network error occurred" };
  }
  return { ok: true };
}

export const useBoardStore = create(
  persist(
    (set, get) => ({
      tasks: [],
      pendingCount: 0,

      addTask: async (title, priority = 'low') => {
        const prevState = { 
          tasks: [...get().tasks], 
          pendingCount: get().pendingCount 
        };
        
        const task = {
          id: uid(),
          title,
          priority,
          column: 'todo',
          createdAt: Date.now(),
          pending: true,
        };

        set({ 
          tasks: [task, ...get().tasks],
          pendingCount: get().pendingCount + 1 
        });

        const res = await mockApi();

        if (!res.ok) {
          set(prevState);
          return res;
        }

        set({ 
          tasks: get().tasks.map((t) =>
            t.id === task.id ? { ...t, pending: false } : t
          ),
          pendingCount: Math.max(0, get().pendingCount - 1)
        });

        return res;
      },

      moveTask: async (id, column) => {
        const prevState = { 
          tasks: [...get().tasks], 
          pendingCount: get().pendingCount 
        };

        set({ 
          tasks: get().tasks.map((t) =>
            t.id === id ? { ...t, column, pending: true } : t
          ),
          pendingCount: get().pendingCount + 1
        });

        const res = await mockApi();

        if (!res.ok) {
          set(prevState);
          return res;
        }

        set({ 
          tasks: get().tasks.map((t) =>
            t.id === id ? { ...t, pending: false } : t
          ),
          pendingCount: Math.max(0, get().pendingCount - 1)
        });

        return res;
      },

      deleteTask: async (id) => {
        const prevState = { 
          tasks: [...get().tasks], 
          pendingCount: get().pendingCount 
        };

        set({ 
          tasks: get().tasks.map((t) =>
            t.id === id ? { ...t, pending: true } : t
          ),
          pendingCount: get().pendingCount + 1
        });

        setTimeout(() => {
          set({ tasks: get().tasks.filter((t) => t.id !== id) });
        }, 150);

        const res = await mockApi();

        if (!res.ok) {
          set(prevState);
          return res;
        }

        set({ pendingCount: Math.max(0, get().pendingCount - 1) });

        return res;
      },

      updateTask: async (id, updates) => {
        const prevState = { 
          tasks: [...get().tasks], 
          pendingCount: get().pendingCount 
        };

        set({ 
          tasks: get().tasks.map((t) =>
            t.id === id ? { ...t, ...updates, pending: true } : t
          ),
          pendingCount: get().pendingCount + 1
        });

        const res = await mockApi();

        if (!res.ok) {
          set(prevState);
          return res;
        }

        set({ 
          tasks: get().tasks.map((t) =>
            t.id === id ? { ...t, pending: false } : t
          ),
          pendingCount: Math.max(0, get().pendingCount - 1)
        });

        return res;
      },
    }),
    {
      name: 'krypton-kanban-storage',
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
);
