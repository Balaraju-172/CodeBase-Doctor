import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CircleHelp, Clipboard, Github, Info, Link2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/UI';

const githubUrlPattern = /^https:\/\/github\.com\/[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9._-]+(?:\.git)?\/?$/i;

// Add useState and useEffect only if needed;
// for this API integration, existing useState is enough.

// Add this below imports:
const API_BASE_URL = 'http://localhost:3001';


export default function ConnectRepository() {
  const [url, setUrl] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  // Handle form submission and connect to backend API
  async function handleSubmit(event) {
        event.preventDefault();

        // Step 1: Validate GitHub URL format in frontend
        if (!githubUrlPattern.test(url.trim())) {
          setFeedback({
            type: 'error',
            text: 'Enter a valid GitHub repository URL.'
          });
          return;
        }
      
        try {
          // Step 2: Start loading
          setLoading(true);
          setFeedback(null);
        
          // Step 3: Send POST request to backend
          const response = await fetch(
            `${API_BASE_URL}/api/repositories/connect`,
            {
              method: 'POST',
            
              // Tell backend that request body contains JSON
              headers: {
                'Content-Type': 'application/json'
              },
            
              // Send GitHub repository URL
              body: JSON.stringify({
                repoUrl: url.trim()
              })
            }
          );
        
          // Step 4: Convert backend response into JSON
          const result = await response.json();
        
          // Step 5: Handle backend errors
          if (!response.ok || !result.success) {
            throw new Error(result.message || 'Repository connection failed');
          }
        
          // Step 6: Display successful backend response
          setFeedback({
            type: 'success',
            text: `Repository ${result.data.owner}/${result.data.repo} validated successfully!`
          });
          // Repository successfully verified
          // Navigate to Repository Explorer after successful verification
          navigate(
            `/repositories/${encodeURIComponent(result.data.owner)}/${encodeURIComponent(result.data.repo)}`
          );
        
          // Check actual response in browser console
          console.log('Backend response:', result);
        
        } catch (error) {
          // Handle network errors or backend errors
          setFeedback({
            type: 'error',
            text: error.message
          });
        } finally {
          // Stop loading whether request succeeds or fails
          setLoading(false);
        }
  }

  async function copyExample() {
    try {
      await navigator.clipboard.writeText('https://github.com/acme/your-project');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setFeedback({ type: 'error', text: 'Clipboard access is unavailable. You can copy the example URL manually.' });
    }
  }

  return (
    <div className="page-wrap connect-page">
      <PageHeader eyebrow="GET STARTED" title="Connect a repository" description="Bring a project into your workspace to start exploring its code." />
      <div className="connect-layout">
        <section className="panel connect-card">
          <div className="github-heading"><span className="github-icon"><Github size={24} /></span><div><h2>Connect with GitHub</h2><p>Paste a link to a public repository.</p></div></div>
          <form onSubmit={handleSubmit} noValidate>
            <label className="field-label" htmlFor="repository-url">GitHub repository URL</label>
            <div className={`url-input-wrap ${feedback?.type === 'error' ? 'input-error' : ''}`}><Link2 size={17} />
            / <input id="repository-url" type="url" placeholder="https://github.com/owner/repository" value={url} onChange={(event) => { setUrl(event.target.value); setFeedback(null); }} /><span className="input-prefix">HTTPS</span></div>
            <span className="field-hint">Only public repositories are supported in this demo.</span>
            {feedback && <div className={`form-feedback ${feedback.type}`} role="status">{feedback.type === 'error' ? <Info size={15} /> : <Check size={15} />}{feedback.text}</div>}
            {/* <button type="submit" className="button button-primary connect-submit">
                  <Github size={16} />
                  Check repository URL
                  <ArrowRight size={15} />
            </button> */}

            <button
                type="submit"
                className="button button-primary connect-submit"
                disabled={loading}
            >
                  <Github size={16} />
                  {loading ? 'Connecting...' : 'Connect repository'}
                  <ArrowRight size={15} />
            </button>
          </form>
          <div className="connect-divider"><span>WHAT HAPPENS NEXT?</span></div>
          <div className="next-steps">
            <div><span className="step-number">01</span><p><strong>Validate your link</strong><span>We check that the URL follows GitHub’s repository format.</span></p></div>
            <div><span className="step-number">02</span><p><strong>Explore sample code</strong><span>Continue into the workspace using realistic demo data.</span></p></div>
          </div>
          <p className="demo-note"><Info size={14} />No GitHub connection or repository data is accessed by this demo.</p>
        </section>

        <aside className="connect-aside">
          <div className="panel public-info">
            <span className="aside-icon"><ShieldCheck size={18} /></span>
            <h3>Public repositories</h3>
            <p>This frontend-only experience validates URL formatting. It does not read repository contents or connect to GitHub.</p>
            <div className="privacy-row"><LockKeyhole size={15} /><span>Your credentials are never requested</span></div>
          </div>
          <div className="panel copy-card">
            <div className="copy-card-title"><CircleHelp size={16} /><h3>Where do I find my URL?</h3></div>
            <ol>
              <li>Open the repository on GitHub.</li>
              <li>Copy the address from your browser bar.</li>
              <li>Paste it into the field on this page.</li>
            </ol>
            <div className="copy-example"><code>github.com/acme/your-project</code><button onClick={copyExample} aria-label="Copy example repository URL">{copied ? <Check size={14} /> : <Clipboard size={14} />}</button></div>
            <span className="copy-hint">{copied ? 'Example copied' : 'Example URL format'}</span>
          </div>
          <Link className="back-dashboard" to="/dashboard"><ArrowLeft size={14} />Back to dashboard</Link>
        </aside>
      </div>
    </div>
  );
}
