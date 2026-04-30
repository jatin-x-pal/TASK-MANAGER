import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div className="glass-panel" style={{ padding: '4rem 2rem', maxWidth: '800px', width: '100%' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Welcome to TaskFlow
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '2rem' }}>
          A collaborative task management system where teams organize, assign, and track progress effortlessly.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/login" className="btn">
            Login to Account
          </Link>
          <Link href="/register" className="btn btn-outline">
            Create an Account
          </Link>
        </div>
      </div>
    </main>
  );
}
