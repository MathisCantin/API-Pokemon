const express = require('express');
const router = express.Router();

const Utilisateur = require("../controllers/utilisateur.controller");

router.post('/', Utilisateur.creerUtilisateur);

router.get('/cle', Utilisateur.recuperationCleApi);

module.exports = router;