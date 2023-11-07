import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HumanMessage, SystemMessage } from "langchain/schema";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import { HumanMessage } from "langchain/dist/schema";
dotenv.config();

const app = new express();

const chat = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  verbose: true,
  modelName: "gpt-3.5-turbo",
  streaming: true,
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const systemMessage = new SystemMessage(
  "You are DockerGPT, a helpful Docker Assistant AI. Your job is to provide concise answers to user's questions. If the answer is a code snippet, strictly reply with that unless asked to explain it as welld."
);
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  const text = new HumanMessage(message);
  const response = await chat.predictMessages([systemMessage, text]);
  res.json(response.text);
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const PORT = process.env.PORT || 3009;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
