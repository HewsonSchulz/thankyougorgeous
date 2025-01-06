import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AuthorizedRoute } from './auth/AuthorizedRoute'
import { NavBar } from './nav/NavBar'
import { Register } from './auth/Register'
import { Login } from './auth/Login'
import { ProductList } from './products/ProductList'

export const ApplicationViews = ({ loggedInUser, setLoggedInUser }) => {
  const location = useLocation()

  return (
    <Routes>
      <Route
        path='/'
        element={
          <>
            <NavBar loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />
            <div className='app-container'>
              <Outlet />
            </div>
          </>
        }>
        <Route
          index
          element={
            <>
              <div className='title tang-b gold2'>ThankyouGorgeous</div>
              <ProductList loggedInUser={loggedInUser} />
            </>
          }
        />

        {/* <Route path='details'>
          <Route
            index
            element={
              <AuthorizedRoute loggedInUser={loggedInUser}>
                <Navigate to={'/'} state={{ from: location }} replace />
              </AuthorizedRoute>
            }
          />

          <Route
            path=':productId'
            element={
              <AuthorizedRoute loggedInUser={loggedInUser}>
                <ProductDetails loggedInUser={loggedInUser} />
              </AuthorizedRoute>
            }
          />
        </Route> */}
      </Route>

      <Route path='*' element={<Navigate to={'/'} replace />} />

      <Route
        path='/register'
        element={
          <AuthorizedRoute loggedInUser={loggedInUser} isPublicOnly={true}>
            <Register setLoggedInUser={setLoggedInUser} />
          </AuthorizedRoute>
        }
      />

      <Route
        path='/login'
        element={
          <AuthorizedRoute loggedInUser={loggedInUser} isPublicOnly={true}>
            <Login setLoggedInUser={setLoggedInUser} />
          </AuthorizedRoute>
        }
      />
    </Routes>
  )
}
