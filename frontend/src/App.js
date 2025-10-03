import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <nav style={{ padding: '1rem', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
          <h1>KQ - Kings & Queens</h1>
        </nav>
        <main style={{ padding: '1rem' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div>
      <h2>Welcome to KQ - Your Promotion Engine</h2>
      <p>Build targeted promotions, loyalty programs, and more. Navigate to <a href="/dashboard">Dashboard</a> or <a href="/login">Login</a>.</p>
    </div>
  );
}

function Login() {
  return (
    <div>
      <h2>Login Page</h2>
      <p>Business login form coming soon.</p>
    </div>
  );
}

function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
      <p>Manage promotions, track loyalty points, and integrate with MoEngage.</p>
    </div>
  );
}

export default App;