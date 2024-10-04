const { getInstallationToken } = require("./github-access");
const { fetchYamlTemplate, convertYamlToMarkdown, getSupportedTypes } = require("./issue-templates");

exports.handler = async function (event, context) {
  const { type, data } = JSON.parse(event.body); // Récupérer le type et les données associées

  try {
    const { type, data } = JSON.parse(event.body);

    const supportedTypes = getSupportedTypes();

    if (!supportedTypes.includes(type)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Type d'issue non reconnu" }),
      };
    }

    // Obtenir le token d'installation de l'application GitHub
    const installationId = process.env.GITHUB_INSTALLATION_ID;
    const token = await getInstallationToken(installationId);

    // Lire le template YAML correspondant depuis le système de fichiers local
    const yamlTemplateFile = `${type.toLowerCase()}-add.yaml`;
    const yamlContent = fetchYamlTemplate(yamlTemplateFile); // Récupérer le contenu YAML

    // Convertir le YAML en Markdown avec les données soumises par l'utilisateur
    const issueBody = convertYamlToMarkdown(yamlContent, data);

    // Créer une issue sur GitHub avec les données soumises et le template Markdown
    const response = await fetch("https://api.github.com/repos/allinbits/wallet-security-lists/issues", {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: `[${type}-add]: ${data.name}`, // Titre basé sur le type et le nom soumis
        body: issueBody, // Corps de l'issue en Markdown généré dynamiquement
      }),
    });

    // Vérifier la réponse de l'API GitHub
    if (response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Issue created successfully" }),
      };
    } else {
      const error = await response.json();
      return {
        statusCode: response.status,
        body: JSON.stringify({ message: "Error creating issue", error }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error", error: error.message }),
    };
  }
};
