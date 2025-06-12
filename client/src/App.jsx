import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Home/Home'
import Help from './Help/Help'
import Send from './Send/Send'
import Receive from './Receive/Receive'
import TermsAndConditions from './TermsandCondtion/TermsandCondition'
import PrivacyPolicy from './PrivacyPolicy/PrivacyPolicy'
import ContactUs from './ContactUs/ContactUs'
import { UserIdProvider } from './context/UserIdContext'; 
import SendInfo from './Send/SendInfo/SendInfo'

function App() {

  return (
    <>
      <UserIdProvider>

        <Router>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/help' element={<Help />} />
            <Route path='/send' element={<Send />} />
            <Route path='/receive' element={<Receive />} />
            <Route path='/termsandcondtion' element={<TermsAndConditions />} />
            <Route path='/privacypolicy' element={<PrivacyPolicy />} />
            <Route path='/contactus' element={<ContactUs />} />
            <Route path='/sendinfo' element={<SendInfo />} />
          </Routes>
        </Router>
      </UserIdProvider>
    </>
  )
}

export default App
