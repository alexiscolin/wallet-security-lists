const fetch = require("node-fetch");

const privateKey = process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, "\n");

const generateJWT = () => {
  const payload = {
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 600,
    iss: process.env.GITHUB_APP_ID,
  };
  return require("jsonwebtoken").sign(payload, privateKey, { algorithm: "RS256" });
};

const getInstallationToken = async (installationId) => {
  const jwtToken = generateJWT();

  const response = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  const data = await response.json();
  return data.token;
};

module.exports = {
  getInstallationToken,
};
