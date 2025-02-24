import { useQuery } from '@tanstack/react-query'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Form, FormGroup, Input } from 'reactstrap'
import { retrieveProfile, updateProfile } from '../../managers/userManager'
import { useEffect, useState } from 'react'
import { updateLocalObj, updateStateObj } from '../../helper'
import './Profile.css'

const ProfileItem = (loggedInUser, profile, setProfile, item, placeholder = item, type = 'text', disabled = false) => {
  if (profile.id !== loggedInUser.id) {
    disabled = true
  }

  if (disabled) {
    return (
      <FormGroup>
        <Input
          className={`profile-form__item profile-form__${item}`}
          type={type}
          value={profile[item] || ''}
          placeholder={placeholder}
          disabled
        />
      </FormGroup>
    )
  }
  if (item === 'phone_num') {
    return (
      <FormGroup>
        <Input
          className={`profile-form__item profile-form__${item}`}
          type={type}
          value={profile[item] || ''}
          placeholder={placeholder}
          onChange={(e) => {
            const numericValue = e.target.value.replace(/[^0-9]/g, '') // remove non-numeric characters
            updateStateObj(setProfile, item, numericValue)
          }}
        />
      </FormGroup>
    )
  }
  return (
    <FormGroup>
      <Input
        className={`profile-form__item profile-form__${item}`}
        type={type}
        value={profile[item] || ''}
        placeholder={placeholder}
        onChange={(e) => updateStateObj(setProfile, item, e.target.value)}
      />
    </FormGroup>
  )
}

export const Profile = ({ loggedInUser, setLoggedInUser }) => {
  const [profile, setProfile] = useState({})
  const { loggedInUserId } = useParams()
  const [isModified, setIsModified] = useState(false)
  const navigate = useNavigate()

  const { data: profileData, isLoading } = useQuery({
    queryKey: [`profile${loggedInUserId}`, loggedInUserId],
    queryFn: () => retrieveProfile(loggedInUserId),
    enabled: !!loggedInUserId,
  })

  const handleSaveChanges = (e) => {
    e.preventDefault()
    if (profile.phone_num === '' || profile.phone_num === null) {
      profile.phone_num = null
    } else {
      profile.phone_num = Number(profile.phone_num)
    }

    updateProfile(profile, loggedInUser.id).then((updatedProfile) => {
      if (updatedProfile.valid) {
        const { valid, ...profItems } = updatedProfile
        updateLocalObj(profItems, setLoggedInUser)
        setProfile(profItems)
        setIsModified(false)
        window.alert('Your changes have been saved.')
      } else {
        window.alert(updatedProfile.message || updatedProfile.error)
      }
    })
  }

  useEffect(() => {
    if (!!loggedInUser && loggedInUser !== 'loading') {
      setIsModified(false)
      for (const i in loggedInUser) {
        if (i in profile && loggedInUser[i] !== profile[i]) {
          setIsModified(true)
        }
      }
    }
  }, [loggedInUser, profile])

  useEffect(() => {
    if (!isLoading) {
      setProfile(profileData)
    }
  }, [profileData, isLoading])

  if (isLoading) {
    return <div className='loading center-txt'>Loading...</div>
  }

  if (!!profile.error || !!profile.message) {
    return <Navigate to='/' replace />
  }

  return (
    <>
      <div className='cart-background auth-background' />
      <Form className='profile-form'>
        {ProfileItem(loggedInUser, profile, null, 'email', 'Email', 'text', true)}
        {ProfileItem(loggedInUser, profile, setProfile, 'first_name', 'First Name')}
        {ProfileItem(loggedInUser, profile, setProfile, 'last_name', 'Last Name')}
        {ProfileItem(loggedInUser, profile, setProfile, 'phone_num', 'Phone Number')}
        {ProfileItem(loggedInUser, profile, setProfile, 'venmo', 'Venmo')}
        {ProfileItem(loggedInUser, profile, setProfile, 'cashapp', 'Cashapp')}
        {ProfileItem(loggedInUser, profile, setProfile, 'paypal', 'PayPal')}
        {ProfileItem(loggedInUser, profile, setProfile, 'address', 'United States Address')}

        {isModified ? (
          <>
            <button className='profile__save-btn profile__save-btn__enabled' onClick={(e) => handleSaveChanges(e)}>
              Save Changes
            </button>
            {loggedInUser.is_admin && !!profile && (
              <button
                className='profile__save-btn profile__save-btn__enabled view-user-btn'
                onClick={(e) => navigate('/users')}>
                View Users
              </button>
            )}
          </>
        ) : (
          <>
            <button className='profile__save-btn' disabled>
              Save Changes
            </button>
            {loggedInUser.is_admin && !!profile && (
              <button
                className='profile__save-btn profile__save-btn__enabled view-user-btn'
                onClick={(e) => navigate('/users')}>
                View Users
              </button>
            )}
          </>
        )}
      </Form>
    </>
  )
}
