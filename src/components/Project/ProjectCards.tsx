'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Project } from '@/types';
import { ProjectCard } from './ProjectCard';

type ProjectCardsProps = {
  projects: Project[];
  preview?: boolean;
};

const PAGE_SIZE = 8;

const ProjectCards = ({ projects, preview }: ProjectCardsProps) => {
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
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, projects?.length || 0));
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [isPreview, projects?.length]);

  const visibleProjects = useMemo(() => {
    if (isPreview) return (projects || []).slice(0, 3);
    return (projects || []).slice(0, visibleCount);
  }, [projects, isPreview, visibleCount]);


  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {visibleProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {!isPreview && visibleCount < (projects?.length || 0) && (
        <div ref={sentinelRef} className="h-8" />
      )}
    </div>
  );
};

export default ProjectCards;
