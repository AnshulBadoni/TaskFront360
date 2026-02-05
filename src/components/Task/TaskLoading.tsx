import React from 'react'

const TaskLoading = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_8px_24px_rgba(2,6,23,0.05)]">
                    <div className="h-1.5 w-24 rounded-full bg-slate-200/80 animate-pulse" />
                    <div className="mt-4 flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-3">
                            <div className="h-4 w-3/4 rounded bg-slate-200/80 animate-pulse" />
                            <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
                            <div className="h-3 w-5/6 rounded bg-slate-100 animate-pulse" />
                        </div>
                        <div className="h-6 w-14 rounded-full bg-slate-200/80 animate-pulse" />
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                        <div className="h-3 w-32 rounded bg-slate-200/80 animate-pulse" />
                        <div className="flex -space-x-2">
                            {[...Array(3)].map((_, j) => (
                                <div key={j} className="h-7 w-7 rounded-full border-2 border-white bg-slate-200/80 animate-pulse" />
                            ))}
                        </div>
                    </div>

                    <div className="mt-5 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-slate-200 to-slate-100 animate-pulse" />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <div className="h-3 w-24 rounded bg-slate-200/80 animate-pulse" />
                        <div className="h-5 w-16 rounded bg-slate-200/80 animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default TaskLoading