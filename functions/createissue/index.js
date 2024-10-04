const { getInstallationToken } = require("./github-access");
const { createIssue } = require("./issue-templates");

exports.handler = async function (event, context) {
  const { type, data } = JSON.parse(event.body); // Récupérer le type et les données associées

  try {
    const installationId = process.env.GITHUB_INSTALLATION_ID;
    const token = await getInstallationToken(installationId);

    const supportedTypes = ["Chain", "Asset", "Site"];
    if (!supportedTypes.includes(type)) {
      return { statusCode: 400, body: JSON.stringify({ message: "Type d'issue non reconnu" }) };
    }

    const result = await createIssue(token, type, data.name, {
      description: data.description,
      type: data.type, // Chaîne ou Actif
      documentation: data.documentation, // Optionnel pour Chaîne ou Actif
      url: data.url, // Optionnel pour Site
      category: data.category, // Optionnel pour Site
    });

    return result;
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: "Erreur interne", error: error.message }) };
  }
};
