export default async function handler(req, res) {
  const API_KEY = '1996fa1ffdf0410195fd5b86af739300';
  const headers = { 'X-Auth-Token': API_KEY };

  try {
    // 1. Получаем матчи
    const matchesRes = await fetch('https://api.football-data.org/v4/matches', { headers });
    const matchesData = await matchesRes.json();

    if (!matchesData.matches) throw new Error("No matches found");

    // 2. Получаем коды лиг, которые есть в списке матчей
    const leagueCodes = [...new Set(matchesData.matches.map(m => m.competition.code))];
    
    const standingsMap = {};

    // 3. Собираем таблицы для этих лиг
    // Лимит 10 запросов в минуту, поэтому берем только нужные лиги
    for (const code of leagueCodes.slice(0, 10)) {
      try {
        const sRes = await fetch(`https://api.football-data.org/v4/competitions/${code}/standings`, { headers });
        const sData = await sRes.json();
        if (sData.standings && sData.standings[0]) {
          standingsMap[code] = sData.standings[0].table;
        }
      } catch (e) { console.error(`Error loading league ${code}`); }
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ 
      matches: matchesData.matches, 
      standings: standingsMap 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
