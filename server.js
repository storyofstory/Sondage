// Import des modules nécessaires
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

// Initialisation de l'application Express
const app = express();

// Middleware pour analyser le JSON des requêtes
app.use(bodyParser.json());

// Servir les fichiers statiques (HTML, images, CSS) depuis le dossier 'public'
app.use(express.static('public'));

// Fichier pour stocker les résultats des votes
const RESULTS_FILE = 'results.json';
// Fichier pour gérer la question actuelle
const CURRENT_QUESTION_FILE = 'current_question.txt';

// Initialisation des résultats si le fichier n'existe pas
if (!fs.existsSync(RESULTS_FILE)) {
    fs.writeFileSync(RESULTS_FILE, JSON.stringify({
        question1: { verre_rouge: 0, verre_rose: 0 },
        question2: { rue_droite: 0, rue_gauche: 0 },
        question3: { bfm_tv: 0, mario_donkey: 0 }
    }, null, 2));
}

// API pour enregistrer un vote
app.post('/api/vote', (req, res) => {
    const { question, choice } = req.body;

    if (!question || !choice) {
        return res.status(400).send('Paramètres invalides.');
    }

    // Lire les résultats actuels
    const results = JSON.parse(fs.readFileSync(RESULTS_FILE));

    // Vérifier que la question et le choix sont valides
    if (results[`question${question}`] && results[`question${question}`][choice] !== undefined) {
        results[`question${question}`][choice] += 1;
        fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
        res.status(200).send('Vote enregistré.');
    } else {
        res.status(400).send('Question ou choix non valide.');
    }
});

// API pour consulter les résultats
app.get('/api/results', (req, res) => {
    const results = JSON.parse(fs.readFileSync(RESULTS_FILE));
    res.json(results);
});

// API pour obtenir la question active
app.get('/api/current_question', (req, res) => {
    const currentQuestion = fs.existsSync(CURRENT_QUESTION_FILE)
        ? fs.readFileSync(CURRENT_QUESTION_FILE, 'utf-8').trim()
        : '1'; // Par défaut, question 1
    res.json({ currentQuestion });
});

// Route principale qui redirige vers la bonne page de sondage
app.get('/', (req, res) => {
    // Recharger à chaque fois la question active
    const currentQuestion = fs.existsSync(CURRENT_QUESTION_FILE)
        ? fs.readFileSync(CURRENT_QUESTION_FILE, 'utf-8').trim()
        : '1'; // Par défaut, question 1

    res.redirect(`/sondage${currentQuestion}.html`);
});

// Lancer le serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
