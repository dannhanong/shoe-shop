import React from 'react'
import ManagerHeader from '../manager/ManagerHeader'

const Home: React.FC = () => {
  return (
    <div>
        <ManagerHeader toggleSidebar={() => {}} />
        <h1>Home</h1>
    </div>
  )
}

export default Home
