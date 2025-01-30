import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AuthorizedRoute } from './auth/AuthorizedRoute'
import { NavBar } from './nav/NavBar'
import { Register } from './auth/Register'
import { Login } from './auth/Login'
import { ProductList } from './products/ProductList'
import { ProductDetails } from './products/ProductsDetails'
import { Title, TitleBackdrop } from './Title'
import { Cart } from './cart/Cart'
import { Order } from './cart/Order'
import { Profile } from './profile/Profile'
import { EditProduct } from './products/EditProduct'
import { NewProduct } from './products/NewProduct'

export const ApplicationViews = ({ loggedInUser, setLoggedInUser }) => {
  const location = useLocation()

  return (
    <Routes>
      <Route
        path='/'
        element={
          <div className='app-container'>
            {/* <NavBar loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} /> */}
            <Outlet />
          </div>
        }>
        <Route
          index
          element={
            <div className='title-container'>
              <div className='shipping'>📦 FREE SHIPPING ON ORDERS OVER $75 ✨</div>
              <Title />
              <NavBar loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} isTitle={true} />
              <TitleBackdrop />
            </div>
          }
        />

        <Route path='products'>
          <Route
            index
            element={
              <AuthorizedRoute loggedInUser={loggedInUser}>
                <NavBar loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />
                <ProductList loggedInUser={loggedInUser} />
              </AuthorizedRoute>
            }
          />

          <Route
            path=':productId'
            element={
              <AuthorizedRoute loggedInUser={loggedInUser}>
                <NavBar loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />
                <ProductDetails loggedInUser={loggedInUser} />
              </AuthorizedRoute>
            }
          />

          <Route path='edit'>
            <Route
              index
              element={
                <AuthorizedRoute loggedInUser={loggedInUser} isAdminOnly={true}>
                  <Navigate to={'/newproduct'} state={{ from: location }} replace />
                </AuthorizedRoute>
              }
            />
            <Route
              path=':productId'
              element={
                <AuthorizedRoute loggedInUser={loggedInUser} isAdminOnly={true}>
                  <NavBar loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />
                  <EditProduct loggedInUser={loggedInUser} />
                </AuthorizedRoute>
              }
            />
          </Route>
        </Route>

        <Route
          path='newproduct'
          element={
            <AuthorizedRoute loggedInUser={loggedInUser} isAdminOnly={true}>
              <NavBar loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />
              <NewProduct loggedInUser={loggedInUser} />
            </AuthorizedRoute>
          }
        />

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
            element={
              <AuthorizedRoute loggedInUser={loggedInUser}>
                <NavBar loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />
                <Profile loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />
              </AuthorizedRoute>
            }
          />
        </Route>

        <Route
          path='cart'
          element={
            <AuthorizedRoute loggedInUser={loggedInUser}>
              <NavBar loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />
              <Cart loggedInUser={loggedInUser} />
            </AuthorizedRoute>
          }
        />
        <Route
          path='order'
          element={
            <AuthorizedRoute loggedInUser={loggedInUser}>
              <NavBar loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />
              <Order loggedInUser={loggedInUser} />
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
