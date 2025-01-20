import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AuthorizedRoute } from './auth/AuthorizedRoute'
import { NavBar } from './nav/NavBar'
import { Register } from './auth/Register'
import { Login } from './auth/Login'
import { ProductList } from './products/ProductList'
import { ProductDetails } from './products/ProductsDetails'
import { Title } from './Title'
import { Cart } from './cart/Cart'
import { Order } from './cart/Order'

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
              <Title />
              <ProductList loggedInUser={loggedInUser} />
            </>
          }
        />

        <Route path='products'>
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
        </Route>

        <Route path='profile'>
          <Route
            index
            element={
              <AuthorizedRoute loggedInUser={loggedInUser}>
                <Navigate to={`/profile/${loggedInUser?.id}`} state={{ from: location }} replace />
              </AuthorizedRoute>
            }
          />

          <Route
            path=':loggedInUserId'
            element={<AuthorizedRoute loggedInUser={loggedInUser}>!Profile</AuthorizedRoute>}
          />
        </Route>

        <Route
          path='cart'
          element={
            <AuthorizedRoute loggedInUser={loggedInUser}>
              <Cart loggedInUser={loggedInUser} />
            </AuthorizedRoute>
          }
        />
        <Route
          path='order'
          element={
            <AuthorizedRoute loggedInUser={loggedInUser}>
              <Order />
            </AuthorizedRoute>
          }
        />
      </Route>

      <Route path='*' element={<Navigate to={'/'} replace />} />

      <Route
        path='/register'
        element={
          <AuthorizedRoute loggedInUser={loggedInUser} isPublicOnly={true}>
            <Title />
            <Register setLoggedInUser={setLoggedInUser} />
          </AuthorizedRoute>
        }
      />

      <Route
        path='/login'
        element={
          <AuthorizedRoute loggedInUser={loggedInUser} isPublicOnly={true}>
            <Title />
            <Login setLoggedInUser={setLoggedInUser} />
          </AuthorizedRoute>
        }
      />
    </Routes>
  )
}
