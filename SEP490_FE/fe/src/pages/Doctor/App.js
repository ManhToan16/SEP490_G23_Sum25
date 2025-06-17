import logo from './logo.svg';
import './App.css';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorScheduleView from './pages/doctorschedule/DoctorScheduleView';
import DoctorProfile from './pages/doctorprofile/DoctorProfile';
// import Header from './components/Header';

function App() {
  return (
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
    //  <div>
    //   <Header />
    //   <p>Nội dung chính ở đây.</p>
    // </div>
  
       <div className="App">
      <DoctorDashboard />
    </div>
  );
}

export default App;
