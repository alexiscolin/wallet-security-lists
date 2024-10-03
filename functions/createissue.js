// Charger la clé privée de l'app GitHub depuis Netlify Environment Variables
const privateKey = process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, "\n");

// Générer un JWT pour s'authentifier auprès de l'API GitHub
const generateJWT = () => {
  const payload = {
    iat: Math.floor(Date.now() / 1000), // Temps actuel
    exp: Math.floor(Date.now() / 1000) + 600, // Expire dans 10 minutes
    iss: process.env.GITHUB_APP_ID, // ID de l'App GitHub (de Netlify Environment Variables)
  };

  // Utilisation de RS256 avec la clé RSA privée
  return require("jsonwebtoken").sign(payload, privateKey, { algorithm: "RS256" });
};

// Obtenir le token d'installation de l'App GitHub avec une importation dynamique
const getInstallationToken = async (installationId) => {
  const fetch = (await import("node-fetch")).default;

  const jwtToken = generateJWT();

  const response = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  const data = await response.json();
  return data.token; // Token d'installation
};

// Fonction principale pour créer une issue via l'API GitHub
exports.handler = async function (event, context) {
  const { title, body } = JSON.parse(event.body); // Récupérer le titre et le corps de l'issue

  try {
    // Obtenir le token d'installation pour ton App GitHub
    const installationId = process.env.GITHUB_INSTALLATION_ID; // ID de l'installation (de Netlify Environment Variables)
    const token = await getInstallationToken(installationId);

    // Créer une issue sur GitHub en utilisant le token d'installation
    const fetch = (await import("node-fetch")).default;
    const response = await fetch("https://api.github.com/repos/alexiscolin/wallet-security-lists/issues", {
      method: "POST",
      headers: {
        Authorization: `token ${token}`, // Utiliser le token d'installation
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        body: body,
      }),
    });

    if (response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Issue créée avec succès." }),
      };
    } else {
      const error = await response.json();
      return {
        statusCode: response.status,
        body: JSON.stringify({ message: "Erreur lors de la création de l'issue", error }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Erreur interne", error: error.message }),
    };
  }
};
