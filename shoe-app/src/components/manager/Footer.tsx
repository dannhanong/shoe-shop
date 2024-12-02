import React from 'react'

const Footer: React.FC = () => {
    return (
        <footer className="bg-grey-darkest text-white p-2">
            <div className="flex flex-1 mx-auto">&copy; My Design</div>
            <div className="flex flex-1 mx-auto">Distributed by:  <a href="https://themewagon.com/" target=" _blank">Themewagon</a></div>
        </footer>
    )
}

export default Footer
