const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Dane testowe
const users = [
    { pesel: "12345678901", password: "123", role: "pacjent", name: "Jan Kowalski", age: 72 },
    { pesel: "00000000000", password: "123", role: "lekarz", name: "dr Dominik Żelazny" }
];

app.post('/api/login', (req, res) => {
    const { pesel, password } = req.body;
    const user = users.find(u => u.pesel === pesel && u.password === password);

    if (user) {
        res.json({ success: true, user: { name: user.name, role: user.role } });
    } else {
        res.status(401).json({ success: false, message: "Błąd logowania" });
    }
});

app.listen(PORT, () => console.log(`Serwer eOpieka działa na porcie ${PORT}`));