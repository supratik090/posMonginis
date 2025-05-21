import React, { useState } from 'react';

const SimplePage = () => {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Welcome to My Simple React Page</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>Submit</button>
      </form>
      {submitted && <p style={styles.message}>Hello, {name}! 🎉</p>}
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    marginTop: '50px',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    color: '#333',
  },
  form: {
    marginTop: '20px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    width: '200px',
    marginRight: '10px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  message: {
    marginTop: '20px',
    color: 'green',
    fontWeight: 'bold',
  },
};

export default SimplePage;
