import { MongoClient } from 'mongodb';

const url = process.env.MG_URIs;  // Replace this with your MongoDB connection string
const dbName = 'cvconnect';

export default async function handler(req, res) {
  const { username } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET requests allowed' });
  }

  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('users');

    // Querying MongoDB by the `username`
    const user = await collection.findOne({ usr_username: username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send the user data as JSON response
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data' });
  } finally {
    client.close();
  }
}
