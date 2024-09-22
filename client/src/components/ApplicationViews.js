import { Navigate, Route, Routes } from 'react-router-dom'
export const ApplicationViews = ({ loggedInUser, setLoggedInUser }) => {
  return (
    <Routes>
      <Route path='/' element={<>!AppViews</>} />
      <Route path='*' element={<Navigate to={'/'} replace />} />
    </Routes>
  )
}
