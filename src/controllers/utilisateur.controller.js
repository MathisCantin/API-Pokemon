const Utilisateur = require("../models/utilisateur.model");

exports.creerUtilisateur = (req, res) => {
    const { nom, courriel, mot_de_passe } = req.body;

    // Vérifier la présence des champs nécessaires
    if (!nom || !courriel || !mot_de_passe) {
        return res.status(400).json({ message: "Veuillez fournir tous les champs nécessaires." });
    }

    const nouvelUtilisateur = {
        nom: nom,
        courriel: courriel,
        mot_de_passe: mot_de_passe
    };

    Utilisateur.creerUtilisateur(nouvelUtilisateur)
        .then(resultat => {
            res.status(201).json(resultat);
        })
        .catch(erreur => {
            res.status(erreur.code || 500).json({ message: erreur.message });
        });
};

exports.recuperationCleApi = (req, res) => {
    const courriel = req.body.courriel;
    const mot_de_passe = req.body.mot_de_passe;
    const nouvelle = req.query.nouvelle;

    // Vérifier la présence des champs nécessaires
    if (!courriel || !mot_de_passe) {
        return res.status(400).json({ message: "Veuillez fournir le courriel et le mot de passe." });
    }

    Utilisateur.recuperationCleApi(courriel, mot_de_passe, nouvelle)
        .then(resultat => {
            res.status(200).json(resultat);
        })
        .catch(erreur => {
            res.status(erreur.code || 500).json({ message: erreur.message });
        });
};