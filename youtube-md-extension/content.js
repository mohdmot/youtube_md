// This should translate markdown code into html
function markdownToHTML(md) {

  const codeBlocks = [];

  // 0️⃣ Code blocks ``` ```
  md = md.replace(/```([\s\S]*?)```/g, (match, code) => {
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const html = `
      <pre style="background:#0d1117;color:#c9d1d9;padding:10px;border-radius:6px;overflow-x:auto;font-size:13px;"><code>${escaped}</code></pre>
    `;

    codeBlocks.push(html);
    return `%%CODEBLOCK_${codeBlocks.length - 1}%%`;
  });

  // 1️⃣ Images
  md = md.replace(/!\[\s*\]\(([^)]+)\)/gim, (m, url) => `
    <img src="${url}" style="max-width:100%;height:auto;display:block;margin:8px 0;border-radius:6px;" loading="lazy"/>
  `);

  // 2️⃣ Headings
  md = md.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
  md = md.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
  md = md.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  md = md.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  md = md.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  md = md.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // 3️⃣ Bold / Italic
  md = md.replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>');
  md = md.replace(/\*(.*?)\*/gim, '<i>$1</i>');

  // 4️⃣ Inline code
  md = md.replace(/`([^`]+)`/gim, '<code>$1</code>');

  // 5️⃣ Links
  md = md.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gim,
    '<a href="$2" target="_blank" style="color:#4ea1ff">$1</a>'
  );

  // 6️⃣ Lists
  md = md.replace(/^\s*[-*+] (.*)$/gim, '<li>$1</li>');
  md = md.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');

  // 7️⃣ Line breaks
  md = md.replace(/\n/g, '<br>');

  // 🔁 Restore code blocks
  md = md.replace(/%%CODEBLOCK_(\d+)%%/g, (_, i) => codeBlocks[i]);

  return md;
}





// This function edit the comment into html comment
function processComment(commentEl) {
  const textEl = commentEl.querySelector('#content-text');
  if (!textEl) return;

  // منع التكرار
  if (textEl.dataset.mdRendered) return;

  const rawText = textEl.textContent.trim();

  if (!rawText.startsWith('$youtube_md')) return;

  const markdown = rawText.replace('$youtube_md', '').trim();

  // 🧹 نفرغ التعليق
  textEl.textContent = '';

  // 🧱 نحول HTML إلى DOM حقيقي
  const container = document.createElement('div');
  container.style.padding = '8px';
  container.style.borderLeft = '4px solid #ff0000';
  container.style.background = '#111';
  container.style.color = '#fff';
  container.style.borderRadius = '6px';

  // نحول markdown → html string
  const htmlString = markdownToHTML(markdown);

  // نحول string → DOM nodes
  const temp = document.createElement('div');
  temp.innerHTML = htmlString;

  // ننقل العناصر واحدة واحدة (مهم!)
  while (temp.firstChild) {
    container.appendChild(temp.firstChild);
  }

  // نضيفه للتعليق
  textEl.appendChild(container);

  textEl.dataset.mdRendered = "true";
}





// check for new comments
const observer = new MutationObserver(() => {
  const comments = document.querySelectorAll('ytd-comment-thread-renderer');
  comments.forEach(processComment);
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
