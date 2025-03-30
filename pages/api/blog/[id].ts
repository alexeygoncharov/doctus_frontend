import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/blog/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ message: 'Post not found' });
      }
      throw new Error(`Error fetching blog post: ${response.statusText}`);
    }

    const post = await response.json();
    return res.status(200).json(post);
  } catch (error) {
    console.error(`Error in /api/blog/${id}:`, error);
    return res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
} 