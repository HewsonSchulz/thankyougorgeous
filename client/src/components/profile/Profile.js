import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Form, FormGroup, Input } from 'reactstrap'
import { retrieveProfile, updateProfile } from '../../managers/userManager'
import { useEffect, useState } from 'react'
import { updateLocalObj, updateStateObj } from '../../helper'
import './Profile.css'

const ProfileItem = (profile, setProfile, item, placeholder = item, type = 'text', disabled = false) => {
  if (disabled) {
    return (
      <FormGroup>
        <Input
          className='profile-form__item profile-form__first-name'
          type={type}
          value={profile[item]}
          placeholder={placeholder}
          disabled
        />
      </FormGroup>
    )
  }
  return (
    <FormGroup>
      <Input
        className='profile-form__item profile-form__first-name'
        type={type}
        value={profile[item]}
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

  return (
    <Form className='profile-form'>
      {ProfileItem(profile, null, 'email', 'Email', 'text', true)}
      {ProfileItem(profile, setProfile, 'first_name', 'First Name')}
      {ProfileItem(profile, setProfile, 'last_name', 'Last Name')}
      {ProfileItem(profile, setProfile, 'phone_num', 'Phone Number', 'number')}
      {ProfileItem(profile, setProfile, 'venmo', 'Venmo')}
      {ProfileItem(profile, setProfile, 'cashapp', 'Cashapp')}
      {ProfileItem(profile, setProfile, 'paypal', 'PayPal')}
      {ProfileItem(profile, setProfile, 'address', 'Address')}

      {isModified ? (
        <button className='profile__save-btn profile__save-btn__enabled' onClick={(e) => handleSaveChanges(e)}>
          Save Changes
        </button>
      ) : (
        <button className='profile__save-btn' disabled>
          Save Changes
        </button>
      )}
    </Form>
  )
}
