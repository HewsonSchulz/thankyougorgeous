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
            label: 'HOME',
            selected: url === '/',
            click: () => navigate('/'),
          },
        ]),
    {
      id: 'products',
      label: 'SHOP',
      selected: url === '/products',
      click: () => navigate('/products'),
    },
    {
      id: 'profile',
      label: 'PROFILE',
      selected: /^\/profile(\/\d+)?$/.test(url),
      click: () => navigate(`/profile/${loggedInUser?.id}`),
    },
    {
      id: 'cart',
      label: 'CART',
      selected: url === '/cart',
      click: () => navigate('/cart'),
    },
    {
      id: 'about',
      label: 'ABOUT',
      selected: url === '/about',
      click: () => navigate('/about'),
    },
  ]

  if (!!loggedInUser) {
    navItems.push({
      id: 'logout',
      label: 'LOGOUT',
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
      label: 'LOGIN',
      selected: url === '/login' || url === '/register',
      click: () => navigate('/login'),
    })
  }

  return (
    <nav className={`navibar ${isTitle ? 'title-navibar' : 'immovable'}`}>
      {navItems.map(({ id, imgSrc, label, selected, click }) => (
        <div key={id} className={`nav-item ${selected ? 'selected' : ''}`} onClick={() => click()}>
          {/* <img className={`navibar-${id}`} src={imgSrc} alt={label} /> */}
          <span className='nav-label'>{label}</span>
        </div>
      ))}
    </nav>
  )
}
