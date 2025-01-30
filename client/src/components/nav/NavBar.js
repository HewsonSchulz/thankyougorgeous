import { useLocation, useNavigate } from 'react-router-dom'
import './NavBar.css'

export const NavBar = ({ loggedInUser, setLoggedInUser, isTitle = false }) => {
  const navigate = useNavigate()
  const url = useLocation().pathname

  const navItems = [
    ...(url === '/'
      ? []
      : [
          {
            id: 'home',
            imgSrc: '/assets/iconHome.png',
            label: 'Home',
            selected: url === '/',
            click: () => navigate('/'),
          },
        ]),
    {
      id: 'profile',
      imgSrc: '/assets/iconProfile.png',
      label: 'Profile',
      selected: /^\/profile(\/\d+)?$/.test(url),
      click: () => navigate(`/profile/${loggedInUser?.id}`),
    },
    {
      id: 'cart',
      imgSrc: '/assets/iconCart.png',
      label: 'Cart',
      selected: url === '/cart',
      click: () => navigate('/cart'),
    },
  ]

  if (!!loggedInUser) {
    navItems.push({
      id: 'logout',
      imgSrc: '/assets/iconLogout.png',
      label: 'Logout',
      selected: false,
      click: () => {
        if (window.confirm('Logout now?')) {
          localStorage.removeItem('thankyougorgeous_user')
          setLoggedInUser(null)
          navigate('/')
        }
      },
    })
  } else {
    navItems.push({
      id: 'login',
      imgSrc: '/assets/iconLogin.png',
      label: 'Login',
      selected: url === '/login' || url === '/register',
      click: () => navigate('/login'),
    })
  }

  return (
    <nav className={`navibar ${isTitle ? '' : 'immovable'}`}>
      {navItems.map(({ id, imgSrc, label, selected, click }) => (
        <div key={id} className={`nav-item ${selected ? 'selected' : ''}`} onClick={() => click()}>
          <img className={`navibar-${id}`} src={imgSrc} alt={label} />
          <span className='nav-label'>{label}</span>
        </div>
      ))}
    </nav>
  )
}
