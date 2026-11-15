import { useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, Check, Code2, Copy, FileCode2, MessageSquareText, MoreHorizontal, Plus, Sparkles, ThumbsDown, ThumbsUp, UserRound } from 'lucide-react';
import { PageHeader } from '../components/UI';

const suggestedQuestions = [
  'Explain the login flow',
  'Where is the database connected?',
  'Explain the API architecture',
  'Find related files for authentication',
];

const initialMessages = [
  { role: 'user', text: 'Can you explain how authentication works in this project?' },
  { role: 'assistant', text: 'Authentication is organized into three layers in this sample repository:', bullets: [
    { title: 'Routes', text: 'src/routes/auth.routes.js maps POST /login to the login controller.' },
    { title: 'Controller', text: 'src/controllers/auth.controller.js reads the request, calls the service, and sets a protected session cookie.' },
    { title: 'Service', text: 'src/services/auth.service.js validates credentials and creates the session tokens.' },
  ], ending: 'The entry point registers the auth routes under /api/auth. This is sample content for the UI demo, not a live repository analysis.', files: ['src/routes/auth.routes.js', 'src/controllers/auth.controller.js'] },
];

const mockAnswer = (question) => {
  const lower = question.toLowerCase();
  if (lower.includes('database') || lower.includes('connect')) return 'In the sample project, database setup lives in src/config/database.js. The entry point imports connectDatabase() and awaits it before starting the HTTP server. The connection string is read from the DATABASE_URL environment variable.';
  if (lower.includes('api') || lower.includes('architecture')) return 'The sample API follows a simple Express structure: src/index.js wires middleware and route modules, routes map endpoints to controllers, and controllers delegate business logic to services. Shared database configuration lives under src/config/.';
  if (lower.includes('auth') || lower.includes('login')) return 'Authentication flows from the auth routes to the login controller and then to AuthService. On success, the controller sets an httpOnly session cookie and returns an access token. These file references are part of the static demo dataset.';
  return 'This demo uses static sample responses rather than an AI model. The sample project separates its Express routes, controllers, services, and configuration so each part has a focused responsibility.';
};

export default function Chat() {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);

  function sendMessage(text = draft) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setMessages((current) => [...current, { role: 'user', text: trimmed }]);
    setDraft('');
    setSending(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, { role: 'assistant', text: mockAnswer(trimmed) }]);
      setSending(false);
    }, 500);
  }

  return (
    <div className="page-wrap chat-page">
      <PageHeader eyebrow="YOUR CODEBASE, IN CONTEXT" title="AI code chat" description="Ask questions about your repositories and get oriented faster." action={<button className="button button-secondary" onClick={() => setMessages([])}><Plus size={15} />New conversation</button>} />
      <div className="chat-layout">
        <section className="panel chat-main">
          <div className="chat-context-bar"><span className="repo-mark tiny">MA</span><span>Chatting with <strong>meridian-api</strong></span><span className="context-divider" /><span className="context-demo"><span />Sample context</span><button aria-label="Conversation options"><MoreHorizontal size={17} /></button></div>
          <div className="conversation">
            {messages.length === 0 ? <div className="conversation-empty"><span className="chat-empty-icon"><MessageSquareText size={22} /></span><h2>Start a new conversation</h2><p>Ask a question to explore the sample meridian-api project.</p></div> : messages.map((message, index) => <div className={`message-row ${message.role}`} key={`${index}-${message.text.slice(0, 12)}`}>
              <span className={`message-avatar ${message.role}`}>{message.role === 'assistant' ? <Sparkles size={15} /> : <UserRound size={15} />}</span>
              <div className="message-body">
                <div className="message-author">{message.role === 'assistant' ? 'Code Doctor' : 'You'}<time>{message.role === 'assistant' ? 'just now' : 'just now'}</time></div>
                <div className="message-bubble">
                  <p>{message.text}</p>
                  {message.bullets && <div className="answer-points">{message.bullets.map((bullet) => <p key={bullet.title}><strong>{bullet.title}</strong> — {bullet.text}</p>)}</div>}
                  {message.ending && <p>{message.ending}</p>}
                  {message.files && <div className="source-chips">{message.files.map((file) => <button key={file}><FileCode2 size={12} />{file}</button>)}</div>}
                </div>
                {message.role === 'assistant' && <div className="message-actions"><button title="Copy response"><Copy size={13} /></button><button title="Helpful"><ThumbsUp size={13} /></button><button title="Not helpful"><ThumbsDown size={13} /></button></div>}
              </div>
            </div>)}
            {sending && <div className="typing-indicator"><span className="message-avatar assistant"><Sparkles size={15} /></span><span>Preparing a sample response<span className="typing-dots">...</span></span></div>}
          </div>
          <div className="chat-composer">
            <textarea ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} placeholder="Ask a question about this codebase..." rows={2} aria-label="Your message" />
            <div className="composer-bottom"><span><Code2 size={13} />Answers use sample repository context</span><button className="send-button" onClick={() => sendMessage()} disabled={!draft.trim() || sending} aria-label="Send message"><ArrowUp size={16} /></button></div>
          </div>
          <div className="chat-disclaimer">Demo only — responses are canned examples and are not generated by an AI model.</div>
        </section>
        <aside className="chat-sidebar">
          <div className="panel suggestions-panel"><div className="suggestion-title"><Sparkles size={15} /><h3>Try asking</h3></div><p>Start with a question or choose a suggestion.</p>{suggestedQuestions.map((question) => <button className="suggestion-button" key={question} onClick={() => sendMessage(question)}>{question}<ArrowRight size={14} /></button>)}</div>
          <div className="panel context-panel"><div className="context-heading"><h3>Context</h3><button>Change</button></div><div className="context-repo"><span className="repo-mark tiny">MA</span><span><strong>meridian-api</strong><small>acme-labs / main</small></span></div><div className="context-stat"><span>Files in sample</span><strong>248</strong></div><div className="context-stat"><span>Language</span><strong>JavaScript</strong></div><div className="context-note"><FileCode2 size={14} /><span>Context shown is illustrative and isn't loaded from GitHub.</span></div></div>
        </aside>
      </div>
    </div>
  );
}
