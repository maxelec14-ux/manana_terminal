export default async function handler(req, res) {
  const API_KEY = '1996fa1ffdf0410195fd5b86af739300';
  const headers = { 'X-Auth-Token': API_KEY };

  try {
    // Получаем матчи на неделю (с запасом)
    const matchesRes = await fetch('https://api.football-data.org/v4/matches', { headers });
    const matchesData = await matchesRes.json();
    
    const leagueCodes = ['PL', 'PD', 'BL1', 'SA', 'FL1', 'PPL', 'DED', 'ELC', 'BSA', 'CL', 'EC', 'WC'];
    const standingsMap = {};

    for (const code of leagueCodes) {
      const sRes = await fetch(`https://api.football-data.org/v4/competitions/${code}/standings`, { headers });
      const sData = await sRes.json();
      if (sData.standings && sData.standings[0]) {
        sData.standings[0].table.forEach(row => {
          standingsMap[row.team.id] = {
            points: row.points,
            playedGames: row.playedGames,
            goalsFor: row.goalsFor,
            goalsAgainst: row.goalsAgainst,
            country: sData.area.name
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
