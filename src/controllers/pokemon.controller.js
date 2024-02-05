// À ajuster selon la structure
const Pokemon = require("../models/pokemon.model.js");

exports.trouverPokemon = (req, res) => {
    // Teste si le paramètre id est présent et valide
    const pokemonId = parseInt(req.params.id);

    if (!pokemonId || pokemonId <= 0) {
        res.status(400).send({
            message: "L'id du Pokemon est obligatoire et doit être supérieur à 0",
        });
        return;
    }

    // Appel à la fonction dans le modèle
    Pokemon.trouverPokemon(pokemonId)
        .then((pokemon) => {
            // S'il n'y a aucun résultat, on retourne un message d'erreur avec le code 404
            console.log(pokemon);
            if (pokemon.length <= 0) {
                res.status(404).send({
                    erreur: `Pokemon introuvable avec l'id ${pokemonId}`,
                });
                return;
            }
            // Sinon on retourne le premier objet du tableau de résultat car on ne devrait avoir qu'un Pokemon par id
            res.status(200).send(pokemon);
        })
        .catch((erreur) => {
            console.error('Erreur : ', erreur);
            res.status(500).send({
                erreur: `Echec lors de la récupération du Pokemon avec l'id ${pokemonId}`,
            });
        });
};

exports.tousPokemon = (req, res) => {
    // Extracting page and type parameters from the query string
    const page = parseInt(req.query.page) || 1;
    const type = req.query.type || '';

    // Appel à la fonction dans le modèle avec pagination et filtrage par type
    Pokemon.tousPokemon(page, type)
        .then((result) => {
            const { pokemons, nombrePokemonTotal, totalPage } = result;

            res.status(200).send({
                pokemons,
                type: type || '',
                nombrePokemonTotal,
                page,
                totalPage,
            });
        })
        .catch((erreur) => {
            console.error('Erreur : ', erreur);
            res.status(500).send({
                erreur: "Echec lors de la récupération des Pokemons paginés et filtrés",
            });
        });
};

exports.ajouterPokemon = (req, res) => {
    // Récupérer les données du corps de la requête
    const nouveauPokemon = req.body;

    // Vérifier la présence des champs obligatoires
    const champsObligatoires = ['nom', 'type_primaire', 'pv', 'attaque', 'defense'];
    const champsManquants = champsObligatoires.filter(champ => !(champ in nouveauPokemon));

    if (champsManquants.length > 0) {
        res.status(400).send({
            erreur: "Le format des données est invalide",
            champ_manquant: champsManquants,
        });
        return;
    }

    // Appel à la fonction dans le modèle
    Pokemon.ajouterPokemon(
        nouveauPokemon.nom,
        nouveauPokemon.type_primaire,
        nouveauPokemon.type_secondaire,
        nouveauPokemon.pv,
        nouveauPokemon.attaque,
        nouveauPokemon.defense
    )
        .then((resultat) => {
            res.status(201).send({
                message: `Le pokemon ${nouveauPokemon.nom} a été ajouté avec succès`,
                pokemon: {
                    id: resultat.insertId,
                    ...nouveauPokemon
                }
            });
        })
        .catch((erreur) => {
            console.error('Erreur : ', erreur);
            res.status(500).send({
                erreur: `Echec lors de l'ajout du Pokemon ${nouveauPokemon.nom}`,
            });
        });
};

exports.modifierPokemon = (req, res) => {
    // Récupérer les données du corps de la requête
    const pokemonModifie = req.body;
    const pokemonId = parseInt(req.params.id);

    // Teste si le paramètre id est présent et valide
    if (!pokemonId || pokemonId <= 0) {
        res.status(400).send({
            message: "L'id du Pokemon est obligatoire et doit être supérieur à 0",
        });
        return;
    }

    // Vérification des champs obligatoires
    const champsObligatoires = ["nom", "type_primaire", "pv", "attaque", "defense"];
    const champsManquants = champsObligatoires.filter(champ => !(champ in pokemonModifie) || pokemonModifie[champ] === "");

    if (champsManquants.length > 0) {
        res.status(400).send({
            erreur: "Le format des données est invalide",
            champ_manquant: champsManquants,
        });
        return;
    }

    // Appel à la fonction dans le modèle
    Pokemon.modifierPokemon(
        pokemonModifie.nom,
        pokemonModifie.type_primaire,
        pokemonModifie.type_secondaire,
        pokemonModifie.pv,
        pokemonModifie.attaque,
        pokemonModifie.defense,
        pokemonId
    )
        .then((result) => {
            // Vérifier si des lignes ont été affectées (modification réussie)
            if (result.affectedRows === 0) {
                res.status(404).send({
                    erreur: `Le pokemon id ${pokemonId} n'existe pas dans la base de données`,
                });
                return;
            }

            res.status(200).send({
                message: `Pokemon modifié avec succès (id: ${pokemonId})`,
                pokemon: {
                    id: pokemonId,
                    ...pokemonModifie
                }
            });
        })
        .catch((erreur) => {
            console.error('Erreur : ', erreur);
            res.status(500).send({
                erreur: `Echec lors de la modification du Pokemon`,
            });
        });
};

exports.supprimerPokemon = (req, res) => {
    const pokemonId = parseInt(req.params.id);

    // Teste si le paramètre id est présent et valide
    if (!pokemonId || pokemonId <= 0) {
        res.status(400).send({
            message: "L'id du Pokemon est obligatoire et doit être supérieur à 0",
        });
        return;
    }

    // Appel à la fonction dans le modèle
    Pokemon.supprimerPokemon(pokemonId)
        .then(() => {
            res.status(200).send({
                message: `Pokemon supprimé avec succès (id: ${pokemonId})`,
                pokemon: {
                    id: pokemonId,
                    ...req.body // Assuming you have the details in the request body
                }
            });
        })
        .catch((erreur) => {
            console.error('Erreur : ', erreur);
            res.status(500).send({
                erreur: `Echec lors de la suppression du Pokemon`,
            });
        });
};
