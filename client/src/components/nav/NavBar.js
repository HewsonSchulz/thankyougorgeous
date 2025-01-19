import { Link, useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import './NavBar.css'

export const NavBar = ({ loggedInUser, setLoggedInUser }) => {
  const navigate = useNavigate()
  const url = useLocation().pathname

  return (
    <>
      <img className='navbar-img' src='/assets/navbar5.png' alt='navigation bar'></img>
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
                  if (window.confirm('Logout now?')) {
                    localStorage.removeItem('thankyougorgeous_user')
                    setLoggedInUser(null)
                    navigate('/', { replace: true })
                  }
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
    </>
  )
}
