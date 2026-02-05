import React from 'react'

const ProjectTableError = ({ error, loadMyProjects }: { error: string, loadMyProjects: () => void }) => {
    return (
        <div className="rounded-lg bg-rose-50 border border-rose-100 p-6">
            <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-rose-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <p className="text-sm font-medium text-rose-900">{error}</p>
                    <button
                        onClick={loadMyProjects}
                        className="mt-2 text-sm text-rose-600 hover:text-rose-800 font-medium"
                    >
                        Try again
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProjectTableError