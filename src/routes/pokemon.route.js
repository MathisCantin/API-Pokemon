const express = require('express');
const router = express.Router();
// À ajuster selon la structure
const pokemonsController = require('../controllers/pokemon.controller');

// Afficher une liste paginée de tous les pokemons
router.get('/liste', (req, res) => {
    pokemonsController.tousPokemon(req, res);
});

// Ajouter un pokemon
router.post('/', (req, res) => {
    pokemonsController.ajouterPokemon(req, res);
});

// Afficher un pokemon selon son id
router.get('/:id', (req, res) => {
    pokemonsController.trouverPokemon(req, res);
});

// Modifier un pokemon
router.put('/:id', (req, res) => {
    pokemonsController.modifierPokemon(req, res);
});

// Supprimer un pokemon
router.delete('/:id', (req, res) => {
    pokemonsController.supprimerPokemon(req, res);
});

module.exports = router;