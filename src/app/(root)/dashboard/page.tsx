"use client"

// import ChatBot from '@/components/Chatbot'
import Stats from '@/components/Stats'
import TitleBar from '@/components/TitleBar'
import Projects from '@/components/Project/Projects'
import Tasks from '@/components/Task/Tasks'


const page = () => {

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
