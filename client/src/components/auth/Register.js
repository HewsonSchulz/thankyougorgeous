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
  const [isInvalid, setIsInvalid] = useState({ email: false, password: false, passwordConf: false, verCode: false })
  const [message, setMessage] = useState({ email: '', password: '', passwordConf: '', verCode: '' })
  const [verCodeSent, setVerCodeSent] = useState(false)
  const [verCode, setVerCode] = useState('')

  const navigate = useNavigate()

  const resetValidity = (
    isInvalidObj = { email: false, password: false, passwordConf: false, verCode: false },
    messageObj = { email: '', password: '', passwordConf: '', verCode: '' }
  ) => {
    setIsInvalid(isInvalidObj)
    setMessage(messageObj)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    registerUser({ email, password, password_conf: passwordConf }, verCodeSent && verCode).then((data) => {
      if (data.valid) {
        setVerCodeSent(true)
        if (data.status === 201) {
          //TODO handle create user
        }
      } else {
        resetValidity()

        switch (data.message) {
          case 'Missing property(s)':
            for (const prop of data.missing_props) {
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
            updateStateObj(setMessage, 'passwordConf', data.message)
            updateStateObj(setIsInvalid, 'passwordConf', true)
            break
          case 'That email is already in use':
            updateStateObj(setMessage, 'email', data.message)
            updateStateObj(setIsInvalid, 'email', true)
            break
          //TODO case 'That verification code is expired or incorrect':
          default:
            resetValidity(
              { email: true, password: true, passwordConf: true, verCode: true },
              { email: data.message, password: '', passwordConf: '', verCode: '' }
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

        {!verCodeSent ? (
          <Button color='primary' onClick={handleSubmit}>
            Verify Email
          </Button>
        ) : (
          <>
            <p>Your email verification code has been sent! Please check your inbox, and enter your 6-digit code.</p>

            <FormGroup id='login__email-ver'>
              <Input
                id='login__email-ver-input'
                type='text'
                value={verCode}
                placeholder='Verification Code'
                invalid={isInvalid.verCode}
                onChange={(e) => {
                  updateStateObj(setIsInvalid, 'verCode', false)
                  setVerCode(e.target.value)
                }}
              />
              <FormFeedback>{message.verCode}</FormFeedback>
            </FormGroup>

            <Button color='primary' onClick={handleSubmit}>
              Register
            </Button>
          </>
        )}
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
