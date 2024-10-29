import { useEffect, useState } from 'react'
import { ApplicationViews } from './components/ApplicationViews'

export const App = () => {
  const [loggedInUser, setLoggedInUser] = useState(null)

  useEffect(() => {
    const user = localStorage.getItem('thankyougorgeous_user')
    if (!!user) {
      setLoggedInUser(JSON.parse(user))
    } else {
      setLoggedInUser(null)
    }
  }, [])

  return <ApplicationViews loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />
}
