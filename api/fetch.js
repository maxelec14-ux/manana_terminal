const axios = require('axios');

module.exports = async (req, res) => {
    const { leagues } = req.query;
    const API_KEY = 'f3478125e1684304dae1ac720ced58fe'; // <--- Твой ключ сюда

    try {
        // 1. Запрос данных из API
        const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${leagues}/odds/`, {
            params: {
                apiKey: API_KEY,
                regions: 'eu,us', 
                markets: 'totals,spreads',
                oddsFormat: 'decimal'
            }
        });

        // 2. Поиск Валуя (сравнение с Pinnacle)
        const signals = [];
        response.data.forEach(match => {
            const pinnacle = match.bookmakers.find(b => b.key === 'pinnacle');
            if (!pinnacle) return;

            match.bookmakers.forEach(bookie => {
                if (bookie.key === 'pinnacle') return;

                bookie.markets.forEach(market => {
                    const pinMarket = pinnacle.markets.find(m => m.key === market.key);
                    if (!pinMarket) return;

                    market.outcomes.forEach(outcome => {
                        const pinOutcome = pinMarket.outcomes.find(o => 
                            o.name === outcome.name && o.point === outcome.point
                        );

                        if (pinOutcome) {
                            const gap = (outcome.price / pinOutcome.price - 1) * 100;
                            // Выводим только если валуй > 3%
                            if (gap > 3) {
                                signals.push({
                                    id: Math.random(),
                                    league: match.sport_title,
                                    match: `${match.home_team} v ${match.away_team}`,
                                    market: market.key === 'totals' ? 'Total' : 'Asian Hcp',
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
        res.status(500).json({ error: "API Error" });
    }
};
