export default async function handler(req, res) {
  const API_KEY = '1996fa1ffdf0410195fd5b86af739300';
  
  try {
    const response = await fetch('https://api.football-data.org/v4/matches', {
      headers: { 'X-Auth-Token': API_KEY }
    });
    
    const data = await response.json();
    
    // Добавляем заголовки, чтобы браузер не ругался
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
