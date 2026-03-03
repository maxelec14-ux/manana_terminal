export default async function handler(req, res) {
    const { leagues } = req.query;
    // ВСТАВЬ СВОЙ КЛЮЧ НИЖЕ В КАВЫЧКИ
    const API_KEY = 'f3478125e1684304dae1ac720ced58fe'; 

    try {
        const response = await fetch(`https://api.the-odds-api.com/v4/sports/${leagues}/odds/?apiKey=${API_KEY}&regions=eu&markets=totals,spreads&oddsFormat=decimal`);
        
        if (!response.ok) throw new Error('API Response Error');
        
        const data = await response.json();
        
        // Отправляем данные обратно в интерфейс
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
