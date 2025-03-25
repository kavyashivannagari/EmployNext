import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'

const Header = () => {
  const navigate = useNavigate()
  return (
    <>
      <nav className='p-4 flex justify-between item'>
        <Link>
          <img src='/Logo.png' className='h-20' />
        </Link>
        <div className='flex gap-4'><Button variant="outline" onClick={() => navigate("/signup")}>SignUp</Button>
        
          <Button variant="outline" onClick={() => navigate("/login")}>Login</Button>
          {/* <Link></Link> */}
        </div>
      </nav>
    </>
  )
}

export default Header
