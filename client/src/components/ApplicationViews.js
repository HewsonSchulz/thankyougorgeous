import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { NavBar } from './nav/NavBar'
export const ApplicationViews = ({ loggedInUser, setLoggedInUser }) => {
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
        <Route index element={<>!AppViews</>} />
      </Route>

      <Route path='*' element={<Navigate to={'/'} replace />} />
    </Routes>
  )
}
