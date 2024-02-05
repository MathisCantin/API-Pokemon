const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const app = express();

app.use(express.json());

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('clf', { stream: accessLogStream }));

app.use('/api/pokemons', require('./src/routes/pokemon.route.js'));

app.get('/api', (req, res) => {
    res.send('Message de bienvenue à l\'api de pokemon');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
