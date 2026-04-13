import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar as CalendarIcon, 
  LogOut, 
  Search, 
  Clock, 
  ClipboardList, 
  Activity,
  Volume2,
  Bell, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MapPin, 
  Send,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  FileText,
  History,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Pill,
  Stethoscope,
  ZoomIn,
  ZoomOut
} from 'lucide-react';


const getLocalDateString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const calculateAge = (birthDateString) => {
  if (!birthDateString || !birthDateString.includes('.')) return "";
  const parts = birthDateString.split('.');
  if (parts.length !== 3) return "";
  
  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year || year < 1900 || year > new Date().getFullYear()) return "";
  
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : "";
};

const DoctorDashboard = ({ user, onLogout, isLargeText, setIsLargeText }) => {
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
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
  }, []);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('pacjenci'); 
  const [hoveredDay, setHoveredDay] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPatients, setExpandedPatients] = useState([]);

  const [prescriptionSearch, setPrescriptionSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptionMeds, setPrescriptionMeds] = useState('');
  const [sentStatus, setSentStatus] = useState(false);


  const [selectedDayPlan, setSelectedDayPlan] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);

  const scale = isLargeText ? 1.1 : 1;
  const fontScale = isLargeText ? 1.3 : 1;
  const pScale = isLargeText ? 1.8 : 1; 
  const gScale = isLargeText ? 1.7 : 1; 
  const cScale = isLargeText ? 1.25 : 1; 
  const rScale = isLargeText ? 1.6 : 1; 

  const MARGIN = '46px'; 
  const CONTAINER_PADDING = '23px 34.5px'; 
  const SECTION_GAP = '23px'; 
  const ITEM_PADDING = '11.5px 17.25px'; 
  const DARKER_BLUE = '#EBF5FF';
  const BORDER_BLUE = '#B9D7F2';
  const FONT_FAMILY = "'Montserrat', sans-serif";

  const MALE_COLOR = '#0284C7'; 
  const FEMALE_COLOR = '#EC4899';

  const monthNames = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
  
  const [patients, setPatients] = useState([]);
  const [editingPesel, setEditingPesel] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchPatients = () => {
    fetch(`${API_URL}/api/patients`)
      .then(res => res.json())
      .then(data => setPatients(data))
      .catch(err => console.error("Błąd pobierania danych z MongoDB:", err));
  };

  const fetchAllSchedules = () => {
    fetch(`${API_URL}/api/daily-schedule/${user.pesel}`)
      .then(res => res.json())
      .then(data => setAllSchedules(data))
      .catch(err => console.error("Błąd wszystkich grafików:", err));
  };

  
  const fetchPlanForDate = async (date) => {
    const dateStr = getLocalDateString(date); 
    try {
      const res = await fetch(`${API_URL}/api/daily-schedule/${user.pesel}/${dateStr}`);
      const data = await res.json();
      setSelectedDayPlan(data.plan || []);
    } catch (e) { 
      console.error("Błąd pobierania planu:", e);
      setSelectedDayPlan([]); 
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchAllSchedules();
    fetchPlanForDate(new Date());
  }, []);

  const handleEditClick = (patient) => {
    setEditingPesel(patient.pesel);
    setEditForm({
      ...patient,
      medications: Array.isArray(patient.medications) ? patient.medications : [],
      visits: Array.isArray(patient.visits) ? patient.visits : []
    });
  };

  const handleSaveEdit = async () => {
    const dataToSend = {
      ...editForm,
      medications: Array.isArray(editForm.medications) ? editForm.medications : [],
      visits: Array.isArray(editForm.visits) ? editForm.visits : []
    };

    try {
      const response = await fetch(`${API_URL}/api/patients/${editingPesel}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        setEditingPesel(null);
        fetchPatients();
        alert("Dane pacjenta, leki i wizyty zostały zaktualizowane!");
      } else {
        alert("Błąd serwera podczas zapisywania.");
      }
    } catch (error) {
      console.error("Błąd komunikacji z serwerem:", error);
      alert("Brak połączenia z serwerem.");
    }
  };

  const handleAddMed = () => {
    const currentMeds = Array.isArray(editForm.medications) ? editForm.medications : [];
    setEditForm({ 
      ...editForm, 
      medications: [
        ...currentMeds, 
        { name: '', dose: '', endDate: '', timesPerDay: 1, daysOfWeek: { Pn: true, Wt: true, Śr: true, Cz: true, Pt: true, So: true, Nd: true } }
      ] 
    });
  };

  const handleRemoveMed = (index) => {
    const newMeds = editForm.medications.filter((_, i) => i !== index);
    setEditForm({ ...editForm, medications: newMeds });
  };

  const handleMedChange = (index, field, value) => {
    const newMeds = [...editForm.medications];
    const updatedMed = { ...newMeds[index] }; 
    if (field === 'timesPerDay') {
      updatedMed[field] = parseInt(value, 10) || 1;
    } else {
      updatedMed[field] = value;
    }
    newMeds[index] = updatedMed;
    setEditForm({ ...editForm, medications: newMeds });
  };

  const toggleDay = (medIndex, dayLabel) => {
    const newMeds = [...editForm.medications];
    const medToUpdate = { ...newMeds[medIndex] };
    if (!medToUpdate.daysOfWeek) {
      medToUpdate.daysOfWeek = { Pn: true, Wt: true, Śr: true, Cz: true, Pt: true, So: true, Nd: true };
    }
    medToUpdate.daysOfWeek = {
      ...medToUpdate.daysOfWeek,
      [dayLabel]: !medToUpdate.daysOfWeek[dayLabel]
    };
    newMeds[medIndex] = medToUpdate;
    setEditForm({ ...editForm, medications: newMeds });
  };

  const handleAddVisit = () => {
    const currentVisits = Array.isArray(editForm.visits) ? editForm.visits : [];
    setEditForm({ 
      ...editForm, 
      visits: [
        ...currentVisits, 
        { date: '', time: '', type: '', location: '', isOperation: false }
      ] 
    });
  };

  const handleRemoveVisit = (index) => {
    const newVisits = editForm.visits.filter((_, i) => i !== index);
    setEditForm({ ...editForm, visits: newVisits });
  };

  const handleVisitChange = (index, field, value) => {
    const newVisits = [...editForm.visits];
    newVisits[index] = { ...newVisits[index], [field]: value };
    setEditForm({ ...editForm, visits: newVisits });
  };

  const getGeneralPlanForDay = (dayValue) => {
    return selectedDayPlan;
  };

  const getPatientsForDate = (date) => {
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const dateStr = `${d}.${m}.${date.getFullYear()}`;

    let allVisits = [];
    patients.forEach(p => {
      if (p.visits && Array.isArray(p.visits)) {
        p.visits.forEach(v => {
          if (v.date === dateStr) {
            allVisits.push({
              time: v.time,
              patient: p.name,
              type: v.type,
              room: v.location,
              isOperation: v.isOperation
            });
          }
        });
      }
    });
    return allVisits.sort((a, b) => a.time.localeCompare(b.time));
  };

  // ZMIANA: Miejsce pracy pobierane dynamicznie
  const getDutyInfo = (date) => {
    if (selectedDayPlan && selectedDayPlan.length > 0) {
      const locations = [...new Set(selectedDayPlan.map(item => item.room))].join(", ");
      return { 
        text: locations || "Brak określonej sali", 
        icon: <MapPin size={18}/> 
      };
    }
    return { 
      text: "Brak zaplanowanych zajęć / Dyżur pod telefonem", 
      icon: <Phone size={18}/> 
    };
  };

  const handleLogoutAction = () => {
    window.speechSynthesis.cancel();
    onLogout();
  };

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const days = [];
  const startDay = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const offset = startDay === 0 ? 6 : startDay - 1;
  for (let i = 0; i < offset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth(currentDate.getFullYear(), currentDate.getMonth()); i++) days.push(i);

  const todayObj = new Date();

  const labelStyle = { color: '#64748b', fontSize: '12.1px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: FONT_FAMILY };
  const valueStyle = { color: '#1E3A8A', fontSize: '17.6px', fontWeight: '800', wordBreak: 'break-word', fontFamily: FONT_FAMILY };
  const mainHeaderStyle = { color: '#1E3A8A', fontSize: '22px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '6px solid #3B82F6', paddingLeft: '15px', fontFamily: FONT_FAMILY };
  const infoSectionStyle = { paddingLeft: MARGIN, paddingRight: MARGIN, paddingBottom: SECTION_GAP, display: 'flex', flexDirection: 'column', gap: '15px', fontFamily: FONT_FAMILY };
  const containerStyle = { backgroundColor: DARKER_BLUE, padding: CONTAINER_PADDING, borderRadius: '35px', border: `1px solid ${BORDER_BLUE}`, display: 'flex', flexDirection: 'column', gap: SECTION_GAP, boxShadow: 'none' };
  const dataItemStyle = { display: 'flex', flexDirection: 'column', gap: '4px', padding: ITEM_PADDING, backgroundColor: 'white', borderRadius: '18px', boxShadow: 'none', fontFamily: FONT_FAMILY };

  const grafikLabelStyle = { ...labelStyle, fontSize: `${12.1 * gScale}px` };

  const editInputStyle = {
    width: '100%', padding: '6px 12px', borderRadius: '8px', border: `2px solid ${BORDER_BLUE}`, outline: 'none',
    fontSize: isLargeText ? `${16 * pScale}px` : '16px', fontFamily: FONT_FAMILY, fontWeight: '800', color: '#1E3A8A', boxSizing: 'border-box', marginTop: '4px'
  };

  // Dodany styl inputa dla e-recepty ze skalowaniem
  const prescriptionInputStyle = {
    ...editInputStyle,
    fontSize: isLargeText ? `${16 * rScale}px` : '16px'
  };

  const dayTileStyle = (isSelected) => ({
    width: isLargeText ? '45px' : '35px',
    height: isLargeText ? '45px' : '35px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '900',
    fontSize: isLargeText ? '18px' : '14px',
    transition: 'all 0.2s ease',
    backgroundColor: isSelected ? '#1E3A8A' : '#F1F5F9',
    color: isSelected ? 'white' : '#64748b',
    border: `2px solid ${isSelected ? '#1E3A8A' : BORDER_BLUE}`
  });

  const navButtonStyle = (id) => ({
    width: 'auto', 
    height: '60px',
    padding: isLargeText ? `0 ${16 * scale}px` : '0 22px', 
    borderRadius: '16px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease',
    backgroundColor: activeTab === id ? '#1E3A8A' : '#FFFFFF',
    color: activeTab === id ? 'white' : '#1E3A8A',
    border: `1px solid ${BORDER_BLUE}`, 
    textTransform: 'uppercase', 
    fontSize: `${14 * fontScale}px`, 
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    fontFamily: FONT_FAMILY
  });

  // PUNKT 3: Filtrowanie pacjentów (Lekarz widzi tylko swoich)
  const filteredPatientsSearch = patients.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.pesel?.includes(searchQuery);
    const isMyPatient = p.assignedDoctor === user.name; 
    return matchesSearch && isMyPatient;
  });

  const prescriptionResults = patients.filter(p => 
    p.name?.toLowerCase().includes(prescriptionSearch.toLowerCase()) && prescriptionSearch.length > 0
  );

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0, display: 'flex', flexDirection: 'column', backgroundColor: '#F1F5F9', overflowX: 'hidden', overflowY: 'auto', scrollbarGutter: 'stable', fontFamily: FONT_FAMILY }}>
      
      {/* HEADER - PUNKT 6: Ikona Stethoscope */}
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
            <button onClick={() => setActiveTab('pacjenci')} style={navButtonStyle('pacjenci')}><Users size={isLargeText ? 28 : 20}/> Moi Pacjenci</button>
            <button onClick={() => setActiveTab('grafik')} style={navButtonStyle('grafik')}><CalendarIcon size={isLargeText ? 28 : 20}/> Grafik i Wizyty</button>
            <button onClick={() => setActiveTab('recepty')} style={navButtonStyle('recepty')}><ClipboardList size={isLargeText ? 28 : 20}/> E-Recepta</button>
          </div>
          <div style={{ color: '#1E3A8A', fontSize: '15px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.8px', lineHeight: 1 }}>
             <Stethoscope size={22} color="#3B82F6" /> ZALOGOWANY LEKARZ: <span style={{ color: '#3B82F6' }}>{user?.name}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px', height: '60px' }}>
          <button onClick={() => setIsLargeText(!isLargeText)} style={{ height: '60px', padding: isLargeText ? '0 15px' : '0 18px', borderRadius: '15px', backgroundColor: isLargeText ? '#3B82F6' : '#1E3A8A', color: 'white', fontSize: `${20 * fontScale}px`, fontWeight: '900', cursor: 'pointer', border: `1px solid ${BORDER_BLUE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse-yellow-glow 2s infinite', fontFamily: FONT_FAMILY }}> {isLargeText ? <ZoomOut size={30} /> : <ZoomIn size={30} />} </button>
          <button onClick={handleLogoutAction} style={{ ...navButtonStyle('logout'), backgroundColor: '#1E3A8A', color: 'white' }}> WYLOGUJ <LogOut size={isLargeText ? 28 : 20} /> </button>
        </div>
      </div>

      <div style={{ flex: 1, paddingTop: '20px', paddingBottom: '40px' }}>
        
        {/* SEKCJA 1: MOI PACJENCI */}
        {activeTab === 'pacjenci' && (
          <div style={infoSectionStyle}>
            <h3 style={mainHeaderStyle}><Users size={28} color="#3B82F6" /> LISTA PACJENTÓW</h3>
            <div style={containerStyle}>
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', borderRadius: '20px', padding: '15px 25px', border: `2px solid ${BORDER_BLUE}` }}>
                <Search size={isLargeText ? 32 : 24} color="#64748b" style={{ marginRight: '15px' }} />
                <input type="text" placeholder="Wyszukaj pacjenta..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', fontSize: isLargeText ? `${18 * pScale}px` : '18px', fontFamily: FONT_FAMILY, fontWeight: '900', color: '#334155', backgroundColor: 'transparent' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {filteredPatientsSearch.map((p, i) => {
                  const isExpanded = expandedPatients.includes(p.pesel);
                  const isEditing = editingPesel === p.pesel;

                  return (
                    <div key={i} style={{ 
                      backgroundColor: 'white', 
                      borderRadius: '25px', 
                      padding: '25px', 
                      borderTop: `1px solid ${BORDER_BLUE}`,
                      borderRight: `1px solid ${BORDER_BLUE}`,
                      borderBottom: `1px solid ${BORDER_BLUE}`,
                      borderLeft: `15px solid ${p.gender === 'Kobieta' ? FEMALE_COLOR : MALE_COLOR}`, 
                      transition: 'all 0.3s ease' 
                    }}>
                      <div 
                        onClick={() => !isEditing && setExpandedPatients(prev => prev.includes(p.pesel) ? prev.filter(id => id !== p.pesel) : [...prev, p.pesel])} 
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: isEditing ? 'default' : 'pointer' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <User size={isLargeText ? 40 * pScale : 40} color={p.gender === 'Kobieta' ? FEMALE_COLOR : MALE_COLOR} />
                          <div>
                            {isEditing ? (
                                <input 
                                    value={editForm.name || ''} 
                                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                                    placeholder="Imię i Nazwisko"
                                    style={{...editInputStyle, fontSize: isLargeText ? '30px' : '26px', width: 'auto'}}
                                />
                            ) : (
                                <span style={{ fontSize: isLargeText ? `${26 * pScale}px` : '26px', fontWeight: '900', color: '#1E3A8A' }}>{p.name}</span>
                            )}
                            <div style={{ ...labelStyle, fontSize: isLargeText ? `${18 * pScale}px` : '18px', color: '#3B82F6', fontWeight: '800' }}>
                                PESEL: {isEditing ? (
                                    <input 
                                        value={editForm.pesel || ''} 
                                        onChange={e => setEditForm({...editForm, pesel: e.target.value})}
                                        style={{...editInputStyle, fontSize: '16px', display: 'inline', width: '200px', marginLeft: '10px'}}
                                    />
                                ) : p.pesel}
                            </div>
                          </div>
                        </div>
                        {!isEditing && (isExpanded ? <ChevronUp size={isLargeText ? 28 * pScale : 28} color="#1E3A8A" /> : <ChevronDown size={isLargeText ? 28 * pScale : 28} color="#1E3A8A" />)}
                      </div>

                      {isExpanded && (
                        <div style={{ marginTop: '25px', paddingTop: '25px', borderTop: `1px solid ${BORDER_BLUE}` }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                            <div>
                               <span style={{...labelStyle, fontSize: isLargeText ? `${12.1 * pScale}px` : '12.1px'}}>Data Urodzenia</span>
                               {isEditing ? (
                                 <input 
                                   value={editForm.birth || ''} 
                                   onChange={e => {
                                     const newBirth = e.target.value;
                                     const newAge = calculateAge(newBirth);
                                     setEditForm({
                                       ...editForm, 
                                       birth: newBirth, 
                                       age: newAge !== "" ? newAge : editForm.age 
                                     });
                                   }} 
                                   placeholder="DD.MM.YYYY"
                                   style={editInputStyle}
                                 />
                               ) : (
                                 <div style={{...valueStyle, fontSize: isLargeText ? `${17.6 * pScale}px` : '17.6px'}}>{p.birth}</div>
                               )}
                            </div>
                            <div>
                               <span style={{...labelStyle, fontSize: isLargeText ? `${12.1 * pScale}px` : '12.1px'}}>Wiek</span>
                               {isEditing ? (
                                 <input 
                                   value={editForm.age || ''} 
                                   readOnly 
                                   style={{...editInputStyle, backgroundColor: '#F1F5F9', cursor: 'not-allowed'}}
                                 />
                               ) : (
                                 <div style={{...valueStyle, fontSize: isLargeText ? `${17.6 * pScale}px` : '17.6px'}}>{p.age} lat</div>
                               )}
                            </div>
                            <div>
                               <span style={{...labelStyle, fontSize: isLargeText ? `${12.1 * pScale}px` : '12.1px'}}>Grupa Krwi</span>
                               {isEditing ? (
                                 <input value={editForm.blood || ''} onChange={e => setEditForm({...editForm, blood: e.target.value})} style={editInputStyle}/>
                               ) : (
                                 <div style={{...valueStyle, fontSize: isLargeText ? `${17.6 * pScale}px` : '17.6px', color: '#DC2626'}}>{p.blood}</div>
                               )}
                            </div>
                            <div>
                               <span style={{...labelStyle, fontSize: isLargeText ? `${12.1 * pScale}px` : '12.1px'}}>Waga / Wzrost</span>
                               {isEditing ? (
                                 <div style={{display: 'flex', gap: '5px'}}>
                                     <input placeholder="Waga" value={editForm.weight || ''} onChange={e => setEditForm({...editForm, weight: e.target.value})} style={editInputStyle}/>
                                     <input placeholder="Wzrost" value={editForm.height || ''} onChange={e => setEditForm({...editForm, height: e.target.value})} style={editInputStyle}/>
                                 </div>
                               ) : (
                                 <div style={{...valueStyle, fontSize: isLargeText ? `${17.6 * pScale}px` : '17.6px'}}>{p.weight} / {p.height}</div>
                               )}
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '25px', padding: '15px', backgroundColor: '#F8FAFC', borderRadius: '15px' }}>
                             <div>
                                <span style={{...labelStyle, fontSize: isLargeText ? `${12.1 * pScale}px` : '12.1px'}}>Adres zamieszkania</span>
                                {isEditing ? (
                                    <input value={editForm.address || ''} onChange={e => setEditForm({...editForm, address: e.target.value})} style={editInputStyle}/>
                                ) : (
                                    <div style={{...valueStyle, fontSize: isLargeText ? `${15 * pScale}px` : '16px'}}>{p.address}</div>
                                )}
                             </div>
                             <div>
                                <span style={{...labelStyle, fontSize: isLargeText ? `${12.1 * pScale}px` : '12.1px'}}>Telefon</span>
                                {isEditing ? (
                                    <input value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})} style={editInputStyle}/>
                                ) : (
                                    <div style={{...valueStyle, fontSize: isLargeText ? `${15 * pScale}px` : '16px'}}>{p.phone}</div>
                                )}
                             </div>
                             <div>
                                <span style={{...labelStyle, fontSize: isLargeText ? `${12.1 * pScale}px` : '12.1px'}}>E-mail</span>
                                {isEditing ? (
                                    <input value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} style={editInputStyle}/>
                                ) : (
                                    <div style={{...valueStyle, fontSize: isLargeText ? `${15 * pScale}px` : '16px'}}>{p.email}</div>
                                )}
                             </div>
                          </div>

                          <div style={{ marginTop: '20px', padding: '25px', backgroundColor: '#F0FDF4', borderRadius: '20px', border: '1px solid #BBF7D0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <span style={{...labelStyle, color: '#166534', fontSize: isLargeText ? `${14 * pScale}px` : '14px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <Pill size={20} /> PRZYJMOWANE LEKI I HARMONOGRAM
                                </span>
                                {isEditing && (
                                    <button 
                                        onClick={handleAddMed}
                                        style={{ backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                    >
                                        <Plus size={18} /> DODAJ LEK
                                    </button>
                                )}
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {(isEditing ? editForm.medications : p.medications)?.length > 0 ? (
                                    (isEditing ? editForm.medications : p.medications).map((med, idx) => (
                                        <div key={idx} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #DCFCE7', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            {isEditing ? (
                                                <>
                                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <span style={labelStyle}>Nazwa Leku</span>
                                                            <input value={med.name} onChange={e => handleMedChange(idx, 'name', e.target.value)} placeholder="Nazwa leku" style={editInputStyle} />
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <span style={labelStyle}>Dawka (np. 500mg)</span>
                                                            <input value={med.dose} onChange={e => handleMedChange(idx, 'dose', e.target.value)} placeholder="Dawka" style={editInputStyle} />
                                                        </div>
                                                        <div style={{ width: '120px' }}>
                                                            <span style={labelStyle}>Razy Dziennie</span>
                                                            <input type="number" min="1" value={med.timesPerDay || 1} onChange={e => handleMedChange(idx, 'timesPerDay', e.target.value)} style={editInputStyle} />
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <span style={labelStyle}>Przyjmować Do (Data)</span>
                                                            <input value={med.endDate} onChange={e => handleMedChange(idx, 'endDate', e.target.value)} placeholder="DD.MM.YYYY lub Bezterminowo" style={editInputStyle} />
                                                        </div>
                                                        <button onClick={() => handleRemoveMed(idx)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '8px' }}><Trash2 size={24}/></button>
                                                    </div>
                                                    <div>
                                                        <span style={{ ...labelStyle, display: 'block', marginBottom: '8px' }}>Dni Przyjmowania</span>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(dayLabel => {
                                                                const isSelected = med.daysOfWeek ? med.daysOfWeek[dayLabel] === true : true;
                                                                return (
                                                                    <div 
                                                                        key={dayLabel}
                                                                        style={dayTileStyle(isSelected)}
                                                                        onClick={() => toggleDay(idx, dayLabel)}
                                                                    >
                                                                        {dayLabel}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ ...valueStyle, color: '#166534' }}>{med.name} — {med.dose}</div>
                                                        <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', fontWeight: '600' }}>
                                                            Częstotliwość: {med.timesPerDay || 1}x dziennie w dni: {med.daysOfWeek ? Object.keys(med.daysOfWeek).filter(d => med.daysOfWeek[d]).join(', ') : 'Codziennie'}
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <span style={labelStyle}>Termin Końcowy</span>
                                                        <div style={{ ...valueStyle, color: '#EF4444' }}>{med.endDate}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#64748B', fontStyle: 'italic', padding: '10px' }}>Brak zapisanych leków.</div>
                                )}
                            </div>
                          </div>

                          <div style={{ marginTop: '20px', padding: '25px', backgroundColor: '#EFF6FF', borderRadius: '20px', border: '1px solid #BFDBFE' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <span style={{...labelStyle, color: '#1E3A8A', fontSize: isLargeText ? `${14 * pScale}px` : '14px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <CalendarIcon size={20} /> ZAPLANOWANE WIZYTY I ZABIEGI
                                </span>
                                {isEditing && (
                                    <button 
                                        onClick={handleAddVisit}
                                        style={{ backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                    >
                                        <Plus size={18} /> DODAJ WIZYTĘ
                                    </button>
                                )}
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {(isEditing ? editForm.visits : p.visits)?.length > 0 ? (
                                    (isEditing ? editForm.visits : p.visits).map((visit, idx) => (
                                        <div key={idx} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', border: `1px solid ${visit.isOperation ? '#FCA5A5' : '#BFDBFE'}`, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            {isEditing ? (
                                                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                                    <div style={{ flex: 1, minWidth: '120px' }}>
                                                        <span style={labelStyle}>Data (DD.MM.YYYY)</span>
                                                        <input value={visit.date} onChange={e => handleVisitChange(idx, 'date', e.target.value)} placeholder="DD.MM.YYYY" style={editInputStyle} />
                                                    </div>
                                                    <div style={{ width: '100px' }}>
                                                        <span style={labelStyle}>Godzina</span>
                                                        <input value={visit.time} onChange={e => handleVisitChange(idx, 'time', e.target.value)} placeholder="HH:MM" style={editInputStyle} />
                                                    </div>
                                                    <div style={{ flex: 2, minWidth: '200px' }}>
                                                        <span style={labelStyle}>Cel wizyty / Zabieg</span>
                                                        <input value={visit.type} onChange={e => handleVisitChange(idx, 'type', e.target.value)} placeholder="np. Zdjęcie szwów" style={editInputStyle} />
                                                    </div>
                                                    <div style={{ flex: 2, minWidth: '200px' }}>
                                                        <span style={labelStyle}>Lokalizacja</span>
                                                        <input value={visit.location} onChange={e => handleVisitChange(idx, 'location', e.target.value)} placeholder="np. Gabinet 11" style={editInputStyle} />
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px' }}>
                                                        <input type="checkbox" checked={visit.isOperation} onChange={e => handleVisitChange(idx, 'isOperation', e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                                                        <span style={{...labelStyle, color: '#DC2626'}}>Zabieg/Operacja</span>
                                                    </div>
                                                    <button onClick={() => handleRemoveVisit(idx)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '8px' }}><Trash2 size={24}/></button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ ...valueStyle, color: visit.isOperation ? '#DC2626' : '#1E3A8A' }}>{visit.date} {visit.time} — {visit.type}</div>
                                                        <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', fontWeight: '600' }}>
                                                            Miejsce: {visit.location} {visit.isOperation && <span style={{ color: '#DC2626', marginLeft: '10px' }}>(Zabieg/Operacja)</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#64748B', fontStyle: 'italic', padding: '10px' }}>Brak zaplanowanych wizyt.</div>
                                )}
                            </div>
                          </div>
                          
                          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#F1F5F9', borderRadius: '15px' }}>
                            <span style={{...labelStyle, fontSize: isLargeText ? `${12.1 * pScale}px` : '12.1px'}}>Alergie i Uwagi</span>
                            {isEditing ? <textarea value={editForm.allergies || ''} onChange={e => setEditForm({...editForm, allergies: e.target.value})} style={{...editInputStyle, minHeight: '60px'}}/> : <div style={{...valueStyle, fontSize: isLargeText ? `${17.6 * pScale}px` : '17.6px', color: p.allergies === 'Brak stwierdzonych' ? '#1E3A8A' : '#DC2626'}}>{p.allergies}</div>}
                          </div>
                          
                          <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                            {isEditing ? (
                              <>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleSaveEdit(); }} 
                                  style={{ flex: 1, padding: '15px', backgroundColor: '#10B981', color: 'white', borderRadius: '12px', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: isLargeText ? `${14 * pScale}px` : '14px' }}
                                >
                                  <Save size={isLargeText ? 20 * pScale : 20} /> ZAPISZ ZMIANY
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setEditingPesel(null); }} 
                                  style={{ flex: 1, padding: '15px', backgroundColor: '#EF4444', color: 'white', borderRadius: '12px', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: isLargeText ? `${14 * pScale}px` : '14px' }}
                                >
                                  <X size={isLargeText ? 20 * pScale : 20} /> ANULUJ
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleEditClick(p); }} 
                                style={{ flex: 1, padding: '15px', backgroundColor: '#F59E0B', color: 'white', borderRadius: '12px', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: isLargeText ? `${14 * pScale}px` : '14px' }}
                              >
                                <Edit size={isLargeText ? 20 * pScale : 20} /> EDYTUJ DANE
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SEKCJA 2: GRAFIK I WIZYTY */}
        {activeTab === 'grafik' && (
          <div style={infoSectionStyle}>
            <h3 style={mainHeaderStyle}><CalendarIcon size={28} color="#3B82F6" /> GRAFIK PRACY I ZAREJESTROWANE WIZYTY</h3>
            <div style={containerStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr', gap: SECTION_GAP }}>
                
                <div style={{ backgroundColor: 'white', borderRadius: '30px', padding: '25px', border: `1px solid ${BORDER_BLUE}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <button onClick={handlePrevMonth} style={{ background: DARKER_BLUE, border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}><ChevronLeft size={isLargeText ? 28 : 24} color="#1E3A8A"/></button>
                    <h4 style={{ margin: 0, fontWeight: '800', fontSize: `${18 * cScale}px` }}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h4>
                    <button onClick={handleNextMonth} style={{ background: DARKER_BLUE, border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}><ChevronRight size={isLargeText ? 28 : 24} color="#1E3A8A"/></button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
                    {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(d => <div key={d} style={{ fontWeight: '900', color: '#3B82F6', fontSize: isLargeText ? '18px' : '13px' }}>{d}</div>)}
                    {days.map((day, idx) => {
                      const isSelected = day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth();
                      const isToday = day === todayObj.getDate() && currentDate.getMonth() === todayObj.getMonth() && currentDate.getFullYear() === todayObj.getFullYear();
                      const isHovered = hoveredDay === day;
                      
                      let dots = [];
                      if (day) {
                        const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 12, 0, 0);
                        const dateStr = getLocalDateString(d);
                        
                       
                        const dayPlanEntry = allSchedules.find(s => s.date === dateStr);
                        if (dayPlanEntry && dayPlanEntry.plan) {
                          dayPlanEntry.plan.forEach(p => dots.push(p.dotColor));
                        }

                        const patientVisits = getPatientsForDate(d);
                        if (patientVisits.some(v => v.isOperation)) dots.push("#DC2626");
                      }

                      return (
                        <div key={idx} 
                          onMouseEnter={() => day && setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          
                          onClick={() => {
                            if (day) {
                              
                              const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 12, 0, 0);
                              setSelectedDate(newDate);
                              fetchPlanForDate(newDate);
                            }
                          }}
                          style={{ padding: '10px 0', borderRadius: '12px', cursor: day ? 'pointer' : 'default', minHeight: isLargeText ? '70px' : '55px', backgroundColor: isSelected ? '#1E3A8A' : (isHovered ? '#DBEAFE' : 'transparent'), color: isSelected ? 'white' : '#1E3A8A', fontWeight: isLargeText ? '900' : '800', border: isToday ? `2px solid #3B82F6` : '2px solid transparent', fontSize: isLargeText ? '24px' : '14px' }}>
                          {day}
                          <div style={{ display: 'flex', gap: isLargeText ? '6px' : '3px', marginTop: isLargeText ? '8px' : '4px', justifyContent: 'center' }}>
                            {dots.slice(0, 3).map((color, i) => <div key={i} style={{ width: isLargeText ? '12px' : '6px', height: isLargeText ? '12px' : '6px', borderRadius: '50%', backgroundColor: color }} />)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{...dataItemStyle, borderLeft: '10px solid #3B82F6'}}>
                    <span style={grafikLabelStyle}>Miejsce Pracy / Dyżur</span>
                    <span style={{...valueStyle, display: 'flex', alignItems: 'center', gap: '8px', fontSize: `${15 * gScale}px`}}>{getDutyInfo(selectedDate).icon} {getDutyInfo(selectedDate).text}</span>
                  </div>
                  <div style={{...dataItemStyle, borderLeft: '10px solid #1E3A8A', backgroundColor: '#F0F9FF', flex: 1}}>
                    <span style={grafikLabelStyle}>PLAN DNIA: {selectedDate.toLocaleDateString('pl-PL')}</span>
                    {selectedDayPlan.map((s, i) => (
                        <div key={i} style={{backgroundColor: 'white', padding: '12px', borderRadius: '12px', border: s.type.includes("Odprawa") ? "2px solid #F59E0B" : `1px solid ${s.dotColor}`, display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px'}}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: s.dotColor }} />
                          <div style={{flex: 1}}>
                             <div style={{display: 'flex', justifyContent: 'space-between'}}><span style={{fontWeight: '900', color: '#1E3A8A', fontSize: `${16 * gScale}px`}}>{s.time}</span><span style={{color: '#3B82F6', fontWeight: '800', fontSize: `${13 * gScale}px`}}>{s.type}</span></div>
                             <div style={{fontSize: `${14 * gScale}px`, color: '#64748b'}}><MapPin size={isLargeText ? 16 : 12} style={{display:'inline'}}/> {s.room}</div>
                          </div>
                        </div>
                    ))}
                    {selectedDayPlan.length === 0 && <div style={{padding:'20px', color:'#94A3B8', textAlign:'center', fontSize: `${16 * gScale}px`}}>Brak zajęć.</div>}
                  </div>
                </div>

                <div style={{...dataItemStyle, borderLeft: '10px solid #10B981', backgroundColor: '#F0FDF4', flex: 1}}>
                  <span style={grafikLabelStyle}>PACJENCI NA DZIEŃ: {selectedDate.toLocaleDateString('pl-PL')}</span>
                  {getPatientsForDate(selectedDate).length > 0 ? getPatientsForDate(selectedDate).map((p, i) => (
                    <div key={i} style={{backgroundColor: p.isOperation ? '#FEF2F2' : 'white', padding: '12px', borderRadius: '12px', border: p.isOperation ? '1px solid #DC2626' : `1px solid #10B981`, display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px'}}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: p.isOperation ? '#DC2626' : '#10B981' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{fontWeight: '900', color: p.isOperation ? '#DC2626' : '#1E3A8A', fontSize: `${16 * gScale}px`}}>{p.time} - {p.patient}</div>
                        <div style={{fontSize: `${13 * gScale}px`, color: '#64748b'}}>{p.type}</div>
                      </div>
                    </div>
                  )) : <div style={{ padding: '30px', color: '#94A3B8', fontWeight: '700', textAlign: 'center', fontSize: `${16 * gScale}px` }}>Brak wizyt na ten dzień.</div>}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB: RECEPTY */}
        {activeTab === 'recepty' && (
          <div style={infoSectionStyle}>
            <h3 style={mainHeaderStyle}><ClipboardList size={28} color="#3B82F6" /> WYSTAW RECEPTĘ ELEKTRONICZNĄ</h3>
            <div style={containerStyle}>
              <div style={{...dataItemStyle, padding: '40px', border: `1px solid ${BORDER_BLUE}`}}>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px'}}>
                  
                  <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <label style={{...labelStyle, fontSize: isLargeText ? `${12.1 * rScale}px` : '12.1px'}}>Wyszukaj Pacjenta</label>
                    <input 
                      type="text" 
                      value={prescriptionSearch} 
                      onChange={(e) => setPrescriptionSearch(e.target.value)} 
                      style={prescriptionInputStyle} 
                      placeholder="Imię lub PESEL..." 
                    />
                    {prescriptionResults.length > 0 && (
                      <div style={{backgroundColor: 'white', borderRadius: '10px', border: `1px solid ${BORDER_BLUE}`, overflow: 'hidden'}}>
                        {prescriptionResults.map((p, idx) => (
                          <div key={idx} onClick={() => { setSelectedPatient(p); setPrescriptionSearch(''); }} style={{padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: isLargeText ? `${16 * rScale}px` : '16px', fontWeight: '700'}}>
                            {p.name} ({p.pesel})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <label style={{...labelStyle, fontSize: isLargeText ? `${12.1 * rScale}px` : '12.1px'}}>Pacjent Wybrany</label>
                    <div style={{...prescriptionInputStyle, backgroundColor: '#F8FAFC'}}>
                      {selectedPatient ? selectedPatient.name : "Nie wybrano"}
                    </div>
                  </div>
                </div>

                <label style={{...labelStyle, fontSize: isLargeText ? `${12.1 * rScale}px` : '12.1px'}}>Leki i Dawkowanie</label>
                <textarea 
                  value={prescriptionMeds} 
                  onChange={(e) => setPrescriptionMeds(e.target.value)} 
                  style={{...prescriptionInputStyle, minHeight: '150px', marginBottom: '20px'}} 
                  placeholder="np. Amotaks 1g, 2x dziennie przez 7 dni" 
                />
                
                <button 
                  disabled={!selectedPatient || !prescriptionMeds} 
                  onClick={async () => {
                    const accessCode = Math.floor(1000 + Math.random() * 9000).toString();
                    const now = new Date();
                    const expiry = addDays(now, 30); 

                    const data = {
                      patientPesel: selectedPatient.pesel,
                      patientEmail: selectedPatient.email, 
                      doctorName: user.name,
                      medications: prescriptionMeds,
                      code: accessCode,
                      issueDate: getLocalDateString(now),
                      expiryDate: getLocalDateString(expiry)
                    };

                    const res = await fetch(`${API_URL}/api/prescriptions`, {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify(data)
                    });

                    if(res.ok) {
                      setSentStatus(true);
                      setTimeout(() => { 
                        setSentStatus(false); 
                        setPrescriptionMeds(''); 
                        setSelectedPatient(null); 
                      }, 3000);
                    }
                  }} 
                  style={{width: '100%', padding: '20px', backgroundColor: sentStatus ? '#10B981' : '#1E3A8A', color: 'white', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: isLargeText ? `${16 * rScale}px` : '16px'}}
                >
                  {sentStatus ? <CheckCircle size={isLargeText ? 28 * rScale : 28}/> : <Send size={isLargeText ? 24 * rScale : 24}/>} 
                  {sentStatus ? "RECEPTA ZAPISANA I WYŚLANA" : "PODPISZ I WYŚLIJ E-RECEPTĘ"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;