import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Button, FormFeedback, FormGroup, Input } from 'reactstrap'
import { updateStateObj } from '../../helper'
import { registerUser } from '../../managers/userManager'
//! import './auth.css'

export const Register = ({ setLoggedInUser }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConf, setPasswordConf] = useState('')
  const [isInvalid, setIsInvalid] = useState({ email: false, password: false, passwordConf: false })
  const [message, setMessage] = useState({ email: '', password: '', passwordConf: '' })

  const navigate = useNavigate()

  const resetValidity = (
    isInvalidObj = { email: false, password: false, passwordConf: false },
    messageObj = { email: '', password: '', passwordConf: '' }
  ) => {
    setIsInvalid(isInvalidObj)
    setMessage(messageObj)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    registerUser({ email, password, password_conf: passwordConf }).then((tokenData) => {
      if (tokenData.valid) {
        //TODO handle save user
        // saveUser(tokenData, setLoggedInUser)
        // navigate('/')
      } else {
        resetValidity()

        switch (tokenData.message) {
          case 'Missing property(s)':
            for (const prop of tokenData.missing_props) {
              if (prop === 'password_conf') {
                updateStateObj(setMessage, 'passwordConf', 'Please confirm your password')
                updateStateObj(setIsInvalid, 'passwordConf', true)
              } else {
                updateStateObj(setMessage, prop, `Please enter your ${prop}`)
                updateStateObj(setIsInvalid, prop, true)
              }
            }
            break
          case 'Your password confirmation does not match':
            updateStateObj(setMessage, 'passwordConf', tokenData.message)
            updateStateObj(setIsInvalid, 'passwordConf', true)
            break
          case 'That email is already in use':
            updateStateObj(setMessage, 'email', tokenData.message)
            updateStateObj(setIsInvalid, 'email', true)
            break
          //TODO case 'That verification code is expired or incorrect':
          default:
            resetValidity(
              { email: true, password: true, passwordConf: true },
              { email: tokenData.message, password: '', passwordConf: '' }
            )
        }
      }
    })
  }

  return (
    <div className='login__container'>
      <Form
        className='login__card'
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmit(e)
          }
        }}>
        <h1 className='login__title'>Register</h1>
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

        <FormGroup id='login__password-conf'>
          <Input
            id='login__password-conf-input'
            type='password'
            value={passwordConf}
            placeholder='Confirm Password'
            invalid={isInvalid.passwordConf}
            onChange={(e) => {
              updateStateObj(setIsInvalid, 'passwordConf', false)
              setPasswordConf(e.target.value)
            }}
          />
          <FormFeedback>{message.passwordConf}</FormFeedback>
        </FormGroup>

        <Button color='primary' onClick={handleSubmit}>
          Register
        </Button>
      </Form>
      <p className='login__register-link'>
        Already signed up? Log in{' '}
        <Link to='/login' id='auth-link'>
          here
        </Link>
        .
      </p>
    </div>
  )
}
