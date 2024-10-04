const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

// Fonction pour récupérer le template YAML depuis la racine du dépôt
const readTemplateFiles = () => {
  try {
    const templateDir = path.join(__dirname, "..", "..", ".github", "ISSUE_TEMPLATE", templateFile);
    const files = fs.readdirSync(templateDir); // Lister les fichiers dans le répertoire
    return files.map((file) => path.join(templateDir, file)); // Retourner les chemins complets des fichiers
  } catch (error) {
    throw new Error(`Erreur lors de la lecture des fichiers de template: ${error.message}`);
  }
};

// Récupérer la liste des types d'issues dynamiquement à partir des fichiers YAML
const getSupportedTypes = () => {
  try {
    const files = readTemplateFiles(); // Lire les fichiers du répertoire des templates

    // Extraire le type (par exemple, 'chain-add.yaml' → 'Chain')
    const supportedTypes = files
      .map((filePath) => {
        const file = path.basename(filePath); // Obtenir le nom du fichier à partir du chemin complet
        const match = file.match(/(\w+)-add\.yaml/); // Extraire le nom avant '-add.yaml'
        return match ? match[1].charAt(0).toUpperCase() + match[1].slice(1) : null;
      })
      .filter(Boolean); // Supprimer les nulls

    return supportedTypes;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération des types dynamiques: ${error.message}`);
  }
};

// Fonction pour récupérer le template YAML depuis le système de fichiers local
const fetchYamlTemplate = (templateFile) => {
  try {
    const files = readTemplateFiles(); // Lire les fichiers du répertoire des templates

    // Trouver le fichier correspondant au template demandé
    const templatePath = files.find((filePath) => filePath.endsWith(templateFile));
    if (!templatePath) {
      throw new Error(`Template ${templateFile} non trouvé`);
    }

    const fileContent = fs.readFileSync(templatePath, "utf8"); // Lire le fichier YAML
    return fileContent;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération du template local: ${error.message}`);
  }
};

// Convertir le YAML en Markdown
const convertYamlToMarkdown = (yamlContent, formData) => {
  const parsedYaml = yaml.load(yamlContent); // Convertir le YAML en objet JavaScript
  let markdownContent = `### ${parsedYaml.name}\n\n${parsedYaml.description}\n\n`;

  parsedYaml.body.forEach((field) => {
    markdownContent += `### ${field.attributes.label}\n`;
    markdownContent += `${field.attributes.description}\n\n`;

    if (field.type === "input" || field.type === "textarea") {
      markdownContent += `${formData[field.id] || field.attributes.placeholder}\n\n`;
    } else if (field.type === "dropdown") {
      const selectedValue = formData[field.id];
      const defaultValue = field.attributes.options[0];
      const finalValue = field.attributes.options.includes(selectedValue) ? selectedValue : defaultValue;
      markdownContent += `${finalValue}\n\n`;
    }
  });

  return markdownContent;
};

// Exporter les fonctions
module.exports = {
  getSupportedTypes,
  fetchYamlTemplate,
  convertYamlToMarkdown,
};
