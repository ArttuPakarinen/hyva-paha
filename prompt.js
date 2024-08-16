const fetch = require('node-fetch');

// Lähetettävä prompt
const prompt = {
  asia: "rakkaus on kaunis asia"
};

// Lähetetään POST-pyyntö backendiin
async function sendPrompt() {
  try {
    const response = await fetch('http://localhost:3000/luokitus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prompt)
    });

    // Vastauksen käsittely
    const data = await response.json();
    console.log('Palautettu JSON:', data);
  } catch (error) {
    console.error('Virhe pyynnössä:', error);
  }
}

// Kutsutaan funktiota
sendPrompt();