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
import { FileProvider } from './context/FileContext'
import { SocketProvider, useSocket } from './context/SocketContext'
import SocketRegistrar from './SocketRegister'
import FileTransfer from './FileTransfer/FileTransfer'
import { WebRTCProvider } from './context/WebRTCContext'
import FileReceiver from './FileReceiver/FileReceiver'

function App() {
  return (
    <>

      <SocketProvider>
        <WebRTCProvider >
          <FileProvider>
            <UserIdProvider>
              <SocketRegistrar />
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
                  <Route path='/file-transfer' element={<FileTransfer />} />
                  <Route path='/file-receiver' element={<FileReceiver />} />
                  <Route path="*" element={<NotFoundPage />} />

                </Routes>
              </Router>
            </UserIdProvider>
          </FileProvider>
        </WebRTCProvider>
      </SocketProvider>
    </>
  )
}

export default App
