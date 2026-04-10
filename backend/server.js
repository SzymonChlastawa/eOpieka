require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer'); 

const app = express();
const PORT = process.env.PORT || 5001; 

// 1. UPROSZCZONA KONFIGURACJA CORS (Najbezpieczniejsza na czas obrony)
app.use(cors()); 
app.use(express.json());

// 2. POŁĄCZENIE Z MONGODB (Zmieniono na MONGODB_URI, aby pasowało do Rendera)
const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Połączono z bazą MongoDB!'))
  .catch(err => console.error('❌ Błąd połączenia z MongoDB:', err));


// --- SCHEMATY MONGODB (Bez zmian) ---

const userSchema = new mongoose.Schema({
  login: String, 
  password: String,
  role: String,
  name: String
});
const User = mongoose.model('User', userSchema);

const systemSchema = new mongoose.Schema({
  configId: { type: String, default: 'main' },
  hospitalName: String,
  address: String,
  phones: Array,
  departments: Array,
  doctorSchedule: Object
}, { strict: false });
const SystemData = mongoose.model('SystemData', systemSchema);

const patientSchema = new mongoose.Schema({
  name: String, pesel: String, birth: String, age: Number, gender: String,
  address: String, phone: String, email: String, blood: String,
  height: String, weight: String, allergies: String,
  medications: { type: Array, default: [] },
  visits: { type: Array, default: [] }
}, { strict: false });
const Patient = mongoose.model('PatientV8', patientSchema);

const dailyScheduleSchema = new mongoose.Schema({
  doctorLogin: String,
  date: String, 
  plan: Array   
});
const DailySchedule = mongoose.model('DailySchedule', dailyScheduleSchema);

const prescriptionSchema = new mongoose.Schema({
  patientPesel: String,
  doctorName: String,
  medications: String,
  code: String,       
  issueDate: String,  
  expiryDate: String  
});
const Prescription = mongoose.model('Prescription', prescriptionSchema);


// KONFIGURACJA NODEMAILER

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});


// --- ENDPOINTY (API) (Bez zmian) ---

// LOGOWANIE 
app.post('/api/login', async (req, res) => {
    const { pesel, password } = req.body; 
    try {
        const user = await User.findOne({ login: pesel, password: password });
        if (user) {
            res.json({ success: true, user: { name: user.name, role: user.role, pesel: user.login } });
        } else {
            res.status(401).json({ success: false, message: "Błąd logowania. Nieprawidłowe dane." });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// USTAWIENIA SYSTEMU 
app.get('/api/system', async (req, res) => {
  try {
    const systemData = await SystemData.findOne({ configId: 'main' });
    res.json(systemData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/system', async (req, res) => {
  try {
    const updatedSystem = await SystemData.findOneAndUpdate(
      { configId: 'main' },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    res.json(updatedSystem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PACJENCI I KARTOTEKI 
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/patients/:pesel', async (req, res) => {
  try {
    const updatedPatient = await Patient.findOneAndUpdate(
      { pesel: req.params.pesel },
      { $set: req.body }, 
      { returnDocument: 'after' } 
    );
    res.json(updatedPatient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/patients/:pesel/assign', async (req, res) => {
  try {
    const updated = await Patient.findOneAndUpdate(
      { pesel: req.params.pesel },
      { $set: { assignedDoctor: req.body.doctorName } },
      { returnDocument: 'after' }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UŻYTKOWNICY 
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { login, password, role, name } = req.body;
  try {
    const existingUser = await User.findOne({ login });
    if (existingUser) return res.status(400).json({ message: "PESEL/Login już zajęty!" });

    const newUser = await User.create({ login, password, role, name });

    if (role === 'pacjent') {
      await Patient.create({
        name, pesel: login, assignedDoctor: "", 
        medications: [], visits: []
      });
    }
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user && user.role === 'pacjent') {
      await Patient.deleteOne({ pesel: user.login });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Usunięto pomyślnie" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { login, password, name } = req.body;
  try {
    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) return res.status(404).json({ message: "Nie znaleziono użytkownika" });

    if (userToUpdate.role === 'pacjent' && userToUpdate.login !== login) {
       await Patient.findOneAndUpdate(
         { pesel: userToUpdate.login },
         { $set: { pesel: login, name: name } }
       );
    }

    userToUpdate.login = login;
    userToUpdate.password = password;
    userToUpdate.name = name;
    await userToUpdate.save();

    res.json({ message: "Dane zaktualizowane pomyślnie" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GRAFIK LEKARZA 
app.get('/api/daily-schedule/:login/:date', async (req, res) => {
  try {
    const entry = await DailySchedule.findOne({ 
      doctorLogin: req.params.login, 
      date: req.params.date 
    });
    res.json(entry || { plan: [] }); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/daily-schedule', async (req, res) => {
  const { doctorLogin, date, plan } = req.body;
  try {
    const updated = await DailySchedule.findOneAndUpdate(
      { doctorLogin, date },
      { $set: { plan } },
      { upsert: true, returnDocument: 'after' }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/daily-schedule/:login', async (req, res) => {
  try {
    const schedules = await DailySchedule.find({ doctorLogin: req.params.login });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/weekly-schedule', async (req, res) => {
  const { doctorLogin, weeklyData } = req.body; 
  try {
    const promises = weeklyData.map(day => 
      DailySchedule.findOneAndUpdate(
        { doctorLogin, date: day.date },
        { $set: { plan: day.plan } },
        { upsert: true }
      )
    );
    await Promise.all(promises);
    res.json({ message: "Cały tydzień został zapisany pomyślnie!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// E-RECEPTY 
app.get('/api/prescriptions/:pesel', async (req, res) => {
  try {
    const list = await Prescription.find({ patientPesel: req.params.pesel });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/prescriptions', async (req, res) => {
  try {
    const newPrescription = new Prescription(req.body);
    await newPrescription.save();

    if (req.body.patientEmail) {
      const mailOptions = {
        from: `"eOpieka" <${process.env.EMAIL_USER}>`, 
        to: req.body.patientEmail,              
        subject: 'Wystawiono nową E-Receptę - Szpital eOpieka',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #B9D7F2; border-radius: 15px; overflow: hidden;">
            <div style="background-color: #1E3A8A; padding: 20px; text-align: center; color: white;">
              <h2 style="margin: 0;">Twoja E-Recepta</h2>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px;">Witaj, lekarz <strong>${req.body.doctorName}</strong> właśnie wystawił Ci nową receptę elektroniczną.</p>
              
              <div style="background-color: #F8FAFC; border: 2px dashed #3B82F6; padding: 20px; border-radius: 10px; text-align: center; margin: 25px 0;">
                <p style="margin: 0; color: #64748b; font-size: 14px; text-transform: uppercase; font-weight: bold;">Twój kod PIN do apteki</p>
                <h1 style="font-size: 48px; color: #1E3A8A; letter-spacing: 8px; margin: 10px 0;">${req.body.code}</h1>
                <p style="margin: 0; color: #DC2626; font-weight: bold;">Ważna do: ${req.body.expiryDate}</p>
              </div>

              <h3 style="color: #3B82F6; border-bottom: 2px solid #EBF5FF; padding-bottom: 10px;">Zalecone dawkowanie:</h3>
              <p style="font-size: 16px; white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 8px;">${req.body.medications}</p>
            </div>
            <div style="background-color: #F1F5F9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
              Wiadomość wygenerowana automatycznie. Udaj się do dowolnej apteki z kodem PIN oraz numerem PESEL.
            </div>
          </div>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log('Błąd wysyłki e-mail:', error);
      });
    }

    res.status(201).json(newPrescription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// START 
app.listen(PORT, () => {
  console.log(`🚀 Serwer działa na porcie: ${PORT}`);
});