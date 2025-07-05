import './App.css'
import SignupFormDemo from './components/signup-form-demo'
import SigninFormDemo from './components/signin-form-demo'
import {BrowserRouter,Route,Routes} from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { Room } from './pages/Room'
import { ThemeToggle } from './components/theme-toggle'
import { SocketProvider } from './context/SocketProvider'

function App() {


  return (
    <BrowserRouter>
      <ThemeToggle />
      <SocketProvider>
        <Routes>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/room/:roomId" element={<Room/>} />
          <Route path="/signin" element={<SigninFormDemo />} />
          <Route path="/signup" element={<SignupFormDemo />} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  )
}


export default App
