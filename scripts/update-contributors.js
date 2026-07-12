import fs from "fs";

async function updateContributors() {
  const owner = "arzoo0511";
  const repo = "ecoplay";

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contributors`
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const contributors = await response.json();

  const topThree = contributors.slice(0, 3);

  const content = `
${topThree
  .map(
    (user, index) =>
      `${["🥇", "🥈", "🥉"][index]} [${user.login}](${user.html_url}) - ${user.contributions} contributions`
  )
  .join("\n")}

_Last Updated: ${new Date().toLocaleDateString()}_
`;

  const readme = fs.readFileSync("README.md", "utf8");

  const updatedReadme = readme.replace(
    /<!-- TOP_CONTRIBUTORS_START -->[\s\S]*<!-- TOP_CONTRIBUTORS_END -->/,
    `<!-- TOP_CONTRIBUTORS_START -->\n${content}\n<!-- TOP_CONTRIBUTORS_END -->`
  );

  fs.writeFileSync("README.md", updatedReadme);

  console.log("README updated successfully!");
}

updateContributors().catch((error) => {
  console.error(error);
  process.exit(1);
});