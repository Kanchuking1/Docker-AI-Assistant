import React, { createRef } from 'react';
import Button from '@mui/material/Button';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Stack, TextField, Typography, Container, Paper, Box, LinearProgress, ButtonGroup } from '@mui/material';
import { MuiMarkdown } from 'mui-markdown';

const CHAT_ENDPOINT = "/chat";

const TEST_QUERY = "Can you write a DockerFile for a project using Postgres React and Express?";

const TEST_RESPONSE = "Sure! Here's a Dockerfile that uses the latest images of Postgres and Express:\n\n```Dockerfile\n# Use the official Postgres image\nFROM postgres:latest\n\n# Set the environment variables for Postgres\nENV POSTGRES_USER postgres\nENV POSTGRES_PASSWORD password\n\n# Create a database\nENV POSTGRES_DB mydatabase\n\n# Copy the SQL script to initialize the database\nCOPY init.sql /docker-entrypoint-initdb.d/\n\n# Use the official Node.js image\nFROM node:latest\n\n# Set the working directory\nWORKDIR /app\n\n# Copy package.json and package-lock.json\nCOPY package*.json ./\n\n# Install project dependencies\nRUN npm install\n\n# Copy the application source code\nCOPY . .\n\n# Expose the port that the Express app runs on\nEXPOSE 3000\n\n# Start the Express app\nCMD [ \"npm\", \"start\" ]\n```\n\nNote: This Dockerfile assumes that you have a `init.sql` file in the same directory that contains the SQL script to initialize the database. Adjust the PostgreSQL credentials and database name as per your requirement.\n\nTo build and run the Docker image:\n\n1. Make sure you have Docker installed.\n2. Place the `Dockerfile` and `init.sql` in the same directory as your Express project.\n3. Open a terminal and navigate to the project directory.\n4. Run the following commands:\n\n```bash\n# Build the Docker image\ndocker build -t myapp .\n\n# Run the Docker container\ndocker run -p 3000:3000 myapp\n```\n\nReplace `myapp` with the desired name for your Docker image and container.";

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

const CodeSnippet = ({ children, ...props } : {
  children: {
    props : {
      children : string
    }
  }
}) => {
  const markdown = children.props.children;
  const codeLines = markdown.split('\n');

  const code = markdown.replaceAll('\n', '<br />');
  const component = <div dangerouslySetInnerHTML={{__html: code}}></div>;
  const actionButtons = createRef<HTMLDivElement>();
  const ddClient = useDockerDesktopClient();
  
  return <div 
  onMouseEnter={() => {
    if (actionButtons && actionButtons.current) actionButtons.current.style.display = 'block';
  }}
  onMouseLeave={() => {
    if (actionButtons && actionButtons.current) actionButtons.current.style.display = 'none';
  }}
  >
    <Paper {...props}
      sx={{
        p: 4,
        fontFamily: 'monospace',
        position: 'relative'
      }}
    >
      <ButtonGroup 
        ref={actionButtons}
        className='action-button-group'
        sx={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        display: 'none'
      }} variant="outlined" aria-label="outlined button group">
        <Button variant="contained" onClick={() => {
          try {
            navigator.clipboard.writeText(markdown);
            ddClient.desktopUI.toast.success("Code copied to clipboard");
          } catch (error) {
            ddClient.desktopUI.toast.error("Something went wrong");
          }
        }}>COPY</Button>
      </ButtonGroup>
      {codeLines.map(line => {
        const words = line.split(" ");
        if (words.length > 0 && words[0] == "docker") {
          return <Button 
          variant="text"
          sx={{
            fontFamily: "monospace",
            ":hover" : {
              bgcolor: "#1C262D"
            }
          }}
          onClick={async () => {
            try {
              const output = await ddClient.docker.cli.exec(words[1], words.slice(2, words.length));
              ddClient.desktopUI.toast.success(output);
            } catch (error) {
              ddClient.desktopUI.toast.error("Something went wrong");
            }
          }}
          >
            {line}
          </Button>
        }
        return <div>{line}<br /></div>;
      })}</Paper>
    </div>;
}

export function App() {
  const [query, setQuery] = React.useState<string>(TEST_QUERY);
  const [response, setResponse] = React.useState<string>(TEST_RESPONSE);
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
            <MuiMarkdown
              options={{
                overrides: {
                  pre : CodeSnippet
                }
              }}
            >
              {response ?? ' '}
            </MuiMarkdown>
          </Box>}
        </Paper>
  </Container>
  );
}
