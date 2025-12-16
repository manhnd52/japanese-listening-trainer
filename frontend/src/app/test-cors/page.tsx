export default function TestCorsPage() {
  const testCors = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      alert(`✅ CORS works!\nStatus: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      alert(`❌ CORS failed!\nError: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Test CORS Connection</h1>
      <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}</p>
      
      <button 
        onClick={testCors}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Test CORS Connection
      </button>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>How to check:</h3>
        <ol>
          <li>Click the button above</li>
          <li>Open DevTools (F12) → Console tab</li>
          <li>If CORS works: you'll see success message</li>
          <li>If CORS fails: you'll see red CORS error in console</li>
        </ol>
      </div>
    </div>
  );
}
