const axios = require('axios');
require('dotenv').config();

// OpenAI API-avaimen lataaminen .env-tiedostosta
const apiKey = process.env.OPENAI_API_KEY;

// Funktio API-kutsun tekemiseen
async function sendPrompt(prompt) {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Palautetaan vastaus
    const message = response.data.choices[0].message.content;
    return message;
  } catch (error) {
    console.error('Virhe API-kutsussa:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Viedään funktio käytettäväksi muissa tiedostoissa
module.exports = { sendPrompt };
