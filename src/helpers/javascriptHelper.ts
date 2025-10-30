
const usedScripts: string[] = [];

export function addScript(linkUrl: string) {
  if (!linkUrl) { return; }
  if (usedScripts.find(p => p == linkUrl) != null) { return; }
  usedScripts.push(linkUrl);

  const script = document.createElement('script');

  document.head.appendChild(script);
  script.src = linkUrl;
}
