import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const [pesel, setPesel] = useState('');
  const [password, setPassword] = useState('');
  const [isLargeText, setIsLargeText] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [error, setError] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(null);
  
  const [isHoveredToggle, setIsHoveredToggle] = useState(false);
  const [isPressedToggle, setIsPressedToggle] = useState(false);

  
  const setupVoice = useCallback(() => {
    const allVoices = window.speechSynthesis.getVoices();
    const polishVoices = allVoices.filter(v => v.lang.includes('pl'));
    
  
    const maleVoice = polishVoices.find(v => 
      ['adam', 'krzysztof', 'jakub', 'jan', 'lukasz', 'male'].some(name => 
        v.name.toLowerCase().includes(name)
      )
    );
    setSelectedVoice(maleVoice || polishVoices[0]);
  }, []);

  useEffect(() => {
    setupVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = setupVoice;
    }
  }, [setupVoice]);

  const speak = (text) => {
    if (!isLargeText) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.lang = 'pl-PL';
    utterance.rate = 0.85;
    utterance.pitch = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pesel, password })
      });
      
      const data = await response.json();

      if (data.success) {
        setLoggedInUser(data.user);
        setError('');
        if (isLargeText) speak(`Witaj ${data.user.name}. Zostałeś pomyślnie zalogowany.`);
      } else {
        setError(data.message || 'Błędne dane logowania');
        if (isLargeText) speak("Przepraszam, podany login lub hasło są nieprawidłowe.");
      }
    } catch (err) {
      console.error("Błąd połączenia:", err);
      setError('Brak połączenia z serwerem');
    }
  };

  const handleLogout = () => {
    window.speechSynthesis.cancel();
    setLoggedInUser(null);
    setPesel('');
    setPassword('');
    setIsLargeText(false);
  };

  return (
    <div style={{ 
      width: '100vw', height: '100vh', position: 'relative', display: 'flex', 
      alignItems: 'center', justifyContent: 'center', fontFamily: "'Montserrat', sans-serif", 
      backgroundColor: loggedInUser ? '#FFFFFF' : '#000', 
      overflow: 'hidden'
    }}>
    
      {!loggedInUser && (
        <>
          <div style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
            backgroundImage: "url('/stethoscope-scrubs.jpg')", 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            zIndex: 0 
          }}></div>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1 }}></div>
          
         
          <button 
            onClick={() => {
              const newState = !isLargeText;
              setIsLargeText(newState);
              if (newState) speak("Tryb powiększony został włączony.");
            }} 
            onMouseEnter={() => setIsHoveredToggle(true)}
            onMouseLeave={() => { setIsHoveredToggle(false); setIsPressedToggle(false); }}
            onMouseDown={() => setIsPressedToggle(true)}
            onMouseUp={() => setIsPressedToggle(false)}
            style={{
              position: 'absolute', top: '30px', right: '40px', zIndex: 10, 
              padding: '15px 0', 
              width: '120px',    
              borderRadius: '20px', 
              backgroundColor: isHoveredToggle ? '#DC2626' : (isLargeText ? '#3B82F6' : '#1E3A8A'),
              color: 'white', 
              fontSize: '36px', 
              fontWeight: '900',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: 'none',
              textAlign: 'center', 
              boxShadow: isPressedToggle ? 'none' : '0 4px 12px rgba(0,0,0,0.2)',
              outline: 'none',
              userSelect: 'none',
              textTransform: 'uppercase'
            }}
          >
            {isLargeText ? <ZoomOut size={30} /> : <ZoomIn size={30} />}
          </button>
        </>
      )}

      
      {!loggedInUser ? (
        <LoginPage 
          pesel={pesel} 
          setPesel={setPesel} 
          password={password} 
          setPassword={setPassword} 
          handleLogin={handleLogin} 
          isLargeText={isLargeText} 
          speak={speak} 
          error={error} 
        />
      ) : (
        <>
          {loggedInUser.role === "lekarz" ? (
            <DoctorDashboard 
              user={loggedInUser} 
              onLogout={handleLogout} 
              isLargeText={isLargeText}
              setIsLargeText={setIsLargeText}
            />
          ) : loggedInUser.role === "admin" ? (
            <AdminDashboard 
              user={loggedInUser} 
              onLogout={handleLogout} 
              isLargeText={isLargeText}
              setIsLargeText={setIsLargeText}
            />
          ) : (
            <PatientDashboard 
              user={loggedInUser} 
              onLogout={handleLogout} 
              isLargeText={isLargeText}
              setIsLargeText={setIsLargeText}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;