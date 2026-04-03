export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, message } = req.body;
    console.log(`New contact message from ${name} (${email}): ${message}`);
    // In a real app, you might save this to a DB or send an email.
    // For now, we'll just return success.
    res.status(200).json({ success: true, message: "Mensaje recibido correctamente" });
  } else if (req.method === 'GET') {
    // Return empty array since reviews are removed
    res.status(200).json([]);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
