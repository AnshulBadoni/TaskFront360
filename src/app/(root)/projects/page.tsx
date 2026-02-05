import Projects from '@/components/Project/Projects'
import TitleBar from '@/components/TitleBar'
import React from 'react'

const page = () => {
    return (
        <section className='p-10 space-y-16'>
            <TitleBar title="Manage your" children="Projects" />
            <Projects preview={false} />
        </section>
    )
}

export default page