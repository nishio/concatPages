function fetchAllPageData(projectName, title) {
  const url = `https://scrapbox.io/api/pages/${projectName}/${encodeURIComponent(
    title
  )}`;
  return fetch(url).then((res) => res.json());
}

async function fetchPage({ projectName, title }) {
  const url = `https://scrapbox.io/api/pages/${projectName}/${encodeURIComponent(
    title
  )}/text`;
  const pageRes = await fetch(url);
  if (pageRes.ok) {
    const text = await pageRes.text();
    return "## " + title + "\n" + text;
  } else {
    return "";
  }
}

function ensureDialogExists() {
  let dialog = document.getElementById("resultDialog");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "resultDialog";

    // チェックボックス
    const label1hop = document.createElement("label");
    const cb1hop = document.createElement("input");
    cb1hop.type = "checkbox";
    cb1hop.id = "cb1hop";
    cb1hop.checked = true;
    label1hop.appendChild(cb1hop);
    label1hop.appendChild(document.createTextNode("1hop"));
    dialog.appendChild(label1hop);
    dialog.appendChild(document.createTextNode(" "));

    const label2hop = document.createElement("label");
    const cb2hop = document.createElement("input");
    cb2hop.type = "checkbox";
    cb2hop.id = "cb2hop";
    cb2hop.checked = true;
    label2hop.appendChild(cb2hop);
    label2hop.appendChild(document.createTextNode("2hop"));
    dialog.appendChild(label2hop);
    dialog.appendChild(document.createTextNode(" "));

    const labelProj = document.createElement("label");
    const cbProj = document.createElement("input");
    cbProj.type = "checkbox";
    cbProj.id = "cbProj";
    cbProj.checked = true;
    labelProj.appendChild(cbProj);
    labelProj.appendChild(document.createTextNode("proj"));
    dialog.appendChild(labelProj);

    dialog.appendChild(document.createElement("br"));

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
const relatedPages = data.relatedPages || {};
const links1hop = relatedPages.links1hop.map(({ title }) => ({
  projectName,
  title,
}));
const links2hop = relatedPages.links2hop.map(({ title }) => ({
  projectName,
  title,
}));
const projLinks = data.relatedPages.projectLinks1hop.map(
  ({ projectName, title }) => ({
    projectName,
    title,
  })
);

// キャッシュオブジェクト: {"links1hop": {title: text, ...}, "links2hop": {...}, "projLinks": {...}}
const cache = {
  links1hop: {},
  links2hop: {},
  projLinks: {},
};

// 初回に全ページfetchしてキャッシュ
(async function init() {
  const dialog = ensureDialogExists();

  // 全てのlinksをfetch
  await Promise.all([
    ...links1hop.map(async (link) => {
      cache.links1hop[link.title] = await fetchPage(link);
    }),
    ...links2hop.map(async (link) => {
      cache.links2hop[link.title] = await fetchPage(link);
    }),
    ...projLinks.map(async (link) => {
      cache.projLinks[link.title] = await fetchPage(link);
    }),
  ]);

  // チェックボックスが変更されたら更新
  document
    .getElementById("cb1hop")
    .addEventListener("change", updateTextareaContent);
  document
    .getElementById("cb2hop")
    .addEventListener("change", updateTextareaContent);
  document
    .getElementById("cbProj")
    .addEventListener("change", updateTextareaContent);

  // 初回内容更新
  updateTextareaContent();
  dialog.showModal();
})();

function updateTextareaContent() {
  const cb1hop = document.getElementById("cb1hop").checked;
  const cb2hop = document.getElementById("cb2hop").checked;
  const cbProj = document.getElementById("cbProj").checked;

  const resultPages = [];
  if (cb1hop) {
    resultPages.push(...Object.values(cache.links1hop));
  }
  if (cb2hop) {
    resultPages.push(...Object.values(cache.links2hop));
  }
  if (cbProj) {
    resultPages.push(...Object.values(cache.projLinks));
  }

  document.getElementById("resultTextarea").value = resultPages.join("\n\n");
}
