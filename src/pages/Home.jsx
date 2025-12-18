import React from 'react'
import SideBar from '../components/SideBar'
import MessageArea from '../components/MessageArea'
import getMessage from '../customHooks/getMessages'

function Home() {
    // ✅ Call custom hook here
    getMessage()

    return (
        <div className='w-full h-[100vh] flex overflow-hidden'>
            <SideBar />
            <MessageArea />
        </div>
    )
}

export default Home
