import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Settings, 
  Clock, 
  LogOut, 
  Search, 
  Edit, 
  Save, 
  X, 
  Plus, 
  Trash2,
  Building,
  Phone,
  ListChecks,
  Activity,
  UserPlus,
  ShieldCheck,
  Check,
  Calendar,
  Crown,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

const AdminDashboard = ({ user, onLogout, isLargeText, setIsLargeText }) => {
  // Adres backendu pod hosting
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']");
    if (link) link.href = "/logo_eOpieka.png";

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

  const formatDateSafe = (date) => {
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  };

  const dayNamesPL = {
    monday: 'PONIEDZIAŁEK',
    tuesday: 'WTOREK',
    wednesday: 'ŚRODA',
    thursday: 'CZWARTEK',
    friday: 'PIĄTEK'
  };

  const [activeTab, setActiveTab] = useState('ustawienia'); 
  const [systemData, setSystemData] = useState(null);
  const [editSystemData, setEditSystemData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [patients, setPatients] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', login: '', password: '', role: 'pacjent' });

  const [grafikMode, setGrafikMode] = useState('daily'); 
  const [selectedDocForSched, setSelectedDocForSched] = useState("");
  const [currentSchedule, setCurrentSchedule] = useState([]); 
  const [selectedDateForSched, setSelectedDateForSched] = useState(formatDateSafe(new Date()));
  const [weeklySchedule, setWeeklySchedule] = useState({ monday: [], tuesday: [], wednesday: [], thursday: [], friday: [] });

  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ name: '', login: '', password: '' });

  // Parametry skalowania dla trybu 60+
  const scale = isLargeText ? 1.1 : 1;
  const fontScale = isLargeText ? 1.3 : 1;
  const pScale = isLargeText ? 1.8 : 1;

  const MARGIN = '46px'; 
  const DARKER_BLUE = '#EBF5FF';
  const BORDER_BLUE = '#B9D7F2';
  const FONT_FAMILY = "'Montserrat', sans-serif";

  const fetchData = async () => {
    try {
      const [sysRes, usersRes, patientsRes] = await Promise.all([
        fetch(`${API_URL}/api/system`),
        fetch(`${API_URL}/api/users`),
        fetch(`${API_URL}/api/patients`)
      ]);
      const sData = await sysRes.json();
      setSystemData(sData);
      setEditSystemData(sData);
      setUsersList(await usersRes.json());
      setPatients(await patientsRes.json());
    } catch (error) {
      console.error("Błąd pobierania danych:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getWeekDates = (baseDate) => {
    const d = new Date(baseDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(d.setDate(diff));
    return [0, 1, 2, 3, 4].map(offset => {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + offset);
      return formatDateSafe(nextDay);
    });
  };

  const loadDailySchedule = async (login, date) => {
    if (!login || !date) return;
    const res = await fetch(`${API_URL}/api/daily-schedule/${login}/${date}`);
    const data = await res.json();
    setCurrentSchedule(data.plan || []);
  };

  const handleSaveDailySchedule = async () => {
    if (!selectedDocForSched) return alert("Wybierz lekarza!");
    await fetch(`${API_URL}/api/daily-schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorLogin: selectedDocForSched,
        date: selectedDateForSched,
        plan: currentSchedule
      })
    });
    alert(`Zapisano grafik na dzień ${selectedDateForSched}`);
  };

  const handleSaveWeeklySchedule = async () => {
    if (!selectedDocForSched) return alert("Wybierz lekarza!");
    const weekDates = getWeekDates(selectedDateForSched);
    const weeklyData = [
      { date: weekDates[0], plan: weeklySchedule.monday },
      { date: weekDates[1], plan: weeklySchedule.tuesday },
      { date: weekDates[2], plan: weeklySchedule.wednesday },
      { date: weekDates[3], plan: weeklySchedule.thursday },
      { date: weekDates[4], plan: weeklySchedule.friday },
    ];
    const res = await fetch(`${API_URL}/api/weekly-schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorLogin: selectedDocForSched, weeklyData })
    });
    if (res.ok) alert("Cały tydzień pracy został zapisany!");
  };

  const addBlockDaily = () => {
    setCurrentSchedule([...currentSchedule, { time: "08:00", type: "Wizyty", room: "Gabinet 1", dotColor: "#3B82F6" }]);
  };

  const handleSaveSystem = async () => {
    try {
      const response = await fetch(`${API_URL}/api/system`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editSystemData)
      });
      if (response.ok) {
        alert("Ustawienia systemu zostały zaktualizowane!");
        fetchData();
      }
    } catch (error) { console.error(error); }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.login || !newUser.password) return alert("Wypełnij wszystkie pola!");
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) { 
        setNewUser({ name: '', login: '', password: '', role: 'pacjent' }); 
        fetchData(); 
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Czy na pewno chcesz usunąć to konto?")) {
      try {
        const response = await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' });
        if (response.ok) fetchData();
      } catch (error) { console.error(error); }
    }
  };

  const startEditing = (u) => {
    setEditingUserId(u._id);
    setEditUserForm({ name: u.name, login: u.login, password: u.password });
  };

  const handleSaveUserEdit = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUserForm)
      });
      if (res.ok) {
        setEditingUserId(null);
        fetchData();
      }
    } catch (e) { console.error(e); }
  };

  const handleAssignDoctor = async (pesel, doctorName) => {
    try {
      await fetch(`${API_URL}/api/patients/${pesel}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorName })
      });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleArrayChange = (field, index, subField, value) => {
    const newArray = [...editSystemData[field]];
    newArray[index] = { ...newArray[index], [subField]: value };
    setEditSystemData({ ...editSystemData, [field]: newArray });
  };

  const doctors = usersList.filter(u => u.role === 'lekarz');

  const navButtonStyle = (id) => ({
    width: 'auto', height: '60px', padding: isLargeText ? `0 ${16 * scale}px` : '0 22px', 
    borderRadius: '16px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease',
    backgroundColor: activeTab === id ? '#1E3A8A' : '#FFFFFF',
    color: activeTab === id ? 'white' : '#1E3A8A',
    border: `1px solid ${BORDER_BLUE}`, textTransform: 'uppercase', 
    fontSize: `${14 * fontScale}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: FONT_FAMILY
  });

  const labelStyle = { color: '#64748b', fontSize: '12.1px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: FONT_FAMILY, marginBottom: '8px', display: 'block' };
  const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '12px', border: `2px solid ${BORDER_BLUE}`, outline: 'none', fontSize: isLargeText ? `${16 * pScale}px` : '16px', fontFamily: FONT_FAMILY, fontWeight: '700', color: '#1E3A8A', boxSizing: 'border-box' };

  if (!systemData) return <div style={{ padding: '50px', textAlign: 'center', fontFamily: FONT_FAMILY }}>Ładowanie...</div>;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0, display: 'flex', flexDirection: 'column', backgroundColor: '#F1F5F9', overflowX: 'hidden', overflowY: 'auto', scrollbarGutter: 'stable', fontFamily: FONT_FAMILY }}>
      
      {/* HEADER */}
      <div style={{ width: '100%', backgroundColor: DARKER_BLUE, padding: `25px ${MARGIN} 15px ${MARGIN}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxSizing: 'border-box', borderBottom: `1px solid ${BORDER_BLUE}`, position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', height: '60px', marginTop: '8px' }}>
          <img src="/logo_eOpieka.png" alt="Logo" style={{ height: '70px' }} />
          <h1 style={{ margin: 0, color: '#1E3A8A', fontSize: isLargeText ? '42px' : '36px', fontWeight: '800', letterSpacing: '-1.5px' }}>e<span style={{ color: '#3B82F6' }}>-</span>Opieka</h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', justifyContent: 'center', alignItems: 'center', flexGrow: 1, margin: isLargeText ? '0 10px' : '0 30px' }}>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
            <button onClick={() => setActiveTab('ustawienia')} style={navButtonStyle('ustawienia')}><Building size={isLargeText ? 28 : 20}/> Szpital</button>
            <button onClick={() => setActiveTab('grafik')} style={navButtonStyle('grafik')}><Clock size={isLargeText ? 28 : 20}/> Grafik</button>
            <button onClick={() => setActiveTab('konta')} style={navButtonStyle('konta')}><Users size={isLargeText ? 28 : 20}/> Konta</button>
          </div>
          <div style={{ color: '#DC2626', fontSize: isLargeText ? '18px' : '14px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crown size={22} color="#DC2626" /> PANEL ADMINISTRATORA
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px', height: '60px' }}>
          {/* PRZYCISK 60+ */}
          <button 
            onClick={() => setIsLargeText(!isLargeText)} 
            style={{ 
              height: '60px', padding: isLargeText ? '0 15px' : '0 18px', borderRadius: '15px', 
              backgroundColor: isLargeText ? '#3B82F6' : '#1E3A8A', color: 'white', 
              fontSize: `${20 * fontScale}px`, fontWeight: '900', cursor: 'pointer', border: `1px solid ${BORDER_BLUE}`,
              animation: 'pulse-yellow-glow 2s infinite'
            }}> 
            {isLargeText ? <ZoomOut size={30} /> : <ZoomIn size={30} />}
          </button>
          <button onClick={onLogout} style={{ ...navButtonStyle('logout'), backgroundColor: '#DC2626', color: 'white', border: 'none' }}> WYLOGUJ <LogOut size={isLargeText ? 28 : 20} /> </button>
        </div>
      </div>

      <div style={{ flex: 1, paddingTop: '30px', paddingBottom: '60px', paddingLeft: MARGIN, paddingRight: MARGIN }}>
        
        {/* ZAKŁADKA 1: USTAWIENIA SZPITALA */}
        {activeTab === 'ustawienia' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ color: '#1E3A8A', margin: 0, fontWeight: '900', display: 'flex', alignItems: 'center', gap: '15px', fontSize: isLargeText ? '36px' : '30px' }}><Settings size={32} /> Ustawienia Szpitala</h2>
              <button onClick={handleSaveSystem} style={{ padding: '15px 30px', backgroundColor: '#10B981', color: 'white', borderRadius: '15px', border: 'none', fontWeight: '800', fontSize: isLargeText ? '22px' : '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}><Save size={20}/> ZAPISZ ZMIANY</button>
            </div>

            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '25px', border: `1px solid ${BORDER_BLUE}` }}>
              <h3 style={{ color: '#3B82F6', marginTop: 0, marginBottom: '20px', borderBottom: `2px solid ${BORDER_BLUE}`, paddingBottom: '10px', fontSize: isLargeText ? '24px' : '18px' }}>Dane Podstawowe</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div><span style={labelStyle}>Nazwa Placówki</span><input value={editSystemData.hospitalName} onChange={e => setEditSystemData({...editSystemData, hospitalName: e.target.value})} style={inputStyle} /></div>
                <div><span style={labelStyle}>Główny Adres</span><input value={editSystemData.address} onChange={e => setEditSystemData({...editSystemData, address: e.target.value})} style={inputStyle} /></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '25px', border: `1px solid ${BORDER_BLUE}` }}>
                <h3 style={{ color: '#3B82F6', marginTop: 0, marginBottom: '20px', borderBottom: `2px solid ${BORDER_BLUE}`, paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={20}/> Numery Telefonów</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {editSystemData.phones.map((phone, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px' }}>
                      <input value={phone.label} onChange={e => handleArrayChange('phones', idx, 'label', e.target.value)} placeholder="Nazwa" style={{...inputStyle, flex: 1}} />
                      <input value={phone.val} onChange={e => handleArrayChange('phones', idx, 'val', e.target.value)} placeholder="Numer" style={{...inputStyle, width: '150px'}} />
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '25px', border: `1px solid ${BORDER_BLUE}` }}>
                <h3 style={{ color: '#3B82F6', marginTop: 0, marginBottom: '20px', borderBottom: `2px solid ${BORDER_BLUE}`, paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}><ListChecks size={20}/> Oddziały Szpitalne</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {editSystemData.departments.map((dep, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '5px', paddingBottom: '15px', borderBottom: '1px dashed #E2E8F0' }}>
                      <input value={dep.label} onChange={e => handleArrayChange('departments', idx, 'label', e.target.value)} placeholder="Nazwa Oddziału" style={{...inputStyle, fontWeight: '900'}} />
                      <input value={dep.val} onChange={e => handleArrayChange('departments', idx, 'val', e.target.value)} placeholder="Lokalizacja / Godziny" style={inputStyle} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ZAKŁADKA 2: GRAFIK LEKARZY */}
        {activeTab === 'grafik' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', backgroundColor: 'white', padding: '25px', borderRadius: '20px', border: `1px solid ${BORDER_BLUE}` }}>
              <div>
                <label style={labelStyle}>1. Wybierz lekarza:</label>
                <select style={inputStyle} value={selectedDocForSched} onChange={(e) => { setSelectedDocForSched(e.target.value); if(grafikMode==='daily') loadDailySchedule(e.target.value, selectedDateForSched); }}>
                  <option value="">-- Wybierz lekarza --</option>
                  {doctors.map(d => <option key={d.login} value={d.login}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>2. Wybierz datę:</label>
                <input type="date" style={inputStyle} value={selectedDateForSched} onChange={(e) => { setSelectedDateForSched(e.target.value); if(grafikMode==='daily') loadDailySchedule(selectedDocForSched, e.target.value); }} />
              </div>
              <div>
                <label style={labelStyle}>3. Tryb edycji:</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setGrafikMode('daily')} style={{ flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer', backgroundColor: grafikMode==='daily'?'#1E3A8A':'#F1F5F9', color: grafikMode==='daily'?'white':'#1E3A8A', border: 'none', fontWeight: '800' }}>DZIENNY</button>
                  <button onClick={() => setGrafikMode('weekly')} style={{ flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer', backgroundColor: grafikMode==='weekly'?'#1E3A8A':'#F1F5F9', color: grafikMode==='weekly'?'white':'#1E3A8A', border: 'none', fontWeight: '800' }}>TYGODNIOWY</button>
                </div>
              </div>
            </div>

            {selectedDocForSched && grafikMode === 'daily' && (
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '25px', border: `1px solid ${BORDER_BLUE}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: '#1E3A8A' }}>Edycja dnia: {selectedDateForSched}</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={addBlockDaily} style={{ padding: '10px 20px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>+ BLOK</button>
                    <button onClick={handleSaveDailySchedule} style={{ padding: '10px 30px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>ZAPISZ DZIEŃ</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {currentSchedule.map((block, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr auto', gap: '15px', alignItems: 'center', padding: '15px', backgroundColor: '#F8FAFC', borderRadius: '15px', border: '1px solid #E2E8F0' }}>
                      <input style={inputStyle} value={block.time} onChange={(e) => { const copy = [...currentSchedule]; copy[idx].time = e.target.value; setCurrentSchedule(copy); }} />
                      <input style={inputStyle} value={block.type} placeholder="Typ zajęć" onChange={(e) => { const copy = [...currentSchedule]; copy[idx].type = e.target.value; setCurrentSchedule(copy); }} />
                      <input style={inputStyle} value={block.room} placeholder="Lokalizacja" onChange={(e) => { const copy = [...currentSchedule]; copy[idx].room = e.target.value; setCurrentSchedule(copy); }} />
                      <button onClick={() => { setCurrentSchedule(currentSchedule.filter((_, i) => i !== idx)); }} style={{ color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={20}/></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDocForSched && grafikMode === 'weekly' && (
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '25px', border: `1px solid ${BORDER_BLUE}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                  <h3 style={{ margin: 0, color: '#1E3A8A' }}>Generator Tygodniowy (Pn-Pt)</h3>
                  <button onClick={handleSaveWeeklySchedule} style={{ padding: '12px 40px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>ZAPISZ CAŁY TYDZIEŃ</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day, dIdx) => (
                    <div key={day} style={{ backgroundColor: '#F8FAFC', padding: '15px', borderRadius: '15px', border: `1px solid ${BORDER_BLUE}` }}>
                      <div style={{ fontWeight: '900', color: '#1E3A8A', textAlign: 'center', marginBottom: '10px', fontSize: '12px' }}>
                        {dayNamesPL[day]} ({getWeekDates(selectedDateForSched)[dIdx]})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {weeklySchedule[day].map((block, bIdx) => (
                          <div key={bIdx} style={{ backgroundColor: 'white', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            <input style={{ border: 'none', fontWeight: '800', width: '100%', fontSize: '11px', outline: 'none' }} value={block.time} onChange={e => { const w = { ...weeklySchedule }; w[day][bIdx].time = e.target.value; setWeeklySchedule(w); }} />
                            <input style={{ border: 'none', color: '#3B82F6', width: '100%', fontSize: '11px', outline: 'none' }} value={block.type} onChange={e => { const w = { ...weeklySchedule }; w[day][bIdx].type = e.target.value; setWeeklySchedule(w); }} />
                            <input style={{ border: 'none', color: '#64748b', width: '100%', fontSize: '10px', outline: 'none', marginTop: '4px' }} value={block.room} placeholder="Lokalizacja" onChange={e => { const w = { ...weeklySchedule }; w[day][bIdx].room = e.target.value; setWeeklySchedule(w); }} />
                            <button onClick={() => { const w = { ...weeklySchedule }; w[day] = w[day].filter((_, i) => i !== bIdx); setWeeklySchedule(w); }} style={{ color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer', marginTop: '5px' }}>
                              <Trash2 size={12}/>
                            </button>
                          </div>
                        ))}
                        <button onClick={() => { const w = { ...weeklySchedule }; w[day] = [...w[day], { time: "08:00", type: "Zajęcia", room: "Gabinet", dotColor: "#3B82F6" }]; setWeeklySchedule(w); }} style={{ padding: '5px', border: `2px dashed ${BORDER_BLUE}`, borderRadius: '8px', background: 'none', cursor: 'pointer', color: '#3B82F6' }}>
                          <Plus size={14}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ZAKŁADKA 3: KONTA UŻYTKOWNIKÓW */}
        {activeTab === 'konta' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', border: `1px solid ${BORDER_BLUE}` }}>
              <h3 style={{ marginTop: 0, color: '#1E3A8A', fontSize: isLargeText ? '24px' : '18px' }}><UserPlus size={20} style={{verticalAlign:'middle', marginRight:'10px'}}/> Dodaj nowego użytkownika</h3>
              <form onSubmit={handleAddUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
                <div><label style={labelStyle}>IMIĘ I NAZWISKO</label><input style={inputStyle} value={newUser.name} onChange={e=>setNewUser({...newUser, name:e.target.value})} placeholder="Imię Nazwisko"/></div>
                <div><label style={labelStyle}>PESEL / LOGIN</label><input style={inputStyle} value={newUser.login} onChange={e=>setNewUser({...newUser, login:e.target.value})} placeholder="PESEL"/></div>
                <div><label style={labelStyle}>HASŁO</label><input type="text" style={inputStyle} value={newUser.password} onChange={e=>setNewUser({...newUser, password:e.target.value})} placeholder="Hasło"/></div>
                <div><label style={labelStyle}>ROLA</label>
                  <select style={inputStyle} value={newUser.role} onChange={e=>setNewUser({...newUser, role:e.target.value})}>
                    <option value="pacjent">Pacjent</option>
                    <option value="lekarz">Lekarz</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <button type="submit" style={{ padding: '12px 25px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>DODAJ</button>
              </form>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '20px', border: `1px solid ${BORDER_BLUE}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#F8FAFC' }}>
                  <tr style={{ fontSize: isLargeText ? '16px' : '12px' }}>
                    <th style={{ padding: '15px', color:'#64748b' }}>UŻYTKOWNIK</th>
                    <th style={{ padding: '15px', color:'#64748b' }}>PESEL / LOGIN</th>
                    <th style={{ padding: '15px', color:'#64748b' }}>HASŁO</th>
                    <th style={{ padding: '15px', color:'#64748b' }}>ROLA</th>
                    <th style={{ padding: '15px', color:'#64748b' }}>OPIEKA (LEKARZ)</th>
                    <th style={{ padding: '15px', color:'#64748b' }}>AKCJE</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map(u => {
                    const isEditing = editingUserId === u._id;
                    const patient = patients.find(p => p.pesel === u.login);
                    return (
                      <tr key={u._id} style={{ borderTop: '1px solid #E2E8F0', backgroundColor: isEditing ? '#F0F9FF' : 'transparent', fontSize: isLargeText ? '18px' : '14px' }}>
                        <td style={{ padding: '15px' }}>
                          {isEditing ? <input style={inputStyle} value={editUserForm.name} onChange={e=>setEditUserForm({...editUserForm, name:e.target.value})}/> : <span style={{fontWeight:'700', color:'#1E3A8A'}}>{u.name}</span>}
                        </td>
                        <td style={{ padding: '15px' }}>
                          {isEditing ? <input style={inputStyle} value={editUserForm.login} onChange={e=>setEditUserForm({...editUserForm, login:e.target.value})}/> : u.login}
                        </td>
                        <td style={{ padding: '15px' }}>
                          {isEditing ? <input style={inputStyle} value={editUserForm.password} onChange={e=>setEditUserForm({...editUserForm, password:e.target.value})}/> : u.password}
                        </td>
                        <td style={{ padding: '15px' }}>
                           <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: isLargeText ? '14px' : '11px', fontWeight:'800', backgroundColor: u.role==='admin'?'#FEE2E2':u.role==='lekarz'?'#DBEAFE':'#DCFCE7' }}>{u.role.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: '15px' }}>
                          {u.role === 'pacjent' && !isEditing ? (
                            <select value={patient?.assignedDoctor || ""} onChange={(e) => handleAssignDoctor(u.login, e.target.value)} style={{...inputStyle, padding:'4px', fontSize:'11px'}}>
                              <option value="">Wybierz lekarza...</option>
                              {doctors.map(d => <option key={d.login} value={d.name}>{d.name}</option>)}
                            </select>
                          ) : "—"}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            {isEditing ? (
                              <>
                                <button onClick={() => handleSaveUserEdit(u._id)} style={{ color: '#10B981', border: 'none', background: 'none', cursor: 'pointer' }}><Check size={28}/></button>
                                <button onClick={() => setEditingUserId(null)} style={{ color: '#64748b', border: 'none', background: 'none', cursor: 'pointer' }}><X size={28}/></button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEditing(u)} style={{ color: '#3B82F6', border: 'none', background: 'none', cursor: 'pointer' }}><Edit size={isLargeText ? 24 : 18}/></button>
                                {u.login !== 'administrator' && (
                                  <button onClick={() => handleDeleteUser(u._id)} style={{ color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={isLargeText ? 24 : 18}/></button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;