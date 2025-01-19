import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Button, FormFeedback, FormGroup, Input } from 'reactstrap'
import { updateLocalObj, updateStateObj } from '../../helper'
import { logInUser } from '../../managers/userManager'
import { SubmitButton } from './SubmitButton'
import './auth.css'

export const Login = ({ setLoggedInUser }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isInvalid, setIsInvalid] = useState({ email: false, password: false })
  const [message, setMessage] = useState({ email: '', password: '' })

  const navigate = useNavigate()

  const resetValidity = (
    isInvalidObj = { email: false, password: false },
    messageObj = { email: '', password: '' }
  ) => {
    setIsInvalid(isInvalidObj)
    setMessage(messageObj)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    logInUser({ email, password }).then((data) => {
      if (data.valid) {
        const { valid, ...newUserData } = data
        updateLocalObj(newUserData, setLoggedInUser)
        navigate('/')
      } else {
        resetValidity()

        switch (data.message) {
          case 'Missing property(s)':
            for (const prop of data.missing_props) {
              updateStateObj(setMessage, prop, `Please enter your ${prop}`)
              updateStateObj(setIsInvalid, prop, true)
            }
            break
          default:
            resetValidity({ email: true, password: true }, { email: data.message, password: '' })
        }
      }
    })
  }

  return (
    <>
      <Form
        className='login__container'
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmit(e)
          }
        }}>
        <h1 className='login__title'>Please sign in to continue</h1>
        <FormGroup id='login__email'>
          <Input
            id='login__email-input'
            type='email'
            value={email}
            placeholder='Email'
            invalid={isInvalid.email}
            autoFocus
            onChange={(e) => {
              updateStateObj(setIsInvalid, 'email', false)
              setEmail(e.target.value.replace(/\s+/g, '').toLowerCase())
            }}
          />
          <FormFeedback>{message.email}</FormFeedback>
        </FormGroup>

        <FormGroup id='login__password'>
          <Input
            id='login__password-input'
            type='password'
            value={password}
            placeholder='Password'
            invalid={isInvalid.password}
            onChange={(e) => {
              updateStateObj(setIsInvalid, 'password', false)
              setPassword(e.target.value)
            }}
          />
          <FormFeedback>{message.password}</FormFeedback>
        </FormGroup>

        <SubmitButton text='Log in' onClick={handleSubmit} />
      </Form>
      <div className='login__register-link'>
        <Link to='/register' id='auth-link'>
          Not signed up? Click here to register.
        </Link>
      </div>
    </>
  )
}
