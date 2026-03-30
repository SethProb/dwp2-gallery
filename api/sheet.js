export default async function handler(req, res) {
  const sheetId = '1rJoNaO2I2anVkQmsuGnS6xMMkIcIF2K5NQ9iaH5W5NY';
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Google returned ' + response.status);
    const text = await response.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(text);
  } catch (err) {
    res.status(500).send('Error fetching sheet: ' + err.message);
  }
}
