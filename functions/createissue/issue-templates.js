const fetchData = async (token, element, body) => {
  const fetch = (await import("node-fetch")).default;
  const response = await fetch("https://api.github.com/repos/alexiscolin/wallet-security-lists/issues", {
    method: "POST",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: `[${element.type}-add]: ${element.name}`,
      body: body,
    }),
  });

  if (response.ok) {
    return { statusCode: 200, body: JSON.stringify({ message: "Issue created" }) };
  } else {
    const error = await response.json();
    return { statusCode: response.status, body: JSON.stringify({ message: "Error: issue not created", error }) };
  }
};

const createIssue = async (token, type, name, details) => {
  const templates = {
    Chain: `
        ### Chain Name
        ${name}
        
        ### Chain Description
        ${details.description}
        
        ### Chain Type
        ${details.type}
        
        ### Chain Official Documentation
        ${details.documentation}
      `,
    Asset: `
        ### Asset Name
        ${name}
        
        ### Asset Description
        ${details.description}
        
        ### Asset Type
        ${details.type}
        
        ### Official Documentation
        ${details.documentation}
      `,
    Site: `
        ### Site Name
        ${name}
        
        ### Site URL
        ${details.url}
        
        ### Site Description
        ${details.description}
        
        ### Site Category
        ${details.category}
      `,
  };

  const body = templates[type];
  return fetchData(token, { type, name }, body);
};

module.exports = {
  createIssue,
};
