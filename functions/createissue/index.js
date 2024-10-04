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

    const installationId = process.env.GITHUB_INSTALLATION_ID;
    const token = await getInstallationToken(installationId);

    const yamlContent = fetchYamlTemplate(`${type.toLowerCase()}-add.yaml`);
    const issueBody = convertYamlToMarkdown(yamlContent, data);

    console.log("GitHub Repo Issues Endpoint:", process.env.GITHUB_REPO_ISSUES_ENDPOINT);

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

    // Check if the response is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const json = await response.json();
      if (response.ok) {
        return {
          statusCode: 200,
          body: JSON.stringify({ message: "Issue created successfully" }),
        };
      } else {
        return {
          statusCode: response.status,
          body: JSON.stringify({ message: "Error creating issue", error: json }),
        };
      }
    } else {
      // If not JSON, retrieve the raw text to debug the error
      const text = await response.text();
      console.log("Response Text:", text); // Log the response for debugging
      return {
        statusCode: response.status,
        body: JSON.stringify({ message: "Error creating issue", error: text }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error", error: error.message }),
    };
  }
};
