const express = require('express');

const dotenv = require('dotenv');

// Initialisation de morgan
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');

// Initialisation | Importation du module swagger-ui-express
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./src/config/documentation.json'); //ajustez selon votre projet
const swaggerOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "API Pokémon"
};

const app = express(); // l'app utilise le module express
dotenv.config(); //initialisation des constante

// Middleware
app.use(express.json()); //converti en json

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('clf', { stream: accessLogStream }));

const authentification = require('./src/middlewares/authentification.middleware'); //protection des route (clé api)

// Les routes
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

//si route recu est; vérification clé-api; execute le scrie qui suit
app.use('/api/pokemons', require('./src/routes/pokemon.route.js'));
//app.use('/api/pokemons', authentification, require('./src/routes/pokemon.route.js'));

app.use('/api/users', require('./src/routes/utilisateur.route.js'))

app.get('/api', (req, res) => {
    res.send('Message de bienvenue à l\'api de pokemon');
});

// Boucle du serveur pour qu'il fonctionne
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
