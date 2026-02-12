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

export default function BoardPage() {
  const [, setLocation] = useLocation();
  const [activeId, setActiveId] = useState(null);
  
  const tasks = useBoardStore((state) => state.tasks);
  const moveTask = useBoardStore((state) => state.moveTask);
  
  const counts = useMemo(() => {
    return {
      todo: tasks.filter((t) => t.column === 'todo').length,
      inprogress: tasks.filter((t) => t.column === 'inprogress').length,
      done: tasks.filter((t) => t.column === 'done').length,
    };
  }, [tasks]);
  
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      setLocation('/login');
    }
  }, [setLocation]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id;
    let targetColumn = over.id;

    if (!COLUMNS.includes(targetColumn)) {
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        targetColumn = overTask.column;
      }
    }

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.column === targetColumn) return;

    const res = await moveTask(taskId, targetColumn);

    if (res.ok) {
      toast({
        title: 'Task moved',
        description: `Moved to ${targetColumn === 'inprogress' ? 'In Progress' : targetColumn === 'todo' ? 'To Do' : 'Done'}`,
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

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

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
