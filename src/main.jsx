import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { PostsProvider } from './context/PostsContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { NotificationsProvider } from './context/NotificationsContext.jsx'
import { FollowProvider } from './context/FollowContext.jsx'
import { MessagesProvider } from './context/MessagesContext.jsx'
import './index.css'
import { firebaseReady, auth, db } from './firebase'

if (import.meta.env.DEV) {
  if (firebaseReady) console.log('Firebase connected:', auth.app.name, db.type)
  else console.warn('Firebase is NOT connected: the .env file is empty. See SETUP.md.')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <PostsProvider>
        <NotificationsProvider>
        <FollowProvider>
          <MessagesProvider>
            <App />
          </MessagesProvider>
        </FollowProvider>
        </NotificationsProvider>
      </PostsProvider>
    </AuthProvider>
  </BrowserRouter>
)