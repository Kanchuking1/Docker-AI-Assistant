# Docker-Copilot
A NLP powered extension for docker development, to assist with setting up docker containers and images.

## Using the extension

You can use `docker` to build, install and push your extension. Also, we provide an opinionated [Makefile](Makefile) that could be convenient for you. There isn't a strong preference of using one over the other, so just use the one you're most comfortable with.

To build the extension, use `make build-extension` **or**:

```shell
  cd Docker
  docker buildx build -t my/awesome-extension:latest . --load
  docker extension install my/awesome-extension:latest
```

## Asking any query

To ask a query just type it in the description bar, be as descriptive as possible. Then click generate and wait. (May take upto 5 minutes).
![image](https://drive.google.com/uc?export=view&id=18vxDKdKv2e9ku7zXBUhktl5wgz1w8Pr0)

## Copying a code snippet 

To copy a code snippet, hover over the snippet and click on the `copy` button that appears on the top right code of the code snippet, you will get notification if the text is copied or not.
![image](https://drive.google.com/uc?export=view&id=1B2DVqM69TA8qUYodkInTO5tLACFzhIc3)

## Running a Generated Docker Command

To Run a generated docker command from a code snippet, left click on the generated command, it  will start running in the background, and you will get a notification once it is done running.
![image](https://drive.google.com/uc?export=view&id=1Ng90AlEpVtrGj8Ox60bVjJj2JG6BIIT0)
