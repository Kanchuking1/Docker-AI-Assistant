import React, { createRef } from 'react';
import Button from '@mui/material/Button';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Stack, TextField, Typography, Container, Paper, Box, LinearProgress, ButtonGroup } from '@mui/material';
import { MuiMarkdown } from 'mui-markdown';

const CHAT_ENDPOINT = "/chat";

const TEST_QUERY = "How to pull a docker image for the latest version of postgres?";

const TEST_RESPONSE = "To pull the latest version of the PostgreSQL docker image, you can follow these steps:\n\n1. Open your terminal or command prompt.\n\n2. Use the `docker pull` command followed by the image name and tag to fetch the latest version of the PostgreSQL image. By default, the latest version is tagged as `latest`. However, it's recommended to specify a version explicitly to ensure compatibility and stability. For example, to pull the latest PostgreSQL version 13, run the following command:\n\n   ```\n   docker pull postgres:13\n   ```\n\n   This command will fetch the PostgreSQL version 13 image from Docker Hub.\n\n3. Docker will now download the latest PostgreSQL image specified. The command output will display the progress of the image download.\n\n4. After the download is complete, you can verify the pulled image by listing all Docker images using the `docker images` command:\n\n   ```\n   docker images\n   ```\n\n   The list will include the PostgreSQL image you just downloaded, along with its version and other details.\n\nNow you have successfully pulled the latest PostgreSQL docker image for version 13.";

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
      {codeLines.map((line, i) => {
        const words = line.split(" ");
        if (words.length > 0 && words[0] == "docker") {
          return <Button 
          key={i}
          variant="text"
          sx={{
            fontFamily: "monospace",
            fontWeight: 700,
            color: 'orange',
            ":hover" : {
              bgcolor: "#1C262D"
            }
          }}
          onClick={async () => {
            try {
              console.log(words[1], words.slice(2, words.length));
              const output = await ddClient.docker.cli.exec(words[1], words.slice(2, words.length));
              console.log(output.lines());
              ddClient.desktopUI.toast.success(output.lines().join("\n"));
            } catch (error) {
              console.error(error);
              ddClient.desktopUI.toast.error("Something went wrong");
            }
          }}
          >
            {line}
          </Button>
        }
        return <div key={i}>{line}<br /></div>;
      })}</Paper>
    </div>;
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
