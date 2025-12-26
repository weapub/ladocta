// Simple in-memory storage for reviews (Note: This will reset on Vercel function cold starts)
// To make this persistent, you would need a database like Vercel KV, Postgres, or MongoDB.
let reviews = [
  {
    id: 1,
    name: 'Juan Perez',
    message: '¡Excelente radio! La escucho todos los días desde el trabajo.',
    date: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Maria Garcia',
    message: 'Muy buena música y excelente programación.',
    date: new Date(Date.now() - 86400000).toISOString()
  }
];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    return res.status(200).json(reviews);
  }

  if (req.method === 'POST') {
    const { name, message } = req.body;
    
    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required' });
    }

    const newReview = {
      id: Date.now(),
      name,
      message,
      date: new Date().toISOString()
    };

    reviews.unshift(newReview); // Add to the beginning

    // Keep only last 50 reviews to prevent memory issues
    if (reviews.length > 50) {
      reviews = reviews.slice(0, 50);
    }

    return res.status(201).json(newReview);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
