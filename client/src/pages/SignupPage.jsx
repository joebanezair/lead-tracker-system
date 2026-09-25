import { useState } from 'react';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';

export default function SignupPage({ onSignup, onShowLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (password !== confirm) return alert('Passwords do not match');
    setBusy(true);
    try {
      await onSignup({ name, email, password });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={submit}>
        <h1>Create your account</h1>
        <p>Start managing and deduplicating your lead database.</p>
        <label><FiUser /> Name</label>
        <input required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
        <label><FiMail /> Email</label>
        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        <label><FiLock /> Password</label>
        <input required minLength="8" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 8 characters" />
        <label><FiLock /> Confirm Password</label>
        <input required minLength="8" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" />
        <button className="auth-primary" disabled={busy}>
          {busy ? 'Creating Account…' : 'Create Account'}
        </button>
        <p className="auth-switch">
          Already have an account? <button type="button" onClick={onShowLogin}>Sign In</button>
        </p>
      </form>
    </div>
  );
}
