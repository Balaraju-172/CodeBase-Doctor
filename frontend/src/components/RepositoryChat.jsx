
import { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  PanelRightClose,
  User,
  Code2
} from 'lucide-react';

export default function RepositoryChat({
   repositoryName,
  selectedFile,
  onClose,
  width = 360
}) {
  // Chat input
  const [question, setQuestion] = useState('');

  // Conversation messages
  const [messages, setMessages] = useState([]);

  // Handle sending a question
  function handleSendMessage(event) {
    event.preventDefault();

    if (!question.trim()) return;

    // Add user's message to conversation
    setMessages((current) => [
      ...current,
      {
        role: 'user',
        content: question.trim()
      }
    ]);

    setQuestion('');
  }

  return (
    <aside
            className="explainer-pane repository-chat"
            style={{
              width: `${width}px`,
              flex: `0 0 ${width}px`
            }}
        >

      {/* Chat header */}
      <div className="explainer-header">
        <div>
          <Sparkles size={15} />
          <span>AI CODE CHAT</span>
        </div>

        <button
          aria-label="Close chat panel"
          onClick={onClose}
        >
          <PanelRightClose size={15} />
        </button>
      </div>

      {/* Repository context */}
      <div className="chat-context">
        <div>
          <Code2 size={15} />
          <span>{repositoryName}</span>
        </div>

        <span>
          {selectedFile || 'Entire repository'}
        </span>
      </div>

      {/* Chat messages */}
      <div className="chat-messages">

        {messages.length === 0 ? (
          <div className="chat-welcome">
            <div className="chat-welcome-icon">
              <Bot size={24} />
            </div>

            <h3>Ask about your codebase</h3>

            <p>
              Ask questions about your repository,
              code flow, functions, APIs and dependencies.
            </p>

            <div className="chat-suggestions">
              <button
                onClick={() =>
                  setQuestion('Explain the project architecture')
                }
              >
                Explain project architecture
              </button>

              <button
                onClick={() =>
                  setQuestion('Explain the selected file')
                }
              >
                Explain selected file
              </button>

              <button
                onClick={() =>
                  setQuestion('How does the frontend communicate with the backend?')
                }
              >
                Explain frontend-backend flow
              </button>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${message.role}`}
            >
              <div className="chat-message-icon">
                {message.role === 'user'
                  ? <User size={15} />
                  : <Bot size={15} />}
              </div>

              <div className="chat-message-content">
                <strong>
                  {message.role === 'user' ? 'You' : 'AI Assistant'}
                </strong>

                <p>{message.content}</p>
              </div>
            </div>
          ))
        )}

      </div>

      {/* Chat input */}
      <form
        className="chat-input-container"
        onSubmit={handleSendMessage}
      >
        {selectedFile && (
          <div className="chat-selected-file">
            <Code2 size={12} />
            <span>{selectedFile}</span>
          </div>
        )}

        <div className="chat-input-wrapper">
          <textarea
            placeholder="Ask anything about your code..."
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={2}
          />

          <button
            type="submit"
            disabled={!question.trim()}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>

        <span className="chat-input-hint">
          AI responses will be connected through the backend.
        </span>
      </form>

    </aside>
  );
}
