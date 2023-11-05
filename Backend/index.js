import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  const response = await chat.predict(message);
  res.json(response);
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const PORT = process.env.PORT || 3008;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
