const { getInstallationToken } = require("./github-access");
const { fetchYamlTemplate, convertYamlToMarkdown, getSupportedTypes } = require("./issue-templates");

exports.handler = async function (event, context) {
  const { type, data } = JSON.parse(event.body);

  try {
    const supportedTypes = getSupportedTypes();

    if (!supportedTypes.includes(type)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Issue type not recognized" }),
      };
    }

    const token = await getInstallationToken(process.env.GITHUB_INSTALLATION_ID);

    const yamlContent = fetchYamlTemplate(`${type.toLowerCase()}-add.yaml`);
    const issueBody = convertYamlToMarkdown(yamlContent, data);

    const response = await fetch(process.env.GITHUB_REPO_ISSUES_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: `[${type}-add]: ${data.name}`,
        body: issueBody,
      }),
    });

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
