export default async function handler(req, res) {
  const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTjgaU9R0HkOYxMojb3CAQ0E0-wAaLMHejbEB1aPKG_xw-chZwJJBv9_inZUSVc2J_clRTXDASNLKlf/pub?gid=0&single=true&output=csv';
  try {
    const response = await fetch(url);
    const text = await response.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(text);
  } catch (err) {
    res.status(500).send('Error fetching sheet: ' + err.message);
  }
}
