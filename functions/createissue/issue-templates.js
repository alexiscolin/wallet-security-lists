const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const readTemplateFiles = () => {
  try {
    const templateDir = path.join(__dirname, "..", "..", ".github", "ISSUE_TEMPLATE");
    const files = fs.readdirSync(templateDir);
    return files.map((file) => path.join(templateDir, file));
  } catch (error) {
    throw new Error(`Error while reading template files: ${error.message}`);
  }
};

const getSupportedTypes = () => {
  try {
    const files = readTemplateFiles();

    const supportedTypes = files
      .map((filePath) => {
        const file = path.basename(filePath);
        const match = file.match(/(\w+)-add\.yaml/);
        return match ? match[1].charAt(0).toUpperCase() + match[1].slice(1) : null;
      })
      .filter(Boolean);

    return supportedTypes;
  } catch (error) {
    throw new Error(`Error while retrieving supported types: ${error.message}`);
  }
};

const fetchYamlTemplate = (templateFile) => {
  try {
    const files = readTemplateFiles();

    const templatePath = files.find((filePath) => filePath.endsWith(templateFile));
    if (!templatePath) {
      throw new Error(`Template ${templateFile} not found`);
    }

    const fileContent = fs.readFileSync(templatePath, "utf8");
    return fileContent;
  } catch (error) {
    throw new Error(`Error while retrieving the local template: ${error.message}`);
  }
};

const convertYamlToMarkdown = (yamlContent, formData) => {
  const parsedYaml = yaml.load(yamlContent);
  let markdownContent = "";

  parsedYaml.body.forEach((field) => {
    markdownContent += `### ${field.attributes.label}\n`;

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

module.exports = {
  getSupportedTypes,
  fetchYamlTemplate,
  convertYamlToMarkdown,
};
