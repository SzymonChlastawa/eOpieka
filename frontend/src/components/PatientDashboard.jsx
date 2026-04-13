import React, { useState, useEffect } from 'react';
import { 
  User, 
  Hospital, 
  Stethoscope, 
  LogOut, 
  Calendar as CalendarIcon, 
  Pill, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Phone,
  Info,
  ListChecks,
  Ambulance,
  Contact,
  Activity,
  Volume2,
  IdCard,
  Heart,
  ClipboardList,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

const PatientDashboard = ({ user, onLogout, isLargeText, setIsLargeText }) => {
 
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const [dbPatients, setDbPatients] = useState([]);
  const [systemData, setSystemData] = useState(null); 
  const [loading, setLoading] = useState(true);

  const [fullPatientData, setFullPatientData] = useState(null);
  const [myPrescriptions, setMyPrescriptions] = useState([]);

  useEffect(() => {
   
    Promise.all([
      fetch(`${API_URL}/api/patients`).then(res => res.json()),
      fetch(`${API_URL}/api/system`).then(res => res.json()),
      fetch(`${API_URL}/api/prescriptions/${user.pesel}`).then(res => res.json())
    ])
    .then(([patientsData, sysData, prescriptionsData]) => {
      setDbPatients(patientsData);
      setSystemData(sysData);
      setMyPrescriptions(prescriptionsData);
      
      const me = patientsData.find(p => p.pesel === user.pesel);
      setFullPatientData(me);
      
      setLoading(false);
    })
    .catch(err => {
      console.error("Błąd pobierania danych:", err);
      setLoading(false);
    });

    const link = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = "/logo_eOpieka.png";
    }

    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes pulse-yellow-glow {
        0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7); }
        70% { box-shadow: 0 0 0 15px rgba(255, 215, 0, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
      }
    `;
    document.head.appendChild(styleSheet);
  }, [user.pesel, API_URL]);

  const patientData = fullPatientData; 

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('dane'); 
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [isHoveredToggle, setIsHoveredToggle] = useState(false);

  const scale = isLargeText ? 1.1 : 1;
  const fontScale = isLargeText ? 1.3 : 1;

  const MARGIN = '46px'; 
  const CONTAINER_PADDING = '23px 34.5px'; 
  const SECTION_GAP = '23px'; 
  const GRID_GAP = '14px'; 
  const ITEM_PADDING = '11.5px 17.25px'; 
  const DARKER_BLUE = '#EBF5FF';
  const BORDER_BLUE = '#B9D7F2';
  const FONT_FAMILY = "'Montserrat', sans-serif";

  const meds = patientData?.medications || [];
  const visits = patientData?.visits || [];

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const days = [];
  const startDay = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const offset = startDay === 0 ? 6 : startDay - 1;
  for (let i = 0; i < offset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth(currentDate.getFullYear(), currentDate.getMonth()); i++) days.push(i);
  const monthNames = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];

  const getEventsForDay = (day, month, year) => {
    const currentIterationDate = new Date(year, month, day);
    const dayLabels = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'];
    const currentDayLabel = dayLabels[currentIterationDate.getDay()];
    
    return { 
      dayVisits: visits.filter(v => {
        if (!v.date) return false;
        const parts = v.date.split('.');
        if (parts.length !== 3) return false;
        const vD = parseInt(parts[0], 10);
        const vM = parseInt(parts[1], 10) - 1; 
        const vY = parseInt(parts[2], 10);
        return vD === day && vM === month && vY === year;
      }),
      dayMeds: meds.filter(med => {
        if (med.endDate && med.endDate !== "Bezterminowo") {
            try {
                const [eD, eM, eY] = med.endDate.split('.').map(Number);
                const end = new Date(eY, eM - 1, eD);
                end.setHours(23, 59, 59); 
                if (currentIterationDate > end) return false;
            } catch(e) { return true; }
        }
        if (med.daysOfWeek && med.daysOfWeek[currentDayLabel] !== undefined) {
            return med.daysOfWeek[currentDayLabel] === true;
        }
        return true; 
      })
    };
  };

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pl-PL';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const formatMedsForSpeech = (med) => {
    const doseText = med.dose.replace("1 tabletka", "jedną tabletkę").replace("1 kapsułka", "jedną kapsułkę").replace("2 tabletki", "dwie tabletki");
    return `${med.name}, ${doseText}, ${med.timesPerDay || 1} razy dziennie`;
  };

  const labelStyle = { color: '#64748b', fontSize: '12.1px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: FONT_FAMILY };
  const valueStyle = { color: '#1E3A8A', fontSize: '17.6px', fontWeight: '800', wordBreak: 'break-word', fontFamily: FONT_FAMILY };
  const mainHeaderStyle = { color: '#1E3A8A', fontSize: '22px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '6px solid #3B82F6', paddingLeft: '15px', fontFamily: FONT_FAMILY };
  const groupTitleStyle = { color: '#3B82F6', fontSize: '14.9px', fontWeight: '800', textTransform: 'uppercase', borderBottom: `2px solid ${BORDER_BLUE}`, paddingBottom: '5px', width: '100%', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontFamily: FONT_FAMILY };
  const infoSectionStyle = { paddingLeft: MARGIN, paddingRight: MARGIN, paddingBottom: SECTION_GAP, display: 'flex', flexDirection: 'column', gap: '15px', fontFamily: FONT_FAMILY };
  const containerStyle = { backgroundColor: DARKER_BLUE, padding: CONTAINER_PADDING, borderRadius: '35px', border: `1px solid ${BORDER_BLUE}`, display: 'flex', flexDirection: 'column', gap: SECTION_GAP, boxShadow: 'none' };
  const dataGridStyle = { display: 'grid', gridTemplateColumns: isLargeText ? 'repeat(auto-fit, minmax(250px, 1fr))' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: GRID_GAP };
  const dataItemStyle = { display: 'flex', flexDirection: 'column', gap: '4px', padding: ITEM_PADDING, backgroundColor: 'white', borderRadius: '18px', boxShadow: 'none', fontFamily: FONT_FAMILY };

  const navButtonStyle = (id) => ({
    width: 'auto', 
    padding: isLargeText ? `${14 * scale}px ${16 * scale}px` : '14px 22px', 
    minHeight: `${60 * scale}px`, 
    borderRadius: '16px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease',
    backgroundColor: hoveredBtn === id ? '#DC2626' : (activeTab === id ? '#1E3A8A' : '#FFFFFF'),
    color: activeTab === id || hoveredBtn === id ? 'white' : '#1E3A8A',
    border: `1px solid ${ (isLargeText && activeTab !== id && hoveredBtn !== id) ? BORDER_BLUE : 'transparent' }`, 
    textTransform: 'uppercase', 
    fontSize: `${14 * fontScale}px`, 
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    fontFamily: FONT_FAMILY
  });

  const selectedDayEvents = getEventsForDay(selectedDate.getDate(), selectedDate.getMonth(), selectedDate.getFullYear());

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', fontFamily: FONT_FAMILY }}>Ładowanie danych pacjenta...</div>;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0, display: 'flex', flexDirection: 'column', backgroundColor: '#F1F5F9', overflowX: 'hidden', overflowY: 'auto', scrollbarGutter: 'stable', fontFamily: FONT_FAMILY }}>
      
      {/* HEADER */}
      <div style={{ 
        width: '100%', backgroundColor: DARKER_BLUE, 
        padding: `25px ${MARGIN} 15px ${MARGIN}`, 
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        boxSizing: 'border-box', borderBottom: `1px solid ${BORDER_BLUE}`, position: 'sticky', top: 0, zIndex: 1000, boxShadow: 'none' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', height: '60px', marginTop: '8px' }}>
          <img src="/logo_eOpieka.png" alt="Logo" style={{ height: '70px' }} />
          <h1 style={{ margin: 0, color: '#1E3A8A', fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px', fontFamily: FONT_FAMILY }}>
            e<span style={{ color: '#3B82F6' }}>-</span>Opieka
          </h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', justifyContent: 'center', alignItems: 'center', flexGrow: 1, margin: isLargeText ? '0 10px' : '0 30px' }}>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
            <button onClick={() => setActiveTab('dane')} onMouseEnter={() => setHoveredBtn('dane')} onMouseLeave={() => setHoveredBtn(null)} style={navButtonStyle('dane')}><User size={isLargeText ? 20 : 24}/> Moje Dane</button>
            <button onClick={() => setActiveTab('opieka')} onMouseEnter={() => setHoveredBtn('opieka')} onMouseLeave={() => setHoveredBtn(null)} style={navButtonStyle('opieka')}><Hospital size={isLargeText ? 20 : 24}/> Opieka</button>
            <button onClick={() => setActiveTab('wizyty')} onMouseEnter={() => setHoveredBtn('wizyty')} onMouseLeave={() => setHoveredBtn(null)} style={navButtonStyle('wizyty')}><CalendarIcon size={isLargeText ? 20 : 24}/> Leczenie</button>
            <button onClick={() => setActiveTab('sos')} onMouseEnter={() => setHoveredBtn('sos')} onMouseLeave={() => setHoveredBtn(null)} style={navButtonStyle('sos')}><Ambulance size={isLargeText ? 20 : 24}/> Pomoc SOS</button>
          </div>
          <div style={{ color: '#1E3A8A', fontSize: '14px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.8px', lineHeight: 1 }}>
            <IdCard size={20} color="#3B82F6" /> ZALOGOWANO PACJENTA: {user.name}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px', height: '60px' }}>
          <button 
            onClick={() => setIsLargeText(!isLargeText)}
            onMouseEnter={() => setIsHoveredToggle(true)}
            onMouseLeave={() => setIsHoveredToggle(false)}
            style={{
              padding: isLargeText ? '12px 15px' : '12px 18px',
              minHeight: `${60 * scale}px`, 
              borderRadius: '15px', 
              backgroundColor: isHoveredToggle ? '#DC2626' : (isLargeText ? '#3B82F6' : '#1E3A8A'), 
              color: 'white', 
              fontSize: `${20 * fontScale}px`,
              fontWeight: '900', cursor: 'pointer',
              border: 'none', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              animation: 'pulse-yellow-glow 2s infinite',
              fontFamily: FONT_FAMILY
            }}
          >
            {isLargeText ? <ZoomOut size={35} /> : <ZoomIn size={35} />}
          </button>

          <button onClick={() => { window.speechSynthesis.cancel(); onLogout(); }} onMouseEnter={() => setHoveredBtn('logout')} onMouseLeave={() => setHoveredBtn(null)}
            style={{ 
              ...navButtonStyle('logout'),
              backgroundColor: hoveredBtn === 'logout' ? '#DC2626' : '#1E3A8A', 
              color: 'white',
              border: 'none'
            }}>WYLOGUJ <LogOut size={isLargeText ? 28 : 20} /></button>
        </div>
      </div>

      <div style={{ flex: 1, paddingTop: '20px', paddingBottom: '40px' }}>
        
        {/* SEKCJA 1: MOJE DANE */}
        {activeTab === 'dane' && (
          <div style={infoSectionStyle}>
            <h3 style={{...mainHeaderStyle, fontSize: isLargeText ? `${22 * fontScale}px` : '22px'}}>
              <User size={isLargeText ? 28 * fontScale : 28} color="#3B82F6" /> PROFIL PACJENTA
            </h3>
            <div style={containerStyle}>
              <div style={{ backgroundColor: isLargeText ? '#F0F7FF' : 'rgba(255,255,255,0.4)', padding: '25px', borderRadius: '25px', border: isLargeText ? `2px solid ${BORDER_BLUE}` : 'none' }}>
                <span style={{...groupTitleStyle, fontSize: isLargeText ? `${14.9 * fontScale}px` : '14.9px', justifyContent: 'space-between'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <User size={isLargeText ? 20 * fontScale : 20} /> Informacje Osobiste
                  </div>
                  {isLargeText && patientData && (
                    <Volume2 
                      size={32} 
                      color="#3B82F6" 
                      style={{cursor: 'pointer'}} 
                      onClick={() => speak(`Informacje osobiste. Imię i Nazwisko: ${patientData.name}. Numer PESEL: ${patientData.pesel.split('').join(' ')}. Data urodzenia: ${patientData.birth}. Wiek: ${patientData.age} lat. Płeć: ${patientData.gender}.`)}
                    />
                  )}
                </span>
                <div style={dataGridStyle}>
                  {[
                    { label: "Imię i Nazwisko", val: patientData?.name || "Ładowanie..." },
                    { label: "Numer PESEL", val: patientData?.pesel || "Ładowanie..." },
                    { label: "Data Urodzenia", val: patientData?.birth || "Ładowanie..." },
                    { label: "Wiek", val: patientData?.age ? `${patientData.age} lat` : "Ładowanie..." },
                    { label: "Płeć", val: patientData?.gender || "Ładowanie..." }
                  ].map((item, i) => (
                    <div key={i} style={{...dataItemStyle, border: isLargeText ? `1px solid ${BORDER_BLUE}` : 'none', backgroundColor: 'white'}}>
                      <span style={{...labelStyle, fontSize: isLargeText ? `${12.1 * 1.3}px` : '12.1px'}}>{item.label}</span>
                      <span style={{...valueStyle, fontSize: isLargeText ? `${17.6 * fontScale * 1.2}px` : '17.6px'}}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: isLargeText ? '#F0F7FF' : 'rgba(255,255,255,0.4)', padding: '25px', borderRadius: '25px', border: isLargeText ? `2px solid ${BORDER_BLUE}` : 'none' }}>
                <span style={{...groupTitleStyle, fontSize: isLargeText ? `${14.9 * fontScale}px` : '14.9px', justifyContent: 'space-between'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <Contact size={isLargeText ? 20 * fontScale : 20} /> Adres i Kontakt
                  </div>
                  {isLargeText && patientData && (
                    <Volume2 
                      size={32} 
                      color="#3B82F6" 
                      style={{cursor: 'pointer'}} 
                      onClick={() => speak(`Adres zamieszkania: ${patientData.address}. Numer telefonu: ${patientData.phone.split('').join(' ')}. Adres e-mail: ${patientData.email}.`)}
                    />
                  )}
                </span>
                <div style={dataGridStyle}>
                  {[
                    { label: "Adres Zamieszkania", val: patientData?.address || "Ładowanie..." },
                    { label: "Numer Telefonu", val: patientData?.phone || "Ładowanie..." },
                    { label: "Adres E-mail", val: patientData?.email || "Ładowanie..." }
                  ].map((item, i) => (
                    <div key={i} style={{...dataItemStyle, border: isLargeText ? `1px solid ${BORDER_BLUE}` : 'none', backgroundColor: 'white'}}>
                      <span style={{...labelStyle, fontSize: isLargeText ? `${12.1 * 1.3}px` : '12.1px'}}>{item.label}</span>
                      <span style={{...valueStyle, fontSize: isLargeText ? `${17.6 * fontScale * 1.2}px` : '17.6px'}}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: isLargeText ? '#F0F7FF' : 'rgba(255,255,255,0.4)', padding: '25px', borderRadius: '25px', border: isLargeText ? `2px solid ${BORDER_BLUE}` : 'none' }}>
                <span style={{...groupTitleStyle, fontSize: isLargeText ? `${14.9 * fontScale}px` : '14.9px', justifyContent: 'space-between'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <Activity size={isLargeText ? 20 * fontScale : 20} /> Dane Medyczne
                  </div>
                  {isLargeText && patientData && (
                    <Volume2 
                      size={32} 
                      color="#3B82F6" 
                      style={{cursor: 'pointer'}} 
                      onClick={() => speak(`Dane medyczne. Grupa krwi: ${patientData.blood}. Wzrost i waga: ${patientData.height}, ${patientData.weight}. Alergie: ${patientData.allergies}.`)}
                    />
                  )}
                </span>
                <div style={dataGridStyle}>
                  {[
                    { label: "Grupa Krwi", val: patientData?.blood || "Ładowanie..." },
                    { label: "Wzrost i Waga", val: patientData ? `${patientData.height} / ${patientData.weight}` : "Ładowanie..." },
                    { label: "Alergie", val: patientData?.allergies || "Ładowanie..." }
                  ].map((item, i) => (
                    <div key={i} style={{...dataItemStyle, border: isLargeText ? `1px solid ${BORDER_BLUE}` : 'none', backgroundColor: 'white'}}>
                      <span style={{...labelStyle, fontSize: isLargeText ? `${12.1 * 1.3}px` : '12.1px'}}>{item.label}</span>
                      <span style={{...valueStyle, fontSize: isLargeText ? `${17.6 * fontScale * 1.2}px` : '17.6px'}}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEKCJA 2: OPIEKA */}
        {activeTab === 'opieka' && (
          <div style={infoSectionStyle}>
            <h3 style={{...mainHeaderStyle, fontSize: isLargeText ? `${22 * fontScale}px` : '22px'}}>
              <Hospital size={isLargeText ? 28 * fontScale : 28} color="#3B82F6" /> MOJA OPIEKA MEDYCZNA
            </h3>
            <div style={containerStyle}>
              <div style={{ backgroundColor: isLargeText ? '#F0F7FF' : 'rgba(255,255,255,0.4)', padding: '25px', borderRadius: '25px', border: isLargeText ? `2px solid ${BORDER_BLUE}` : 'none' }}>
                <span style={{...groupTitleStyle, fontSize: isLargeText ? `${14.9 * fontScale}px` : '14.9px', justifyContent: 'space-between'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <Stethoscope size={isLargeText ? 20 * fontScale : 20}/> Mój Lekarz Prowadzący
                  </div>
                  {isLargeText && (
                    <Volume2 
                      size={39} 
                      color="#3B82F6" 
                      style={{cursor: 'pointer'}} 
                      onClick={() => speak(`Mój lekarz prowadzący: ${fullPatientData?.assignedDoctor || "Brak przypisanego lekarza"}.`)}
                    />
                  )}
                </span>
                <div style={{ ...dataGridStyle, marginTop: '10px' }}>
                  <div style={dataItemStyle}>
                    <span style={labelStyle}>Lekarz Prowadzący</span>
                    <span style={valueStyle}>
                      {fullPatientData?.assignedDoctor || "Brak przypisanego lekarza"}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: isLargeText ? '#F0F7FF' : 'rgba(255,255,255,0.4)', padding: '25px', borderRadius: '25px', border: isLargeText ? `2px solid ${BORDER_BLUE}` : 'none' }}>
                <span style={{...groupTitleStyle, fontSize: isLargeText ? `${14.9 * fontScale}px` : '14.9px', justifyContent: 'space-between'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <Hospital size={isLargeText ? 20 * fontScale : 20}/> Informacje o Szpitalu
                  </div>
                  {isLargeText && systemData && (
                    <Volume2 
                      size={39} 
                      color="#3B82F6" 
                      style={{cursor: 'pointer'}} 
                      onClick={() => speak(`Informacje o szpitalu. Nazwa: ${systemData.hospitalName}. Adres główny: ${systemData.address}.`)}
                    />
                  )}
                </span>
                <div style={dataGridStyle}>
                  <div style={{...dataItemStyle, border: isLargeText ? `1px solid ${BORDER_BLUE}` : 'none'}}>
                    <span style={{...labelStyle, fontSize: isLargeText ? `${12.1 * 1.3}px` : '12.1px'}}>Nazwa Szpitala</span>
                    <span style={{...valueStyle, fontSize: isLargeText ? `${17.6 * fontScale * 1.2}px` : '17.6px'}}>{systemData?.hospitalName || "Ładowanie..."}</span>
                  </div>
                  <div style={{...dataItemStyle, border: isLargeText ? `1px solid ${BORDER_BLUE}` : 'none'}}>
                    <span style={{...labelStyle, fontSize: isLargeText ? `${12.1 * 1.3}px` : '12.1px'}}><MapPin size={isLargeText ? 14 : 12} style={{ display: 'inline', verticalAlign: 'middle' }}/> Adres GŁÓWNY</span>
                    <span style={{...valueStyle, fontSize: isLargeText ? `${17.6 * fontScale * 1.2}px` : '17.6px'}}>{systemData?.address || "Ładowanie..."}</span>
                  </div>
                </div>

                <span style={{ ...groupTitleStyle, marginTop: '30px', display: 'flex', fontSize: isLargeText ? `${14.9 * fontScale}px` : '14.9px' }}>
                  <ListChecks size={isLargeText ? 20 * fontScale : 20}/> Wykaz Oddziałów i Pokoje
                </span>
                <div style={dataGridStyle}>
                  {(systemData?.departments || []).map((item, i) => (
                    <div key={i} style={{...dataItemStyle, border: isLargeText ? `1px solid ${BORDER_BLUE}` : 'none', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                        <span style={{...labelStyle, fontSize: isLargeText ? `${12.9 * 1.3}px` : '12.1px'}}>{item.label}</span>
                        <span style={{...valueStyle, fontSize: isLargeText ? `${17.9 * fontScale}px` : '17.6px'}}>{item.val}</span>
                      </div>
                      {isLargeText && (
                        <Volume2 size={55} color="#3B82F6" style={{cursor: 'pointer'}} onClick={() => speak(item.speakText || `${item.label}, ${item.val}`)} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: isLargeText ? '#F0F7FF' : 'rgba(255,255,255,0.4)', padding: '25px', borderRadius: '25px', border: isLargeText ? `2px solid ${BORDER_BLUE}` : 'none' }}>
                <span style={{...groupTitleStyle, fontSize: isLargeText ? `${14.9 * fontScale}px` : '14.9px'}}>
                  <Phone size={isLargeText ? 20 * fontScale : 20}/> Telefony Kontaktowe
                </span>
                <div style={dataGridStyle}>
                  {(systemData?.phones || []).map((item, i) => (
                    <div key={i} style={{...dataItemStyle, border: isLargeText ? `1px solid ${BORDER_BLUE}` : 'none', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                        <span style={{...labelStyle, fontSize: isLargeText ? `${12.1 * 1.3}px` : '12.1px'}}>{item.label}</span>
                        <span style={{...valueStyle, fontSize: isLargeText ? `${17.6 * fontScale * 1.2}px` : '17.6px'}}>{item.val}</span>
                      </div>
                      {isLargeText && (
                        <Volume2 size={24} color="#3B82F6" style={{cursor: 'pointer'}} onClick={() => speak(`${item.label}. Numer telefonu: ${item.val.split('').join(' ')}.`)} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...dataItemStyle, backgroundColor: '#FFFFFF', borderLeft: isLargeText ? '15px solid #DC2626' : '10px solid #DC2626', padding: '25px', border: isLargeText ? `3px solid #DC2626` : 'none', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626' }}>
                    <Info size={isLargeText ? 24 * fontScale : 20} />
                    <span style={{ fontSize: '18px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ważna Informacja</span>
                  </div>
                  <p style={{ color: '#1E3A8A', fontSize: isLargeText ? '20px' : '15px', margin: 0, fontWeight: '700', marginTop: '8px', lineHeight: '1.6' }}>
                    W przypadku nagłego pogorszenia stanu zdrowia poza godzinami przyjęć placówki, należy zgłosić się bezpośrednio na Szpitalny Oddział Ratunkowy (SOR) lub dzwonić pod numer 112.
                  </p>
                </div>
                {isLargeText && (
                  <Volume2 size={45} color="#DC2626" style={{cursor: 'pointer'}} onClick={() => speak("Ważna Informacja. W przypadku nagłego pogorszenia stanu zdrowia poza godzinami przyjęć placówki, należy zgłosić się bezpośrednio na Szpitalny Oddział Ratunkowy lub dzwonić pod numer 1 1 2.")} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* SEKCJA 3: LECZENIE */}
        {activeTab === 'wizyty' && (
          <div style={infoSectionStyle}>
            <h3 style={{...mainHeaderStyle, fontSize: isLargeText ? `${22 * fontScale}px` : '22px'}}>
              <CalendarIcon size={isLargeText ? 28 * fontScale : 28} color="#3B82F6" /> LECZENIE
            </h3>
            <div style={containerStyle}>
              <div style={{ backgroundColor: isLargeText ? '#F0F7FF' : 'rgba(255,255,255,0.4)', padding: '25px', borderRadius: '25px', border: isLargeText ? `2px solid ${BORDER_BLUE}` : 'none' }}>
                <span style={{...groupTitleStyle, fontSize: isLargeText ? `${14.9 * fontScale}px` : '14.9px'}}>
                  <Pill size={isLargeText ? 20 * fontScale : 20} color="#10B981" /> Przyjmowane Leki
                </span>
                <div style={dataGridStyle}>
                  {meds.map((m, idx) => (
                    <div key={idx} style={{...dataItemStyle, border: isLargeText ? `1px solid ${BORDER_BLUE}` : 'none', backgroundColor: 'white'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '4px', flex: 1}}>
                          <span style={{...labelStyle, fontSize: isLargeText ? `${12.1 * 1.3}px` : '12.1px'}}>Nazwa Leku</span>
                          <span style={{...valueStyle, fontSize: isLargeText ? `${17.6 * fontScale * 1.2}px` : '17.6px'}}>{m.name}</span>
                          <span style={{...labelStyle, marginTop: '10px', fontSize: isLargeText ? `${12.1 * 1.3}px` : '12.1px'}}>Dawkowanie</span>
                          <span style={{...valueStyle, fontSize: isLargeText ? `${17.6 * fontScale * 1.2}px` : '17.6px'}}>{m.dose}</span>
                          <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', fontWeight: '600' }}>
                            Częstotliwość: {m.timesPerDay || 1}x dziennie w dni: 
                            {m.daysOfWeek 
                              ? Object.keys(m.daysOfWeek).filter(d => m.daysOfWeek[d]).join(', ') 
                              : 'Codziennie'}
                          </div>
                          <span style={{...labelStyle, marginTop: '10px', fontSize: isLargeText ? `${12.1 * 1.3}px` : '12.1px'}}>Przyjmować do</span>
                          <span style={{...valueStyle, fontSize: isLargeText ? `${17.6 * fontScale * 1.2}px` : '17.6px', color:'#10B981'}}>{m.endDate}</span>
                        </div>
                        {isLargeText && (
                          <Volume2 
                            size={40} 
                            color="#10B981" 
                            style={{cursor: 'pointer', marginLeft: '10px'}} 
                            onClick={() => speak(`Lek ${m.name}. Dawkowanie: ${formatMedsForSpeech(m)}.`)} 
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  {meds.length === 0 && <div style={{padding:'20px', color:'#64748b', fontWeight:'800'}}>Brak przypisanych leków.</div>}
                </div>
              </div>

              <div style={{ backgroundColor: isLargeText ? '#F0F7FF' : 'rgba(255,255,255,0.4)', padding: '25px', borderRadius: '25px', border: isLargeText ? `2px solid ${BORDER_BLUE}` : 'none' }}>
                <span style={{...groupTitleStyle, fontSize: isLargeText ? `${14.9 * fontScale}px` : '14.9px'}}>
                  <Clock size={isLargeText ? 20 * fontScale : 20} color="#3B82F6" /> Nadchodzące Wizyty
                </span>
                <div style={dataGridStyle}>
                  {visits.map((v, idx) => (
                    <div key={idx} style={{...dataItemStyle, border: isLargeText ? `1px solid ${BORDER_BLUE}` : 'none', backgroundColor: 'white'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '4px', flex: 1}}>
                          <span style={{...labelStyle, fontSize: isLargeText ? `${12.1 * 1.3}px` : '12.1px'}}>Termin</span>
                          <span style={{...valueStyle, fontSize: isLargeText ? `${17.6 * fontScale * 1.2}px` : '17.6px', color: v.isOperation ? '#DC2626' : '#1E3A8A'}}>{v.date} | {v.time}</span>
                          <span style={{...labelStyle, marginTop: '10px', fontSize: isLargeText ? `${12.1 * 1.3}px` : '12.1px'}}>Cel wizyty / Zabieg</span>
                          <span style={{...valueStyle, fontSize: isLargeText ? `${17.6 * fontScale * 1.2}px` : '17.6px', color: v.isOperation ? '#DC2626' : '#1E3A8A'}}>{v.type} {v.isOperation ? '(Zabieg/Operacja)' : ''}</span>
                          <span style={{...labelStyle, marginTop: '10px', fontSize: isLargeText ? `${12.1 * 1.3}px` : '12.1px'}}>Gdzie</span>
                          <span style={{...valueStyle, fontSize: isLargeText ? `${17.6 * fontScale * 1.2}px` : '17.6px'}}>{v.location}</span>
                        </div>
                        {isLargeText && (
                          <Volume2 
                            size={40} 
                            color="#3B82F6" 
                            style={{cursor: 'pointer', marginLeft: '10px'}} 
                            onClick={() => {
                              const text = v.isOperation 
                                ? `Zabieg: ${v.type} o godzinie ${v.time}. Miejsce: ${v.location}.`
                                : `Wizyta o ${v.time}. Cel: ${v.type}. Miejsce: ${v.location}.`;
                              speak(text);
                            }} 
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  {visits.length === 0 && <div style={{padding:'20px', color:'#64748b', fontWeight:'800'}}>Brak nadchodzących wizyt.</div>}
                </div>
              </div>

              <div style={{ backgroundColor: isLargeText ? '#F0F7FF' : 'rgba(255,255,255,0.4)', padding: '25px', borderRadius: '25px', border: isLargeText ? `2px solid ${BORDER_BLUE}` : 'none' }}>
                <span style={{...groupTitleStyle, fontSize: isLargeText ? `${14.9 * fontScale}px` : '14.9px'}}><CalendarIcon size={20} color="#1E3A8A" /> Kalendarz Opieki</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ ...dataItemStyle, borderLeft: '10px solid #1E3A8A', border: isLargeText ? `3px solid ${BORDER_BLUE}` : 'none', borderLeft: isLargeText ? `12px solid #1E3A8A` : '10px solid #1E3A8A' }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span style={{...labelStyle, fontSize: isLargeText ? `${12.1 * 1.6}px` : '14px'}}>SZCZEGÓŁY DNIA: {selectedDate.toLocaleDateString('pl-PL')}</span>
                      {isLargeText && (
                        <Volume2 
                          size={45} 
                          color="#1E3A8A" 
                          style={{cursor: 'pointer'}} 
                          onClick={() => {
                            let msg = `Plan na ${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}. `;
                            
                            if (selectedDayEvents.dayVisits.length > 0) {
                              msg += "Masz wizyty: ";
                              selectedDayEvents.dayVisits.forEach(v => {
                                msg += `${v.time} - ${v.type}. `;
                              });
                            } else {
                              msg += "Brak zaplanowanych wizyt. ";
                            }

                            if (selectedDayEvents.dayMeds.length > 0) {
                              msg += "Leki do przyjęcia: ";
                              selectedDayEvents.dayMeds.forEach(m => {
                                msg += `${m.name}, przyjmij ${formatMedsForSpeech(m)}. `;
                              });
                            } else {
                              msg += "Brak leków na dziś.";
                            }

                            speak(msg);
                          }} 
                        />
                      )}
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedDayEvents.dayVisits.map((v, i) => (
                        <div key={i} style={{ color: v.isOperation ? '#DC2626' : '#1E3A8A', fontWeight: '800', fontSize: isLargeText ? '20px' : '16px', backgroundColor: v.isOperation ? '#FEE2E2' : '#c3e3ff', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: isLargeText ? '16px' : '12px', height: isLargeText ? '16px' : '12px', borderRadius: '50%', backgroundColor: v.isOperation ? '#DC2626' : '#3B82F6' }}></div>
                          {v.isOperation ? 'ZABIEG' : 'WIZYTA'} ({v.time}): {v.type}
                        </div>
                      ))}
                      {selectedDayEvents.dayMeds.map((m, i) => (
                        <div key={i} style={{ color: '#1E3A8A', fontWeight: '800', fontSize: isLargeText ? '20px' : '16px', backgroundColor: '#b2f8c7', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: isLargeText ? '16px' : '12px', height: isLargeText ? '16px' : '12px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
                          LEK: {m.name} ({m.timesPerDay || 1}x dziennie)
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ backgroundColor: 'white', borderRadius: '30px', padding: '15px 25px', boxShadow: 'none', border: isLargeText ? `3px solid ${BORDER_BLUE}` : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <button onClick={handlePrevMonth} style={{ background: hoveredBtn === 'prev' ? '#DC2626' : DARKER_BLUE, border: isLargeText ? `2px solid ${BORDER_BLUE}` : 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }} onMouseEnter={() => setHoveredBtn('prev')} onMouseLeave={() => setHoveredBtn(null)}>
                        <ChevronLeft size={isLargeText ? 32 : 24} color={hoveredBtn === 'prev' ? 'white' : '#1E3A8A'}/>
                      </button>
                      <h4 style={{ margin: 0, color: '#1E3A8A', fontSize: isLargeText ? '28px' : '22px', fontWeight: '800' }}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h4>
                      <button onClick={handleNextMonth} style={{ background: hoveredBtn === 'next' ? '#DC2626' : DARKER_BLUE, border: isLargeText ? `2px solid ${BORDER_BLUE}` : 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }} onMouseEnter={() => setHoveredBtn('next')} onMouseLeave={() => setHoveredBtn(null)}>
                        <ChevronRight size={32} color={hoveredBtn === 'next' ? 'white' : '#1E3A8A'}/>
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
                      {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(d => <div key={d} style={{ fontWeight: '900', color: '#3B82F6', fontSize: isLargeText ? '18px' : '13px' }}>{d}</div>)}
                      {days.map((day, idx) => {
                        const isSelected = day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth();
                        const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                        const events = day ? getEventsForDay(day, currentDate.getMonth(), currentDate.getFullYear()) : null;
                        return (
                          <div key={idx} onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                            onMouseEnter={() => day && setHoveredDay(idx)} onMouseLeave={() => setHoveredDay(null)}
                            style={{ 
                              padding: '8px 0', borderRadius: '15px', cursor: day ? 'pointer' : 'default', minHeight: isLargeText ? '70px' : '52px', position: 'relative',
                              backgroundColor: hoveredDay === idx ? '#DC2626' : (isSelected ? '#1E3A8A' : (isToday ? '#FEF9C3' : (day ? '#F1F5F9' : 'transparent'))),
                              color: hoveredDay === idx || isSelected ? 'white' : '#1E3A8A', fontWeight: '800', fontSize: isLargeText ? '22px' : '17px',
                              border: isToday && !isSelected && hoveredDay !== idx ? '2px solid #FACC15' : (isLargeText && day ? `1px solid ${BORDER_BLUE}` : 'none'),
                              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                            }}>
                            {day}
                            <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', width: '100%', flexWrap: 'wrap', padding: '0 4px', marginTop: '4px' }}>
                              {events?.dayVisits.map((v, i) => <div key={i} style={{ width: isLargeText ? '12px' : '10px', height: isLargeText ? '12px' : '10px', borderRadius: '50%', backgroundColor: v.isOperation ? '#DC2626' : '#3B82F6', border: isLargeText ? '1px solid white' : 'none' }} />)}
                              {events?.dayMeds.map((_, i) => <div key={i} style={{ width: isLargeText ? '12px' : '10px', height: isLargeText ? '12px' : '10px', borderRadius: '50%', backgroundColor: '#10B981', border: isLargeText ? '1px solid white' : 'none' }} />)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* MOJE E-RECEPTY */}
              <div style={{ backgroundColor: isLargeText ? '#F0F7FF' : 'rgba(255,255,255,0.4)', padding: '25px', borderRadius: '25px', border: isLargeText ? `2px solid ${BORDER_BLUE}` : 'none', marginTop: '20px' }}>
                <span style={{...groupTitleStyle, fontSize: isLargeText ? `${14.9 * fontScale}px` : '14.9px', justifyContent: 'space-between'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <ClipboardList size={isLargeText ? 20 * fontScale : 20} color="#3B82F6" /> Moje E-Recepty
                  </div>
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginTop: '15px' }}>
                  {myPrescriptions.map((r, i) => (
                    <div key={i} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '25px', border: `2px solid ${BORDER_BLUE}`, display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '10px', height: '100%', backgroundColor: '#3B82F6' }}></div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={labelStyle}>Kod dostępu</span>
                          <div style={{ fontSize: '40px', fontWeight: '900', color: '#1E3A8A', letterSpacing: '5px' }}>{r.code}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <span style={labelStyle}>Ważna do</span>
                            <div style={{ ...valueStyle, color: '#DC2626' }}>{r.expiryDate}</div>
                          </div>
                          {isLargeText && (
                            <Volume2 
                              size={40} 
                              color="#3B82F6" 
                              style={{cursor: 'pointer'}} 
                              onClick={() => speak(`E-recepta na leki: ${r.medications}. Kod dostępu do apteki to: ${r.code.split('').join(' ')}. Recepta ważna do ${r.expiryDate}.`)} 
                            />
                          )}
                        </div>
                      </div>

                      <div style={{ padding: '15px', backgroundColor: '#F8FAFC', borderRadius: '15px', border: '1px dashed #B9D7F2' }}>
                        <span style={labelStyle}>Przepisane leki:</span>
                        <div style={{ ...valueStyle, fontSize: '16px', marginTop: '5px', whiteSpace: 'pre-wrap' }}>{r.medications}</div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
                        <span>WYSTAWIŁ: {r.doctorName}</span>
                        <span>DATA: {r.issueDate}</span>
                      </div>
                      
                      <div style={{ marginTop: '10px', height: '40px', background: 'repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 4px)' }}></div>
                    </div>
                  ))}
                  {myPrescriptions.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: '800'}}>Nie masz jeszcze żadnych wystawionych e-recept.</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEKCJA 4: SOS */}
        {activeTab === 'sos' && (
          <div style={infoSectionStyle}>
            <h3 style={{ ...mainHeaderStyle, color: '#DC2626', borderLeft: '6px solid #DC2626', fontSize: isLargeText ? `${22 * 1.15}px` : '22px' }}>
              <Ambulance size={isLargeText ? 32 * 1.3 : 28} /> PIERWSZA POMOC I SOS
            </h3>
            <div style={{ ...containerStyle, border: isLargeText ? '3px solid #DC2626' : '2px solid #FCA5A5', backgroundColor: isLargeText ? '#FFF5F5' : '#FFF1F2' }}>
              <div style={dataGridStyle}>
                {['112', '999', '998', '997'].map((num) => (
                   <div key={num} style={{ ...dataItemStyle, border: isLargeText ? '4px solid #DC2626' : '3px solid #DC2626', backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative' }}>
                    <span style={{ ...labelStyle, color: '#DC2626', marginBottom: '5px', fontSize: isLargeText ? '16px' : '12.1px' }}>NUMER ALARMOWY</span>
                    <span style={{ ...valueStyle, fontSize: isLargeText ? '64px' : '48px', color: '#DC2626', lineHeight: 1 }}>{num}</span>
                    {isLargeText && (
                      <Volume2 
                        size={32} 
                        color="#DC2626" 
                        style={{ cursor: 'pointer', position: 'absolute', top: '10px', right: '10px' }} 
                        onClick={() => speak(`Numer alarmowy. ${num.split('').join(' ')}.`)} 
                      />
                    )}
                   </div>
                ))}
              </div>
              <div style={dataGridStyle}>
                <div style={{ ...dataItemStyle, padding: '25px', border: isLargeText ? '2px solid #DC2626' : 'none', position: 'relative' }}>
                  <span style={{...groupTitleStyle, color: '#DC2626', borderBottom: isLargeText ? '3px solid #DC2626' : '2px solid #FCA5A5', fontSize: isLargeText ? '20px' : '14.9px', justifyContent: 'space-between'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><Activity size={isLargeText ? 26 : 20}/> Resuscytacja (RKO)</div>
                    {isLargeText && (
                      <Volume2 
                        size={32} 
                        color="#DC2626" 
                        style={{cursor: 'pointer'}} 
                        onClick={() => speak("Resuscytacja. Gdy pacjent nie oddycha: Zadzwoń pod numer 1 1 2. Wykonaj 30 uciśnięć klatki piersiowej, a następnie 2 oddechy ratownicze. Kontynuuj do przyjazdu ratowników.")} 
                      />
                    )}
                  </span>
                  <div style={{ color: isLargeText ? '#0F172A' : '#1E3A8A', fontSize: isLargeText ? '20px' : '16px', lineHeight: '1.6', fontWeight: '800' }}>
                    <p style={{ margin: '0 0 10px 0' }}>Gdy pacjent nie oddycha:</p>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      <li>Zadzwoń pod numer <strong>112</strong></li>
                      <li>Wykonaj <strong>30 uciśnięć</strong> klatki piersiowej</li>
                      <li>Wykonaj <strong>2 oddechy</strong> ratownicze</li>
                      <li>Kontynuuj do przyjazdu ratowników</li>
                    </ul>
                  </div>
                </div>
                <div style={{ ...dataItemStyle, padding: '25px', border: isLargeText ? '2px solid #DC2626' : 'none', position: 'relative' }}>
                  <span style={{...groupTitleStyle, color: '#DC2626', borderBottom: isLargeText ? '3px solid #DC2626' : '2px solid #FCA5A5', fontSize: isLargeText ? '20px' : '14.9px', justifyContent: 'space-between'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><Info size={isLargeText ? 26 : 20}/> Pozycja Boczna</div>
                    {isLargeText && (
                      <Volume2 
                        size={32} 
                        color="#DC2626" 
                        style={{cursor: 'pointer'}} 
                        onClick={() => speak("Pozycja Boczna Bezpieczna. Dla nieprzytomnych z zachowanym oddechem: Rękę bliższą ułóż pod kątem prostym. Drugą rękę połóż pod policzek. Zegnij dalszą nogę i obróć na bok. Na koniec odchyl głowę do tyłu, aby udrożnić drogi oddechowe.")} 
                      />
                    )}
                  </span>
                  <div style={{ color: isLargeText ? '#0F172A' : '#1E3A8A', fontSize: isLargeText ? '20px' : '16px', lineHeight: '1.6', fontWeight: '800' }}>
                    <p style={{ margin: '0 0 10px 0' }}>Dla nieprzytomnych z oddechem:</p>
                    <ol style={{ margin: 0, paddingLeft: '20px' }}>
                      <li>Rękę bliższą ułóż pod kątem prostym</li>
                      <li>Drugą rękę połóż pod policzek</li>
                      <li>Zegnij dalszą nogę i obróć na bok</li>
                      <li>Odchyl głowę do tyłu (udrożnienie)</li>
                    </ol>
                  </div>
                </div>
                <div style={{ ...dataItemStyle, gridColumn: 'span 2', padding: '25px', border: isLargeText ? `2px solid #DC2626` : 'none', position: 'relative' }}>
                  <span style={{...groupTitleStyle, color: '#DC2626', borderBottom: isLargeText ? '3px solid #DC2626' : '2px solid #FCA5A5', fontSize: isLargeText ? '20px' : '14.9px', justifyContent: 'space-between'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><ListChecks size={isLargeText ? 26 : 20}/> Dokumenty dla Ratowników</div>
                    {isLargeText && (
                      <Volume2 
                        size={32} 
                        color="#DC2626" 
                        style={{cursor: 'pointer'}} 
                        onClick={() => speak("Dokumenty dla ratowników. Przygotuj dowód osobisty, kartę z numerem pesel, ostatnie wypisy ze szpitala oraz kartę grupy krwi. Ważna jest też lista leków.")} 
                      />
                    )}
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', color: isLargeText ? '#0F172A' : '#1E3A8A', fontSize: isLargeText ? '20px' : '16px', fontWeight: '800' }}>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      <li>Dowód osobisty / Paszport</li>
                      <li>Karta z numerem PESEL</li>
                      <li>Ostatnie wypisy ze szpitala</li>
                    </ul>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      <li>Lista leków z zakładki "Wizyty i Leki"</li>
                      <li>Karta grupy krwi</li>
                      <li>Informacje o alergiach</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;