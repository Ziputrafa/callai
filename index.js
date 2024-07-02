const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const Groq = require('groq-sdk');
const axios = require('axios');


const app = express();
app.use(express.json());
app.use(cors());

const groq = new Groq({
  apiKey: process.env.API_KEY,
});

const chat = [
  
];
console.log(chat);
app.post('/message', async (req, res) => {
  try {
    async function getGroqChatCompletion() {
      return groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'you are a my friend. And we are doing a call conversation. Response me and do not forget to ask a question too',
          },
          {
            role: 'user',
            content: req.body.data.message,
          },
        ],
        model: 'llama3-8b-8192',
      });
    }

    async function main() {
      const chatCompletion = await getGroqChatCompletion();
      //   const get = await getReport();

      req.body.data.isDone ? console.log('okey') : chat.push({ message: req.body.data.message, isMe: true });
      chat.push({ message: chatCompletion.choices[0]?.message?.content, isMe: false });

      //   console.log({ chat: chatCompletion.choices[0]?.message?.content });
      res.send({ chat: chatCompletion.choices[0]?.message?.content });
      console.log(req.body.data.message);
      //   console.log(req.body.data.message);
    }
    main();
  } catch (error) {
    console.log(req.body.data.message);
    chat.push({ message: 'sorry what did you say?', isMe: false });
    console.log('huh');

      //   console.log({ chat: chatCompletion.choices[0]?.message?.content });
      res.send( 'sorry what did you say?');
  }
});

app.get('/transcript', (req, res) => {
  res.send({ chat: chat });
});

app.post('/feedback', async (req, res) => {
  try {
    async function getGroqChatCompletion() {
      return groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are my English tutor. Please review the english transcription and identify any tense mistakes, explaining how to correct them. DO NOT JUDGE ANY PUNCTUATION MISTAKES, CAPITALIZATION MISTAKES, MARK and informal English PLEASE JUST SAY "GOOD JOB". Do not ask any follow-up questions. If there are no mistakes, simply say "Good job." We are focusing on conversational English, so do not provide feedback suitable for formal writing.',
          },
          {
            role: 'user',
            content: req.body.message,
          },
        ],
        model: 'llama3-70b-8192',
        temperature: 1,
        max_tokens: 7000,
        top_p: 1,
        stream: false,

        stop: null,
      });
    }
    async function getYoutubeKeywords(feedback) {
      return groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Provide 2 specific YouTube search keywords in the format "how to..." to learn grammar and tense mistakes based on this english feedback. Use this format: keyword | keyword. And just give me the result in format',
          },
          {
            role: 'user',
            content: feedback,
          },
        ],
        model: 'llama3-70b-8192',
        temperature: 1,
        max_tokens: 7000,
        top_p: 1,
        stream: false,

        stop: null,
      });
    }

    const youtubeSearch = async (keywords) => {
      const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
      const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

      const youtubeVideos = [];

      try {
        for (let index = 0; index < keywords.length; index++) {
          const response = await axios.get(YOUTUBE_API_URL, {
            params: {
              key: `${YOUTUBE_API_KEY}`,
              q: keywords[index],
              part: 'snippet',
              maxResults: 1,
              type: 'video',
            },
          });

          youtubeVideos.push({ id: response.data.items[0].id.videoId, title: response.data.items[0].snippet.title });
        }
      } catch (error) {
        console.error(error.message);
      }

      return youtubeVideos;
    };

    async function main() {
      const chatCompletion = await getGroqChatCompletion();

      const getKeywords = await getYoutubeKeywords(chatCompletion.choices[0]?.message?.content);
      const keywords = await getKeywords.choices[0]?.message?.content.split(' | ');

      const videos = await youtubeSearch(keywords);

      res.send({ feedbacks: chatCompletion.choices[0]?.message?.content, videos: videos });
      console.log(chatCompletion.choices[0]?.message?.content);
     
      
    }
    main();
  } catch (error) {
    console.log(error.message);
  }
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} again`);
});
