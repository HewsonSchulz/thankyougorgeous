import { Link, useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import './NavBar.css'

export const NavBar = ({ loggedInUser }) => {
  const navigate = useNavigate()
  const url = useLocation().pathname

  return (
    <ul className='navbar'>
      <li className='navbar-item'>
        <Link to='/' className='navbar-link' id={url === '/' ? 'selected' : ''}>
          Home
        </Link>
      </li>

      {!!loggedInUser ? (
        <>
          <li className='navbar-item'>
            <Link
              to={`/profile/${loggedInUser.id}`}
              className='navbar-link'
              id={
                url === `/profile/${loggedInUser.id}` || url === `/profile/edit/${loggedInUser.id}` ? 'selected' : ''
              }>
              My Profile
            </Link>
          </li>

          <li className='navbar-item navbar-logout'>
            <Link
              to=''
              onClick={() => {
                //TODO confirm logout
                localStorage.removeItem('thankyougorgeous_user')
                navigate('/', { replace: true })
              }}
              className='navbar-link'>
              Logout
            </Link>
          </li>
        </>
      ) : (
        <li className='navbar-item'>
          <Link to='/login' className='navbar-link' id={url === '/login' ? 'selected' : ''}>
            Log In
          </Link>
        </li>
      )}
    </ul>
  )
}
