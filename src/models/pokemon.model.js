// À ajuster selon la structure
const sql = require("../config/db.js");

// constructeur
const Pokemon = (Pokemon) => {
    this.nom = Pokemon.nom;
    this.type_primaire = Pokemon.type_primaire;
    this.type_secondaire = Pokemon.type_secondaire;
    this.pv = Pokemon.pv;
    this.attaque = Pokemon.attaque;
    this.defense = Pokemon.defense;
};

Pokemon.trouverPokemon = (id) => {
    return new Promise((resolve, reject) => {

        const requete = `SELECT * FROM pokemon WHERE id = ?`;
        const params = [id]

        sql.query(requete, params, (erreur, resultat) => {
            if (erreur) {
                // S'il y a une erreur, je la retourne avec reject()
                reject(erreur);
            }
            // Sinon je retourne le résultat sans faire de validation, c'est possible que le résultat soit vide
            resolve(resultat);
        });
    });
};

Pokemon.tousPokemon = (page, type) => {
    return new Promise((resolve, reject) => {
        const pokemonsParPage = 25;
        const decalage = (page - 1) * pokemonsParPage;

        let requete = 'SELECT * FROM pokemon';
        let requeteCount = 'SELECT COUNT(*) as total FROM pokemon';

        const parametres = [];

        if (type) {
            requete += ' WHERE type_primaire = ?';
            requeteCount += ' WHERE type_primaire = ?';
            parametres.push(type);
        }

        requete += ` LIMIT ?, ?`;
        parametres.push(decalage, pokemonsParPage);

        sql.query(requete, parametres, (erreur, resultat) => {
            if (erreur) {
                reject(erreur);
            } else {
                sql.query(requeteCount, parametres, (erreurComptage, resultatComptage) => {
                    if (erreurComptage) {
                        reject(erreurComptage);
                    } else {
                        const totalNombrePokemon = resultatComptage[0].total;
                        const totalPage = Math.ceil(totalNombrePokemon / pokemonsParPage);

                        resolve({
                            pokemons: resultat,
                            nombrePokemonTotal: totalNombrePokemon,
                            page: page,
                            totalPage: totalPage,
                        });
                    }
                });
            }
        });
    });
};

Pokemon.ajouterPokemon = (nom, type_primaire, type_secondaire, pv, attaque, defense) => {
    return new Promise((resolve, reject) => {

        const requete = `INSERT INTO pokemon (nom, type_primaire, type_secondaire, pv, attaque, defense) VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [nom, type_primaire, type_secondaire, pv, attaque, defense]

        sql.query(requete, params, (erreur, resultat) => {
            if (erreur) {
                reject(erreur);
            }
            resolve(resultat);
        });
    });
};

Pokemon.modifierPokemon = (nom, type_primaire, type_secondaire, pv, attaque, defense, id) => {
    return new Promise((resolve, reject) => {

        const requete = `UPDATE pokemon SET nom = ?, type_primaire = ?, type_secondaire = ?, pv = ?, attaque = ?, defense = ? WHERE id = ?`;
        const params = [nom, type_primaire, type_secondaire, pv, attaque, , id]

        sql.query(requete, params, (erreur, resultat) => {
            if (erreur) {
                reject(erreur);
            }
            resolve(resultat);
        });
    });
};

Pokemon.supprimerPokemon = (id) => {
    return new Promise((resolve, reject) => {

        const requete = `DELETE FROM pokemon WHERE id = ?`;
        const params = [id]

        sql.query(requete, params, (erreur, resultat) => {
            if (erreur) {
                reject(erreur);
            }
            resolve(resultat);
        });
    });
};

module.exports = Pokemon;