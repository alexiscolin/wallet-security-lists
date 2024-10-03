const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  // Récupérer les données du corps de la requête (par exemple, title et body)
  const { title, body } = JSON.parse(event.body);

  // Remplace par le token GitHub stocké en variable d'environnement dans Netlify
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  try {
    // Appel à l'API GitHub pour déclencher le workflow
    const response = await fetch("https://api.github.com/repos/alexiscolin/wallet-security-lists/actions/workflows/create-issue.yml/dispatches", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`, // Utilisation du token GitHub sécurisé
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: "main", // Branche à partir de laquelle exécuter le workflow
        inputs: {
          title: title, // Le titre de l'issue
          body: body, // Le corps de l'issue
        },
      }),
    });

    if (response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Le workflow a été déclenché avec succès." }),
      };
    } else {
      const error = await response.json();
      return {
        statusCode: response.status,
        body: JSON.stringify({ message: "Erreur lors du déclenchement du workflow", error }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Erreur interne", error: error.message }),
    };
  }
};
