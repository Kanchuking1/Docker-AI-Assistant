import React from 'react';
import Button from '@mui/material/Button';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Stack, TextField, Typography, Container, Paper, Box, LinearProgress } from '@mui/material';
import { MuiMarkdown } from 'mui-markdown';

const CHAT_ENDPOINT = "/chat";

const SAMPLE_REQUEST = "Can you write a DockerFile for a project using Postgres React and Express?";

const TEST_RESPONSE = "\"Sure! Here's an example Dockerfile for a project using Postgres, React, and Express:\n\nDockerfile\\n# Stage 1 - Build React app\\nFROM node:14 as react-build\\nWORKDIR /app\\nCOPY package*.json /app/\\nRUN npm install\\nCOPY . /app\\nRUN npm run build\\n\\n# Stage 2 - Build Express server\\nFROM node:14 as express-build\\nWORKDIR /app\\nCOPY package*.json /app/\\nRUN npm install\\nCOPY . /app\\n\\n# Stage 3 - Combine React app and Express server\\nFROM node:14\\nWORKDIR /app\\nCOPY --from=react-build /app/build /app/client/build\\nCOPY --from=express-build /app /app\\nCOPY .env.docker /app/.env\\nRUN npm run build\\n\\n# Environment variables\\nENV PORT=3000\\nENV DATABASE_URL=your_postgres_database_url\\n\\nEXPOSE $PORT\\n\\nCMD [ \\\"npm\\\", \\\"start\\\" ]\\n\n\nExplanation:\n1. In the first stage, we use a base image of node:14 to build the React app. We copy the package.json files, install the dependencies, and then copy the entire project directory into the working directory. Finally, we run the build command of the React app.\n2. In the second stage, we repeat the same steps as the first stage but for the Express server.\n3. In the final stage, we use the same node:14 base image. We copy the built React app from the first stage into the client/build directory of the working directory. We also copy the Express server files, a .env.docker file (you should create this file with your environment variables), and run the build command to install the server dependencies.\n4. We set environment variables: PORT for the server port and DATABASE_URL for your Postgres database URL.\n5. We expose the server port (change the exposed port number if necessary).\n6. Finally, we use the CMD command to start the server.\n\nMake sure to replace your_postgres_database_url and adjust the file paths and environment variables according to your project setup.\"";

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

export function App() {
  const [query, setQuery] = React.useState<string>();
  const [response, setResponse] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const ddClient = useDockerDesktopClient();

  const fetchAndDisplayResponse = async () => {
    try {
      setIsLoading(true);
      const result = await ddClient.extension.vm?.service?.post(CHAT_ENDPOINT, {
        message: query
      });
      setResponse(result as string);
      setIsLoading(false);
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
          <Button variant="contained" onClick={fetchAndDisplayResponse} disabled={isLoading}>
            Generate
          </Button>
        </Stack>
        <Paper elevation={2} sx={{my: 2}}>
          {isLoading ? 
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>: <Box sx={{ p : 2 }}>
            <MuiMarkdown>
              {response ?? ' '}
            </MuiMarkdown>
          </Box>}
        </Paper>
  </Container>
  );
}
