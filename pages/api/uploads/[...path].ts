import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
// Using built-in fetch, no need to import node-fetch

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the path from the request
  const { path } = req.query;
  
  if (!path || !Array.isArray(path)) {
    return res.status(400).json({ error: 'Invalid path' });
  }
  
  // Build the file path
  const filePath = path.join('/');
  
  // Get API URL from environment variables
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const fullUrl = `${apiUrl}/uploads/${filePath}`;
  
  try {
    // Forward the request to the backend
    const session = await getSession({ req });
    const headers: Record<string, string> = {};
    
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    
    const response = await fetch(fullUrl, { headers });
    
    if (!response.ok) {
      console.error(`Error fetching file: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ error: 'File not found' });
    }
    
    // Get content type from backend response
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    
    // Get file data as arrayBuffer and convert to Buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Set appropriate cache headers for better performance
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Return the file
    return res.send(buffer);
  } catch (error) {
    console.error('Error proxying file:', error);
    return res.status(500).json({ error: 'Error fetching file' });
  }
}