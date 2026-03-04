export default async function handler(req, res) {
  const API_KEY = '1996fa1ffdf0410195fd5b86af739300';
  const headers = { 'X-Auth-Token': API_KEY };

  try {
    const matchesRes = await fetch('https://api.football-data.org/v4/matches', { headers });
    const matchesData = await matchesRes.json();
    const leagueCodes = [...new Set(matchesData.matches.map(m => m.competition.code))];
    
    const standingsMap = {};

    for (const code of leagueCodes.slice(0, 6)) { // Ограничение для скорости
      const sRes = await fetch(`https://api.football-data.org/v4/competitions/${code}/standings`, { headers });
      const sData = await sRes.json();
      
      if (sData.standings) {
        // Ищем в 'TOTAL', 'HOME' или 'AWAY' — где-нибудь форма точно должна быть
        const mainTable = sData.standings.find(s => s.type === 'TOTAL') || sData.standings[0];
        
        mainTable.table.forEach(row => {
          standingsMap[row.team.id] = {
            points: row.points,
            playedGames: row.playedGames,
            goalsFor: row.goalsFor,
            goalsAgainst: row.goalsAgainst,
            // Пробуем взять форму, если её нет — ставим пустую строку
            form: row.form || "" 
          };
        });
      }
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ matches: matchesData.matches, standings: standingsMap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
