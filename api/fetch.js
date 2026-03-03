export default async function handler(req, res) {
    const { leagues } = req.query;
    const API_KEY = 'f3478125e1684304dae1ac720ced58fe'; // <--- Проверь ключ!

    try {
        const response = await fetch(`https://api.the-odds-api.com/v4/sports/${leagues}/odds/?apiKey=${API_KEY}&regions=eu,us&markets=totals,spreads&oddsFormat=decimal`);
        const data = await response.json();

        if (!Array.isArray(data)) return res.status(200).json([]);

        const signals = [];
        data.forEach(match => {
            const pinnacle = match.bookmakers.find(b => b.key === 'pinnacle');
            if (!pinnacle) return;

            match.bookmakers.forEach(bookie => {
                if (bookie.key === 'pinnacle') return;
                bookie.markets.forEach(market => {
                    const pinMarket = pinnacle.markets.find(m => m.key === market.key);
                    if (!pinMarket) return;

                    market.outcomes.forEach(outcome => {
                        const pinOutcome = pinMarket.outcomes.find(o => o.name === outcome.name && o.point === outcome.point);
                        if (pinOutcome) {
                            const gap = (outcome.price / pinOutcome.price - 1) * 100;
                            if (gap > 3) { // Только если выгода > 3%
                                signals.push({
                                    league: match.sport_title,
                                    match: `${match.home_team} v ${match.away_team}`,
                                    market: market.key === 'totals' ? 'Total' : 'Handicap',
                                    line: outcome.point,
                                    selection: outcome.name,
                                    best_odd: outcome.price,
                                    pin_odd: pinOutcome.price,
                                    bookie: bookie.title,
                                    gap: gap.toFixed(1)
                                });
                            }
                        }
                    });
                });
            });
        });

        res.status(200).json(signals.sort((a, b) => b.gap - a.gap));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
