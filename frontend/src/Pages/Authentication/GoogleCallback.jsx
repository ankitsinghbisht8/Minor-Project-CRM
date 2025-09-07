import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser, setToken } from '../../redux/slices/authslice'
import { CircularProgress, Alert, Box, Typography } from '@mui/material'
import { CheckCircle, Error } from '@mui/icons-material'
import axios from 'axios'

const GoogleCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('processing')
  const [error, setError] = useState(null)
  const dispatch = useDispatch()

  const fetchUser = async () => {
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/auth/me`, { withCredentials: true })
    return response.data
  }

  useEffect(() => {
    const handleGoogleAuth = async () => {
      const success = searchParams.get('success')
      const errorParam = searchParams.get('error')

      // Handle OAuth error from Google or backend
      if (errorParam) {
        console.error('OAuth error:', errorParam)
        setError(`Authentication failed: ${errorParam}`)
        setStatus('error')
        return
      }

      // Handle successful authentication
      if (success === 'true') {
        try {
          const userData = await fetchUser()
          const user=userData.user
          const token=userData.token
          console.log(userData)

          dispatch(setToken({
            token: token
          }))
  
          // Set user and token in Redux store
          dispatch(setUser({
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              profilePicture: user.profilePicture
            }
          }))
          
          setStatus('success')
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
          
        } catch (err) {
          console.error('Token processing error:', err)
          setError('Failed to process authentication token')
          setStatus('error')
        }
      } else {
        setError('No authentication data received')
        setStatus('error')
      }
    }

    handleGoogleAuth()
  }, [searchParams, navigate, dispatch])

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Processing Google Authentication...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we complete your login.
            </Typography>
          </Box>
        )
      
      case 'success':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Authentication Successful!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting to dashboard...
            </Typography>
          </Box>
        )
      
      case 'error':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Error sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Authentication Failed
            </Typography>
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              You will be redirected to the login page shortly.
            </Typography>
          </Box>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full mx-4">
        {renderContent()}
      </div>
    </div>
  )
}

export default GoogleCallback
