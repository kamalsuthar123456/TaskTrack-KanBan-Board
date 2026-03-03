import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
} from '@dnd-kit/core';
import Navbar from '@/components/Layout/Navbar';
import Container from '@/components/Layout/Container';
import BoardHeader from '@/components/Board/BoardHeader';
import QuickTask from '@/components/Board/QuickTask';
import Column from '@/components/Board/Column';
import TaskCard from '@/components/Board/TaskCard';
import { useBoardStore } from '@/state/boardStore';
import { auth } from '@/state/auth';
import { useToast } from '@/hooks/use-toast';

const COLUMNS = ['todo', 'inprogress', 'done'];

const COLUMN_LABELS = {
  todo: 'To Do',
  inprogress: 'In Progress',
  done: 'Done',
};

export default function BoardPage() {
  const [, setLocation] = useLocation();
  const [activeId, setActiveId] = useState(null);

  const tasks = useBoardStore((state) => state.tasks);
  const moveTask = useBoardStore((state) => state.moveTask);

  const counts = useMemo(() => ({
    todo: tasks.filter((t) => t.column === 'todo').length,
    inprogress: tasks.filter((t) => t.column === 'inprogress').length,
    done: tasks.filter((t) => t.column === 'done').length,
  }), [tasks]);

  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      setLocation('/login');
    }
  }, [setLocation]);

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t.id === event.active.id);
    // ✅ Block drag if task is currently syncing
    if (!task || task.pending) return;
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id;
    const task = tasks.find((t) => t.id === taskId);

    // ✅ Guard 1: task not found or still pending — do nothing
    if (!task || task.pending) return;

    let targetColumn = over.id;

    // ✅ Guard 2: if dropped on a task card (not a column), resolve its column
    if (!COLUMNS.includes(targetColumn)) {
      const overTask = tasks.find((t) => t.id === over.id);
      if (!overTask) return; // dropped on unknown target
      targetColumn = overTask.column;
    }

    // ✅ Guard 3: same column — no-op
    if (task.column === targetColumn) return;

    const res = await moveTask(taskId, targetColumn);

    if (res.ok) {
      toast({
        title: 'Task moved',
        description: `Moved to ${COLUMN_LABELS[targetColumn]}`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Move failed',
        description: res.error,
      });
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // ✅ Only show overlay for non-pending tasks
  const activeTask = activeId
    ? tasks.find((t) => t.id === activeId && !t.pending)
    : null;

  return (
    <div className="min-h-screen grid-bg">
      <Navbar />

      <Container>
        <BoardHeader counts={counts} />

        <div className="mb-6">
          <QuickTask />
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {COLUMNS.map((columnId) => (
              <Column
                key={columnId}
                id={columnId}
                tasks={tasks.filter((t) => t.column === columnId)}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeTask ? (
              <div className="rotate-3 scale-105">
                <TaskCard task={activeTask} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </Container>
    </div>
  );
}
