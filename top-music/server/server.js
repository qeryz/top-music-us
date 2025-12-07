import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

// Load environment variables
dotenv.config({ path: 'server/.env' });

const app = express();
const port = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
// Ensure .env uses http://127.0.0.1:5000/callback
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:5000/callback';
const google_maps_api_key = process.env.GOOGLE_MAPS_API_KEY;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Frontend URLs
    credentials: true // Allow cookies
}));
app.use(cookieParser());
app.use(express.json());

const generateRandomString = (length) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// Spotify Login
app.get('/login', (req, res) => {
  const state = generateRandomString(16);
  // Requested scopes: reading private playlists, creating playlists, reading top tracks
  const scope = 'user-read-private user-read-email playlist-read-private playlist-modify-public playlist-modify-private user-top-read';

  res.redirect('https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }).toString());
});

// Callback
app.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;

  if (state === null) {
    res.redirect('http://localhost:5173/?' +
      new URLSearchParams({
        error: 'state_mismatch'
      }).toString());
  } else {
    try {
      const authOptions = {
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: new URLSearchParams({
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        }).toString(),
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
      };

      const response = await axios(authOptions);
      
      const access_token = response.data.access_token;
      const refresh_token = response.data.refresh_token;

      // Set cookies
      // Note: 'secure: true' requires HTTPS. We use logic to only set it in production or if needed.
      // For localhost HTTP development, secure must be false.
      res.cookie('access_token', access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', 
          maxAge: 3600 * 1000 // 1 hour
      });

      res.cookie('refresh_token', refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 30 * 24 * 3600 * 1000 // 30 days
      });

      // Redirect to frontend (success state)
      res.redirect('http://127.0.0.1:5173/?login=success');

    } catch (error) {
        console.error('Error in callback:', error.response ? error.response.data : error.message);
        res.redirect('http://127.0.0.1:5173/?' +
          new URLSearchParams({
            error: 'invalid_token'
          }).toString());
    }
  }
});

app.get('/refresh_token', async (req, res) => {
  const refresh_token = req.cookies.refresh_token;

  if (!refresh_token) {
      return res.status(401).send('No refresh token found');
  }
  
  try {
      const authOptions = {
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refresh_token
        }).toString(),
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
        }
      };
      
      const response = await axios(authOptions);
      const access_token = response.data.access_token;
      
      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600 * 1000 
      });

      res.send({ status: 'refreshed' });
  } catch (error) {
      console.error('Error refreshing token:', error);
      res.status(500).send(error.message);
  }
});

// Google Maps Route Endpoint
app.post('/api/route', async (req, res) => {
    const { origin, destination } = req.body;
    
    if (!origin || !destination) {
        return res.status(400).send('Origin and destination are required');
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${google_maps_api_key}`;
        const response = await axios.get(url);
        
        if (response.data.status !== 'OK') {
             return res.status(400).json(response.data);
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching route:', error.message);
        res.status(500).send('Error fetching route');
    }
});

// Get User Playlists
app.get('/api/user-playlists', async (req, res) => {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
        return res.status(401).send('No access token provided');
    }

    try {
        const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                limit: 50
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching user playlists:', error.response ? error.response.data : error.message);
        res.status(500).send(error.response ? error.response.data : 'Error fetching playlists');
    }
});

// Generate Playlist Logic
app.post('/api/generate-playlist', async (req, res) => {
    const { duration_seconds, existing_playlist_id, seeds } = req.body;
    const access_token = req.cookies.access_token;

    if (!access_token || !duration_seconds) {
        return res.status(400).send('Access token and duration are required');
    }

    try {
        let tracks = [];
        let fetchedTracks = [];

        if (existing_playlist_id) {
            const response = await axios.get(`https://api.spotify.com/v1/playlists/${existing_playlist_id}/tracks`, {
                headers: { 'Authorization': `Bearer ${access_token}` },
                params: { limit: 100 }
            });
            fetchedTracks = response.data.items.map(item => item.track).filter(t => t && t.id);
        } else if (seeds) {
            const response = await axios.get('https://api.spotify.com/v1/recommendations', {
                headers: { 'Authorization': `Bearer ${access_token}` },
                params: { 
                    limit: 100,
                    seed_genres: seeds.genres, 
                    seed_artists: seeds.artists
                }
            });
            fetchedTracks = response.data.tracks;
        } else {
             const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
                headers: { 'Authorization': `Bearer ${access_token}` },
                params: { limit: 50, time_range: 'medium_term' }
            });
            fetchedTracks = response.data.items;
        }

        let currentDuration = 0;
        let selectedTracks = [];
        const requiredDurationMs = duration_seconds * 1000;

        fetchedTracks = fetchedTracks.sort(() => 0.5 - Math.random());

        for (const track of fetchedTracks) {
            if (currentDuration + track.duration_ms <= requiredDurationMs + 600000) { 
                 selectedTracks.push(track);
                 currentDuration += track.duration_ms;
            }
            if (currentDuration >= requiredDurationMs) break;
        }

        res.json({
            tracks: selectedTracks,
            total_duration_ms: currentDuration,
            trip_duration_ms: requiredDurationMs
        });

    } catch (error) {
        console.error('Error generating playlist:', error.response ? error.response.data : error.message);
        res.status(500).send(error.response ? error.response.data : 'Error generating playlist');
    }
});

// Create Playlist
app.post('/api/create-playlist', async (req, res) => {
    const { user_id, name, uris } = req.body;
    const access_token = req.cookies.access_token;

    if (!access_token || !uris) {
        return res.status(400).send('Missing parameters');
    }

    try {
        let userId = user_id;
        if (!userId) {
            const me = await axios.get('https://api.spotify.com/v1/me', {
                headers: { 'Authorization': `Bearer ${access_token}` }
            });
            userId = me.data.id;
        }

        const createResp = await axios.post(`https://api.spotify.com/v1/users/${userId}/playlists`, 
            { name: name || 'Road Trip Playlist', public: false },
            { headers: { 'Authorization': `Bearer ${access_token}` } }
        );
        
        const playlistId = createResp.data.id;

        await axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            { uris: uris },
            { headers: { 'Authorization': `Bearer ${access_token}` } }
        );

        res.json({ success: true, playlist_id: playlistId, external_url: createResp.data.external_urls.spotify });

    } catch (error) {
        console.error('Error creating playlist:', error.response ? error.response.data : error.message);
        res.status(500).send(error.response ? error.response.data : 'Error creating playlist');
    }
});


app.get('/', (req, res) => {
  res.send('Road Trip Playlist Server Running');
});

app.listen(port, () => {
  console.log(`Server is running on http://127.0.0.1:${port}`);
});
