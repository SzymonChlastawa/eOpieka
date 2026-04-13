import React, { useState } from 'react';
import { Volume2, ZoomIn, ZoomOut } from 'lucide-react';

const LoginPage = ({ pesel, setPesel, password, setPassword, handleLogin, isLargeText, speak, error }) => {
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [isPressed, setIsPressed] = useState(false);


  const DARKER_BLUE = '#F0F9FF'; 
  const PRIMARY_BLUE = '#1E3A8A';
  const LIGHT_BLUE = '#3B82F6';
  const ERROR_RED = '#DC2626';

  const inputStyle = {
    padding: isLargeText ? '22px 30px' : '18px 25px',
    borderRadius: '20px', 
    border: isLargeText ? '3px solid #B9D7F2' : 'none', 
    fontSize: isLargeText ? '38px' : '17px', 
    outline: 'none',
    fontFamily: "'Montserrat', sans-serif", 
    color: '#334155',
    backgroundColor: 'white',
    width: '100%', 
    boxSizing: 'border-box', 
    transition: 'all 0.3s ease',
    boxShadow: isLargeText 
      ? '0 8px 20px rgba(30, 58, 138, 0.15)' 
      : '0 4px 12px rgba(30, 58, 138, 0.08)'
  };

  const speakerButtonStyle = (id) => ({
    background: hoveredBtn === id ? ERROR_RED : LIGHT_BLUE, 
    border: 'none',
    borderRadius: '50%',
    width: '65px', 
    height: '65px', 
    cursor: 'pointer', 
    display: 'flex',
    alignItems: 'center', 
    justifyContent: 'center', 
    color: 'white', 
    transition: 'all 0.2s ease',
    outline: 'none',
    flexShrink: 0
  });

  return (
    <div style={{
      position: 'relative', 
      zIndex: 2, 
      width: isLargeText ? '45%' : '32%',
      backgroundColor: DARKER_BLUE, 
      borderRadius: '35px', 
      padding: isLargeText ? '50px 60px' : '45px 55px',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      transition: 'all 0.4s ease',
      boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
    }}>
      
      {/* Logo i Tytuł */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '25px', marginBottom: '50px' }}>
        <img src="/logo_eOpieka.png" alt="Logo" style={{ height: isLargeText ? '90px' : '70px', transition: 'all 0.4s ease' }} />
        <h2 style={{ margin: 0, color: PRIMARY_BLUE, fontSize: isLargeText ? '60px' : '48px', fontWeight: '800', letterSpacing: '-1.5px' }}>
          e<span style={{ color: LIGHT_BLUE }}>-</span>Opieka
        </h2>
      </div>

      <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center' }}>
        
        {/* Pole: PESEL / Login */}
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
            {isLargeText && (
              <button 
                type="button" 
                onClick={() => speak("Proszę wpisać swój numer pesel lub login.")} 
                onMouseEnter={() => setHoveredBtn('spk1')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={speakerButtonStyle('spk1')}
              >
                <Volume2 size={32} />
              </button>
            )}
            <label style={{ color: PRIMARY_BLUE, fontSize: isLargeText ? '28px' : '14px', fontWeight: '800', textTransform: 'uppercase' }}>
              Numer PESEL / Login:
            </label>
          </div>
          <input 
            type="text" 
            value={pesel} 
            onChange={(e) => setPesel(e.target.value)} 
            placeholder="Wpisz PESEL lub login" 
            style={inputStyle} 
          />
        </div>

        {/* Pole: Hasło */}
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
            {isLargeText && (
              <button 
                type="button" 
                onClick={() => speak("Proszę wpisać swoje hasło.")} 
                onMouseEnter={() => setHoveredBtn('spk2')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={speakerButtonStyle('spk2')}
              >
                <Volume2 size={32} />
              </button>
            )}
            <label style={{ color: PRIMARY_BLUE, fontSize: isLargeText ? '28px' : '14px', fontWeight: '800', textTransform: 'uppercase' }}>
              Hasło:
            </label>
          </div>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Wpisz swoje Hasło" 
            style={inputStyle} 
          />
        </div>

        {/* Komunikat o błędzie */}
        {error && (
          <p style={{ color: ERROR_RED, fontSize: isLargeText ? '24px' : '14px', fontWeight: '800', margin: 0 }}>
            {error}
          </p>
        )}

        {/* Sekcja przycisku logowania */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%', justifyContent: 'center' }}>
          {isLargeText && (
            <button 
              type="button" 
              onClick={() => speak("Kliknij ten przycisk, aby się zalogować.")} 
              onMouseEnter={() => setHoveredBtn('spk3')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={speakerButtonStyle('spk3')}
            >
              <Volume2 size={32} />
            </button>
          )}
          <button 
            type="submit" 
            onMouseEnter={() => setHoveredBtn('login')}
            onMouseLeave={() => { setHoveredBtn(null); setIsPressed(false); }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            style={{
              width: 'auto', 
              padding: isLargeText ? '25px 60px' : '20px 40px', 
              borderRadius: '20px',
              backgroundColor: hoveredBtn === 'login' ? ERROR_RED : PRIMARY_BLUE, 
              color: 'white', 
              fontSize: isLargeText ? '32px' : '18px',
              fontWeight: '900', 
              cursor: 'pointer', 
              border: 'none',
              transition: 'all 0.2s ease', 
              transform: isPressed ? 'scale(0.96)' : 'scale(1)',
              textTransform: 'uppercase',
              outline: 'none',
              userSelect: 'none'
            }}
          >
            ZALOGUJ SIĘ
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;