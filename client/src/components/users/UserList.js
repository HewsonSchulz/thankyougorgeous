import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { scrollToTop } from '../../helper'
import { listUsers } from '../../managers/userManager'
import './UserList.css'

export const UserList = ({ loggedInUser }) => {
  const {
    data: users,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['users'],
    queryFn: listUsers,
  })

  useEffect(() => {
    scrollToTop()
  }, [])

  useEffect(() => {
    refetch()
  }, [loggedInUser, refetch])

  if (isLoading) {
    return <div className='loading'>Loading...</div>
  }

  return (
    <>
      <div className='cart-background user-list-background' />

      <div className='user-count-container'>
        <p className='user-count'>
          Total users: <i>{users.length}</i>
        </p>
      </div>

      <div className='user-list'>
        {users.map((user) => (
          <ul
            key={user.id}
            className='user'
            onClick={(e) => {
              e.preventDefault()
            }}>
            <div className='user-info'>
              <div className={'user__item user__label tang-b gold'}>{user.full_name}</div>
              <div className='user__item user__email'>{user.email}</div>
            </div>
          </ul>
        ))}
      </div>
    </>
  )
}
