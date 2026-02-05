import React from 'react'

const ProjectEmptyState = ({ searchQuery }: { searchQuery?: string }) => {
    return (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
            <div className="mx-auto max-w-md">
                <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    {searchQuery ? 'No projects found' : 'No projects yet'}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                    {searchQuery
                        ? `No projects match "${searchQuery}". Try a different search term.`
                        : 'Get started by creating your first project.'
                    }
                </p>
                {!searchQuery && (
                    <button className="mt-4 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                        Create Project
                    </button>
                )}
            </div>
        </div>
    )
}

export default ProjectEmptyState