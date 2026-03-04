export default async function handler(req, res) {
  const API_KEY = '1996fa1ffdf0410195fd5b86af739300';
  const headers = { 'X-Auth-Token': API_KEY };

  try {
    const matchesRes = await fetch('https://api.football-data.org/v4/matches', { headers });
    const matchesData = await matchesRes.json();

    const leagueCodes = [...new Set(matchesData.matches.map(m => m.competition.code))];
    const standingsMap = {};

    for (const code of leagueCodes.slice(0, 8)) {
      const sRes = await fetch(`https://api.football-data.org/v4/competitions/${code}/standings`, { headers });
      const sData = await sRes.json();
      
      if (sData.standings && sData.standings[0]) {
        // Обогащаем таблицу: если API не дал form, мы попробуем составить её позже или оставим как есть
        standingsMap[code] = sData.standings[0].table.map(team => ({
          id: team.team.id,
          name: team.team.shortName,
          points: team.points,
          playedGames: team.playedGames,
          goalsFor: team.goalsFor,
          goalsAgainst: team.goalsAgainst,
          form: team.form || "" // Берем то, что есть
        }));
      }
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ matches: matchesData.matches, standings: standingsMap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
