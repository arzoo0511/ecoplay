import React from 'react';

export const ProjectCardSkeleton = () => {
  return (
    <div className="flex animate-pulse flex-col items-center justify-center rounded-xl border border-slate-200/70 bg-white/70 p-4 backdrop-blur-lg transition-theme duration-300 dark:border-white/10 dark:bg-white/5">
      <div className="mb-3 h-16 w-16 rounded-full bg-slate-200/80 dark:bg-white/10" />
      <div className="mb-2 h-4 w-2/3 rounded bg-slate-200/80 dark:bg-white/10" />
      <div className="h-3 w-1/3 rounded bg-slate-200/70 dark:bg-white/10" />
    </div>
  );
};

export default ProjectCardSkeleton;
