import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the path from the request
  const { path } = req.query;
  
  if (!path || !Array.isArray(path)) {
    return res.status(400).json({ error: 'Invalid path' });
  }
  
  // Build the backend path
  const backendPath = path.join('/');
  
  // Append query string if it exists
  const queryString = req.url?.split('?')[1];
  const fullUrl = `${API_URL}/${backendPath}${queryString ? `?${queryString}` : ''}`;
  
  // Log request details for debugging
  console.log(`Proxying request to: ${fullUrl}`);
  console.log(`Request method: ${req.method}`);
  console.log(`Request headers: ${JSON.stringify(req.headers, null, 2)}`);
  
  try {
    // Get token from next-auth
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || 'your-fallback-secret-key-for-dev',
    });
    
    // Copy all headers
    const headers: Record<string, string> = {};
    
    // Remove host from headers to avoid conflicts
    Object.keys(req.headers).forEach(key => {
      if (key !== 'host' && typeof req.headers[key] === 'string') {
        headers[key] = req.headers[key] as string;
      }
    });
    
    // Add authorization header if token exists
    if (token?.access_token) {
      headers['Authorization'] = `Bearer ${token.access_token}`;
    }
    
    // Debug headers
    console.log('Proxy headers:', headers);
    
    // Forward the request with body if applicable
    let body: string | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
      if (req.body) {
        if (typeof req.body === 'string') {
          body = req.body;
        } else {
          body = JSON.stringify(req.body);
        }
      }
    }
    
    // Make the request to the backend
    const backendRes = await fetch(fullUrl, {
      method: req.method,
      headers,
      body,
    });
    
    // Handle API error responses
    if (!backendRes.ok) {
      console.error(`Backend API error: ${backendRes.status} ${backendRes.statusText}`);
      
      // Get error details if available
      let errorText = await backendRes.text();
      
      try {
        // Try to parse as JSON if possible
        const errorJson = JSON.parse(errorText);
        return res.status(backendRes.status).json(errorJson);
      } catch {
        // If not JSON, return as text
        return res.status(backendRes.status).send(errorText);
      }
    }
    
    // Forward the response content type
    const contentType = backendRes.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    
    // Get the response data
    if (contentType?.includes('application/json')) {
      const data = await backendRes.json();
      return res.status(backendRes.status).json(data);
    } else {
      const buffer = await backendRes.arrayBuffer();
      return res.status(backendRes.status).send(Buffer.from(buffer));
    }
  } catch (error) {
    console.error('Error proxying request:', error);
    return res.status(500).json({ 
      error: 'Error proxying request to backend',
      message: error instanceof Error ? error.message : 'Unknown error',
      path: backendPath
    });
  }
}