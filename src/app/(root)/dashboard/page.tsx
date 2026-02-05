"use client"

import ChatBot from '@/components/Chatbot'
import Stats from '@/components/Stats'
import TitleBar from '@/components/TitleBar'
import React, { useEffect, useState } from 'react'
import { getUserProjects } from '@/services/api/projects'
import Projects from '@/components/Project/Projects'
import Tasks from '@/components/Task/Tasks'


const page = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getUserProjects();
        const data = Array.isArray(res) ? res : res?.data || [];
        setProjects(data);
      } catch (e) {
        console.error("Failed to load projects:", e);
        setError("Failed to load projects. Please try again.");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className='p-10 space-y-16'>
      <TitleBar title='Welcome Back' children={'user'} />
      <div className="mb-16" ><Stats /></div>
      {/* <AllItems type="tasks" preview={true} /> */}
      {/* <AllItems type="projects" preview={true} /> */}
      <Tasks preview={true} />
      {/* <ProjectCards projects={projects} preview={true} loading={loading} error={error} />
      <ProjectTable projects={projects} loading={loading} /> */}
      <Projects preview={true} />
    </section>
  )
}

export default page
