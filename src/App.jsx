// App.jsx - Updated version
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css'
import AppLayout from "./Layout/AppLayout"
import LandingPage from "./Pages/Landing"
import Onboarding from "./Pages/Onboarding"
import JobPage from './Pages/Job';
import JobListing from './Pages/JobListing';
import PostJob from './Pages/PostJob';
import SavedJobs from './Pages/SaveJobs';
import Login from './Pages/Login';
import SignUp from './Pages/SignUp';
import MyJobs from './Pages/MyJobs';
import { ThemeProvider } from "@/components/themeProvider"

import "./App.css"

// const router = createBrowserRouter([
//   {
//     element: <AppLayout />,
//     children: [
//       {
//         path: '/',
//         element: <LandingPage />,
//         children: [
//           {
//             path: '/signup',
//             element: <SignUp />
//           }, {
//             path: '/login',
//             element: <Login />
//           }
//         ]
//       },
//       {
//         path: '/onboarding',
//         element: <Onboarding />
//       },
//       {
//         path: '/job/:id',
//         element: <JobPage />
//       },
//       {
//         path: '/jobs',
//         element: < JobListing />
//       },
//       {
//         path: '/postjob',
//         element: <PostJob />
//       },
//       {
//         path: '/savedjobs',
//         element: <SavedJobs />
//       },
//       {
//         path: '/myjobs',
//         element: <Onboarding />
//       },
//     ]
//   }
// ])


const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
        children: [
          {
            path:"signup",
            element: <SignUp />
          }
        ]
      },
      {
        path: '/onboarding',
        element: <Onboarding />
      },
      {
        path: '/job/:id',
        element: <JobPage />
      },
      {
        path: '/jobs',
        element: <JobListing />
      },
      {
        path: '/postjob',
        element: <PostJob />
      },
      {
        path: '/savedjobs',
        element: <SavedJobs />
      },
      {
        path: '/myjobs',
        element: <MyJobs /> // Ensure this is the correct component
      }
    ]
  }
]);


function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App
