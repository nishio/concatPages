function fetchAllPageData(projectName, title) {
  const url = `https://scrapbox.io/api/pages/${projectName}/${encodeURIComponent(
    title
  )}`;
  return fetch(url).then((res) => res.json());
}

function fetchPage({ projectName, title }) {
  const url = `https://scrapbox.io/api/pages/${projectName}/${encodeURIComponent(
    title
  )}/text`;
  return fetch(url).then(async (pageRes) => {
    if (pageRes.ok) {
      return "## " + (await pageRes.text());
    } else {
      return "";
    }
  });
}

function ensureDialogExists() {
  let dialog = document.getElementById("resultDialog");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "resultDialog";

    const textarea = document.createElement("textarea");
    textarea.id = "resultTextarea";
    textarea.style.width = "600px";
    textarea.style.height = "400px";
    dialog.appendChild(textarea);

    dialog.appendChild(document.createElement("br"));

    const closeBtn = document.createElement("button");
    closeBtn.id = "closeBtn";
    closeBtn.textContent = "閉じる";
    closeBtn.addEventListener("click", () => dialog.close());
    dialog.appendChild(closeBtn);

    document.body.appendChild(dialog);
  }
  return dialog;
}
const projectName = scrapbox.Project.name;
const data = await fetchAllPageData(projectName, scrapbox.Page.title);
links1hop = data.relatedPages.links1hop.map(({ title }) => ({
  projectName,
  title,
}));
links2hop = data.relatedPages.links1hop.map(({ title }) => ({
  projectName,
  title,
}));
projLinks = data.relatedPages.projectLinks1hop.map(
  ({ projectName, title }) => ({ projectName, title })
);
allLinks = links1hop.concat(links2hop).concat(projLinks);
result = (await Promise.all(allLinks.map(fetchPage))).join("\n\n");
const dialog = ensureDialogExists();
document.getElementById("resultTextarea").value = result;
dialog.showModal();
