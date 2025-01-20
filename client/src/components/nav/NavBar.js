// import { Link, useLocation } from 'react-router-dom'
// import { useNavigate } from 'react-router-dom'
// import './NavBar.css'

// export const NavBar = ({ loggedInUser, setLoggedInUser }) => {
//   const navigate = useNavigate()
//   const url = useLocation().pathname

//   return (
//     <>
//       <ul className='navbar'>
//         <li className='navbar-item'>
//           <Link to='/' className='navbar-link' id={url === '/' ? 'selected' : ''}>
//             <img className='navbar-home' src='/assets/iconHome.png' alt='home'></img>
//           </Link>
//         </li>

//         {!!loggedInUser ? (
//           <>
//             <li className='navbar-item'>
//               <Link
//                 to={`/profile/${loggedInUser.id}`}
//                 className='navbar-link'
//                 id={
//                   url === `/profile/${loggedInUser.id}` || url === `/profile/edit/${loggedInUser.id}` ? 'selected' : ''
//                 }>
//                 <img className='navbar-profile' src='/assets/iconProfile.png' alt='profile'></img>
//               </Link>
//             </li>
//             <li className='navbar-item'>
//               <Link to={`/cart`} className='navbar-link' id={url === '/cart' ? 'selected' : ''}>
//                 <img className='navbar-cart' src='/assets/iconCart.png' alt='cart'></img>
//               </Link>
//             </li>

//             <li className='navbar-item navbar-logout'>
//               <Link
//                 to=''
//                 onClick={() => {
//                   if (window.confirm('Logout now?')) {
//                     localStorage.removeItem('thankyougorgeous_user')
//                     setLoggedInUser(null)
//                     navigate('/', { replace: true })
//                   }
//                 }}
//                 className='navbar-link'>
//                 <img className='navbar-logout' src='/assets/iconLogout.png' alt='logout'></img>
//               </Link>
//             </li>
//           </>
//         ) : (
//           <li className='navbar-item'>
//             <Link to='/login' className='navbar-link' id={url === '/login' ? 'selected' : ''}>
//               <img className='navbar-login' src='/assets/iconLogin.png' alt='login'></img>
//             </Link>
//           </li>
//         )}
//       </ul>
//     </>
//   )
// }

import { useLocation, useNavigate } from 'react-router-dom'
import './NavBar.css'

export const NavBar = ({ loggedInUser, setLoggedInUser }) => {
  const navigate = useNavigate()
  const url = useLocation().pathname

  const navItems = [
    {
      id: 'home',
      imgSrc: '/assets/iconHome.png',
      label: 'Home',
      selected: url === '/' || url === '/products',
      click: () => navigate('/'),
    },
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
    <nav className='navibar'>
      {navItems.map(({ id, imgSrc, label, selected, click }) => (
        <div key={id} className={`nav-item ${selected ? 'selected' : ''}`} onClick={() => click()}>
          <img className={`navibar-${id}`} src={imgSrc} alt={label} />
          <span className='nav-label'>{label}</span>
        </div>
      ))}
    </nav>
  )
}
