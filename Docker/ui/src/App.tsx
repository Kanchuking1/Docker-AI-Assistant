import React from 'react';
import Button from '@mui/material/Button';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Stack, TextField, Typography, Container, Paper } from '@mui/material';

const CHAT_ENDPOINT = "/chat";

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

export function App() {
  const [query, setQuery] = React.useState<string>();
  const [response, setResponse] = React.useState<string>();
  const ddClient = useDockerDesktopClient();

  const fetchAndDisplayResponse = async () => {
    try {
      const result = await ddClient.extension.vm?.service?.post(CHAT_ENDPOINT, {
        message: query
      });
      console.log(result);
      setResponse(JSON.stringify(result));
    } catch (error) {
      console.log(error);
    }
  }

  return (<Container sx={{
    bgcolor: 'secondary',
    height: '100vh'
  }}> 
        <Typography variant="h3" alignContent={"center"}>Docker AI Assistant</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Here is your complete AI Assistant
        </Typography>
        <Stack direction="row" alignItems="start" spacing={2} sx={{ mt: 4 }}>
          <TextField
            label="Enter your docker query"
            multiline
            fullWidth
            variant="outlined"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setQuery(event.target.value);
            }}
            value={query ?? ''}
          />
          <Button variant="contained" onClick={fetchAndDisplayResponse}>
            Generate
          </Button>
        </Stack>
        <Paper elevation={2} sx={{my: 2}}>
          <Typography sx={{ p : 3}} variant="body2">
            {response ?? ' '}
          </Typography>
        </Paper>
  </Container>
  );
}
