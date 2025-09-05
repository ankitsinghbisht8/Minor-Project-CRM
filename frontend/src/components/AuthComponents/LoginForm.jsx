import React from 'react'

const LoginForm = ({ onToggleToRegister }) => {
  return (
    <div className="bg-white shadow-xl rounded-2xl p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
        <p className="mt-2 text-sm text-gray-500">Welcome back. Access your CRM dashboard</p>
      </div>

      <div className="grid gap-3">
        <button
          type="button"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => console.log('Google SSO clicked')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.826 31.91 29.274 35 24 35 16.82 35 11 29.18 11 22S16.82 9 24 9c3.59 0 6.84 1.36 9.35 3.58l5.65-5.65C35.9 3.04 30.27 1 24 1 10.745 1 0 11.745 0 25s10.745 24 24 24 24-10.745 24-24c0-1.627-.165-3.215-.389-4.917z"/>
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.816C14.46 16.129 18.9 13 24 13c3.59 0 6.84 1.36 9.35 3.58l5.65-5.65C35.9 3.04 30.27 1 24 1 15.317 1 7.897 5.523 3.69 12.308l2.616 2.383z"/>
            <path fill="#4CAF50" d="M24 49c6.135 0 11.72-2.35 15.86-6.161l-7.32-6.19C30.08 38.86 27.18 40 24 40c-5.24 0-9.72-3.12-11.62-7.59l-6.53 5.03C9.94 44.36 16.46 49 24 49z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.04 2.49-2.83 4.46-5.043 5.649.001-.001 7.32 6.19 7.32 6.19C40.893 36.266 48 31 48 25c0-1.627-.165-3.215-.389-4.917z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <button
          type="button"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => console.log('SSO clicked')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
            <path d="M12 1l3 4h4l-3 4 3 4h-4l-3 4-3-4H5l3-4-3-4h4l3-4z"/>
          </svg>
          <span>Continue with SSO</span>
        </button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs uppercase tracking-wider text-gray-400">or</span>
        </div>
      </div>

      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); console.log('Login submit') }}>
        <div className="grid gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
            <a href="#" className="text-xs font-medium text-blue-600 hover:underline">Forgot?</a>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Enter your password"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <input id="remember" name="remember" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <label htmlFor="remember" className="text-sm text-gray-600">Remember me</label>
        </div>

        <button
          type="submit"
          className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Sign in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        New here?{' '}
        <button type="button" onClick={onToggleToRegister} className="font-medium text-blue-600 hover:underline">Create an account</button>
      </p>
    </div>
  )
}

export default LoginForm


