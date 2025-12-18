import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import '@mantine/core/styles.css';
import { Provider } from 'react-redux'
import {store} from './store'
import AuthenticationTitle from './components/Auth.jsx'
import Register from './components/Register.jsx'
import Posts from './components/Posts.jsx'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import { createTheme, MantineProvider } from '@mantine/core';
import NewPost from './components/newPost.jsx';
import Profile from './components/Profile.jsx';
import PublicProfile from './components/PublicProfile.jsx';
import Admin from './components/Admin.jsx';
import Dashboard from './components/Dashboard.jsx';

const theme = createTheme({
  fontFamily: 'Roboto, system-ui, -apple-system, Segoe UI, sans-serif',
  headings: { fontFamily: 'Roboto, system-ui, -apple-system, Segoe UI, sans-serif' },
  primaryColor: 'violet',
  defaultRadius: 'md',
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: '/signin',
    element: <AuthenticationTitle/>
  },
  {
    path: '/signup',
    element: <Register/>
  },
  {
    path: '/posts/:postId',
    element: <NewPost/>
  },
  {
    path: '/posts',
    element: <Posts/>,
  },
  {
    path: '/profile',
    element: <Profile/>,
  },
  {
    path: '/profiles/:username',
    element: <PublicProfile/>,
  },
  {
    path: '/admin',
    element: <Admin/>,
  },
  {
    path: '/dashboard',
    element: <Dashboard/>,
  },
  
])

ReactDOM.createRoot(document.getElementById('root')).render(
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Provider store={store}>
        <RouterProvider router={router}/>
      </Provider>
    </MantineProvider>
)
