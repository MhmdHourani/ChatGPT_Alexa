const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

app.post('/alexa', async (req, res) => {
  const message =
    req.body.request?.intent?.slots?.message?.value || 'احكي لي شيئًا';

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'OpenAI-Project': process.env.OPENAI_PROJECT_ID,
          'OpenAI-Organization': process.env.OPENAI_ORG_ID,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = response.data.choices[0].message.content;

    res.json({
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: reply,
        },
        shouldEndSession: false,
      },
    });
  } catch (error) {
    console.error('Error from OpenAI:', error?.response?.data || error.message);
    res.json({
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: 'حدث خطأ أثناء الاتصال بـ ChatGPT.',
        },
        shouldEndSession: true,
      },
    });
  }
});

app.get('/', (req, res) =>
  res.send('Alexa Skill + ChatGPT with Project-Based Key is working')
);
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
