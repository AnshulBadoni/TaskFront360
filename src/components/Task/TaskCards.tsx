'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Task } from '@/types';
import { TaskCard } from './TaskCard';

type TaskCardsProps = {
  tasks?: Task[];
  preview?: boolean;
  onTaskClick?: (task: Task) => void;
};

const PAGE_SIZE = 8;

const TaskCards = ({ tasks, preview, onTaskClick }: TaskCardsProps) => {
  const isPreview = preview ?? false;
  const [visibleCount, setVisibleCount] = useState(isPreview ? 3 : PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isPreview) return;
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, tasks?.length || 0));
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [isPreview, tasks?.length]);

  const visibleTasks = useMemo(() => {
    if (isPreview) return (tasks || []).slice(0, 3);
    return (tasks || []).slice(0, visibleCount);
  }, [tasks, isPreview, visibleCount]);


  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {visibleTasks.map((task: Task) => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick?.(task)} />
        ))}
      </div>

      {!isPreview && visibleCount < (tasks?.length || 0) && (
        <div ref={sentinelRef} className="h-8" />
      )}
    </div>
  );
};

export default TaskCards;
