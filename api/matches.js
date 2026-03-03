export default async function handler(req, res) {
  const API_KEY = '1996fa1ffdf0410195fd5b86af739300';
  const headers = { 'X-Auth-Token': API_KEY };

  try {
    // 1. Получаем все матчи на ближайшие 7 дней
    const matchesRes = await fetch('https://api.football-data.org/v4/matches', { headers });
    const matchesData = await matchesRes.json();

    // 2. Получаем таблицы топ-лиг (для PPM и голов)
    // Чтобы не превысить лимит 10 зап/мин, мы берем только те лиги, где есть матчи
    const leagueCodes = [...new Set(matchesData.matches.map(m => m.competition.code))];
    
    const standings = {};
    for (const code of leagueCodes.slice(0, 8)) { // Берем первые 8 активных лиг
      const sRes = await fetch(`https://api.football-data.org/v4/competitions/${code}/standings`, { headers });
      const sData = await sRes.json();
      if (sData.standings) {
        standings[code] = sData.standings[0].table;
      }
      // Небольшая задержка, чтобы Vercel не забанили
      await new Promise(r => setTimeout(r, 100));
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ 
      matches: matchesData.matches, 
      standings: standings 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
