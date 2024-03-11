//const sql = require("../config/db.js");
const sql = require("../config/pg_db");
const bcrypt = require('bcrypt');

class Utilisateur {
    constructor(utilisateur) {
        this.id = utilisateur.id;
        this.nom = utilisateur.nom;
        this.courriel = utilisateur.courriel;
        this.mot_de_passe = utilisateur.mot_de_passe;
        this.cle_api = utilisateur.cle_api;
    }

    static creerUtilisateur(nouvelUtilisateur) {
        return new Promise(async (resolve, reject) => {
            try {
                // Valider que le courriel est unique
                const courrielUnique = await Utilisateur.validationCourrielUnique(nouvelUtilisateur.courriel);
                if (!courrielUnique) {
                    return reject({
                        message: "Le courriel est déjà utilisé par un autre utilisateur.",
                        code: 400
                    });
                }

                // Hasher le mot de passe avec BCrypt
                const hashedPassword = await bcrypt.hash(nouvelUtilisateur.mot_de_passe, 10);
                nouvelUtilisateur.mot_de_passe = hashedPassword;

                // Générer une nouvelle clé API unique
                nouvelUtilisateur.cle_api = genererCleApiUnique();

                // Insérer le nouvel utilisateur dans la base de données
                const requeteInsertion = 'INSERT INTO utilisateurs SET ?';
                sql.query(requeteInsertion, nouvelUtilisateur, (erreur, resultat) => {
                    if (erreur) {
                        console.error(`Erreur sqlState ${erreur.sqlState} : ${erreur.sqlMessage}`);
                        reject({
                            message: "Erreur lors de la création de l'utilisateur.",
                            code: 500
                        });
                    } else {
                        resolve({
                            message: "L'utilisateur a été créé",
                            cle_api: nouvelUtilisateur.cle_api
                        });
                    }
                });
            } catch (erreur) {
                console.error(`Erreur synchrone: ${erreur}`);
                reject({
                    message: "Erreur lors de la validation de l'utilisateur.",
                    code: 500
                });
            }
        }).catch((erreur) => {
            console.error(`Erreur asynchrone: ${erreur}`);
            throw erreur;
        });
    }

    static validationCourrielUnique(courriel) {
        return new Promise((resolve, reject) => {
            const requete = 'SELECT COUNT(*) AS nbUsager FROM utilisateurs WHERE courriel = ?;';
            const parametres = [courriel];

            sql.query(requete, parametres, (erreur, resultat) => {
                if (erreur) {
                    console.error(`Erreur sqlState ${erreur.sqlState} : ${erreur.sqlMessage}`);
                    reject(erreur);
                } else {
                    resolve(resultat[0].nbUsager === 0);
                }
            });
        });
    }

    static validationCle(cleApi) {
        return new Promise((resolve, reject) => {
            const requete = 'SELECT COUNT(*) AS nbUsager FROM utilisateurs u WHERE cle_api = ?; ';
            const parametres = [cleApi];

            sql.query(requete, parametres, (erreur, resultat) => {
                if (erreur) {
                    console.log(`Erreur sqlState ${erreur.sqlState} : ${erreur.sqlMessage}`);
                    reject(erreur);
                }
                resolve(resultat[0].nbUsager > 0);
            });
        });
    }

    static recuperationCleApi(courriel, mot_de_passe, nouvelle) {
        return new Promise(async (resolve, reject) => {
            try {
                // Valider que le courriel et le mot de passe correspondent
                const utilisateur = await Utilisateur.validerUtilisateur(courriel, mot_de_passe);
                if (!utilisateur) {
                    return reject({
                        message: "Les informations d'identification ne sont pas valides.",
                        code: 401
                    });
                }

                let cleApi;

                // Générer une nouvelle clé API si nécessaire
                if (nouvelle && nouvelle === '1') {
                    cleApi = genererCleApiUnique();
                    
                    const updateRequete = 'UPDATE utilisateurs SET cle_api = ? WHERE id = ?';
                    const updateParametres = [cleApi, utilisateur.id];

                    sql.query(updateRequete, updateParametres, (updateErreur, updateResultat) => {
                        if (updateErreur) {
                            console.error(`Erreur sqlState ${updateErreur.sqlState} : ${updateErreur.sqlMessage}`);
                            reject({
                                message: "Erreur lors de la mise à jour de la clé API.",
                                code: 500
                            });
                        }
                    });
                } else {
                    cleApi = utilisateur.cle_api;
                }

                resolve({
                    cle_api: cleApi
                });
            } catch (erreur) {
                reject({
                    message: "Erreur lors de la récupération de la clé API.",
                    code: 500
                });
            }
        });
    }

    static validerUtilisateur(courriel, mot_de_passe) {
        return new Promise((resolve, reject) => {
            const requete = 'SELECT * FROM utilisateurs WHERE courriel = ?';
            const parametres = [courriel];

            sql.query(requete, parametres, async (erreur, resultat) => {
                if (erreur) {
                    console.error(`Erreur sqlState ${erreur.sqlState} : ${erreur.sqlMessage}`);
                    reject(erreur);
                } else {
                    if (resultat.length === 0) {
                        resolve(null); // Aucun utilisateur trouvé
                    } else {
                        const utilisateur = resultat[0];
                        const motDePasseCorrect = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);

                        if (motDePasseCorrect) {
                            resolve(utilisateur);
                        } else {
                            resolve(null); // Mot de passe incorrect
                        }
                    }
                }
            });
        });
    }
}

function genererCleApiUnique() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

module.exports = Utilisateur;