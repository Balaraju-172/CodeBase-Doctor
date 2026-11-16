
import { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  PanelRightClose,
  User,
  Code2
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function RepositoryChat({
  owner,
  repo,
  repositoryName,
  selectedFile,
  selectedFileContent,
  onClose,
  width = 360
}) {
  // Stores current input question
  const [question, setQuestion] = useState('');

  // Stores conversation messages
  const [messages, setMessages] = useState([]);

  // Tracks API loading state
  const [isLoading, setIsLoading] = useState(false);

  // Stores API errors
  const [error, setError] = useState('');

  // Send question to backend
  async function handleSendMessage(event) {
    event.preventDefault();

    const currentQuestion = question.trim();

    if (!currentQuestion || isLoading) return;

    if (!owner || !repo) {
      setError('Repository information is missing.');
      return;
    }

    if (!selectedFile || !selectedFileContent) {
      setError('Please select a file before asking questions.');
      return;
    }

    // Keep previous conversation for follow-up questions
    const history = messages.map((message) => ({
      role: message.role,
      content: message.content
    }));

    // Immediately display user's question
    setMessages((current) => [
      ...current,
      {
        role: 'user',
        content: currentQuestion
      }
    ]);

    setQuestion('');
    setError('');
    setIsLoading(true);

    try {
      // Call backend chat API
      const response = await fetch(
        `${API_BASE_URL}/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            question: currentQuestion,
            selectedFile,
            fileContent: selectedFileContent,
            history
          })
        }
      );

      const result = await response.json();

      // Handle backend errors
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Unable to generate AI response'
        );
      }

      // Display AI answer
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: result.data.answer
        }
      ]);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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
          {selectedFile || 'No file selected'}
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
              Ask questions about your selected file,
              functions, APIs and dependencies.
            </p>

            <div className="chat-suggestions">
              {[
                'Explain this file',
                'Explain the functions in this file',
                'What does this code do?',
                'How can I improve this code?'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setQuestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
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
                  : <Bot size={15} />
                }
              </div>

              <div className="chat-message-content">
                <strong>
                  {message.role === 'user'
                    ? 'You'
                    : 'AI Assistant'}
                </strong>

                <p>{message.content}</p>
              </div>
            </div>
          ))
        )}

        {/* AI loading indicator */}
        {isLoading && (
          <div className="chat-message assistant">
            <div className="chat-message-icon">
              <Bot size={15} />
            </div>

            <div className="chat-message-content">
              <strong>AI Assistant</strong>
              <p>Analyzing your code...</p>
            </div>
          </div>
        )}

        {/* API error */}
        {error && (
          <p className="chat-error">
            {error}
          </p>
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
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            rows={2}
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>

        <span className="chat-input-hint">
          AI responses powered by OpenRouter.
        </span>
      </form>

    </aside>
  );
}
