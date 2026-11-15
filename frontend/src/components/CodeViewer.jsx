export default function CodeViewer({ lines, language = 'javascript' }) {
  return (
    <div className="code-viewer">
      <div className="code-gutter" aria-hidden="true">
        {lines.map((_, index) => <span key={index}>{index + 1}</span>)}
      </div>
      <pre className={`code-content language-${language}`}><code>{lines.map((line, index) => <span className="code-line" key={index}>{highlightCode(line)}{' '}</span>)}</code></pre>
    </div>
  );
}

function highlightCode(line) {
  const pattern = /(\/\/.*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b(?:import|from|export|async|function|const|await|return|try|catch|new|throw|if)\b|\b(?:true|false|null|undefined)\b|\b\d+\b)/g;
  return line.split(pattern).filter((part) => part !== '').map((part, index) => {
    let tokenClass = '';
    if (/^(\/\/)/.test(part)) tokenClass = 'token-comment';
    else if (/^["'`]/.test(part)) tokenClass = 'token-string';
    else if (/^(import|from|export|async|function|const|await|return|try|catch|new|throw|if)$/.test(part)) tokenClass = 'token-keyword';
    else if (/^(true|false|null|undefined)$/.test(part)) tokenClass = 'token-literal';
    else if (/^\d+$/.test(part)) tokenClass = 'token-number';
    return tokenClass ? <span className={tokenClass} key={index}>{part}</span> : part;
  });
}
