const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const dotenv = require("dotenv");
dotenv.config();

const TelegramBot = require("node-telegram-bot-api");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const botToken = process.env.BOT_TOKEN;
const apiKey = process.env.API_KEY;

/* Using polling for local env and webhook for production */

let botOptions = {};
if (process.env.NODE_ENV === 'production') {
    botOptions = {
        webHook: {
            port: process.env.PORT
        }
    };
} else {
    botOptions = {
        polling: true
    };
}

const bot = new TelegramBot(botToken, botOptions);

if (process.env.NODE_ENV === 'production') {
  const url = process.env.RAILWAY_STATIC_URL || process.env.WEBHOOK_URL;
  const webhookUrl = `${url}/bot${botToken}`;
  bot.setWebHook(webhookUrl)
      .then(() => {
          console.log('Webhook set:', webhookUrl);
      })
      .catch((error) => {
          console.error('Failed to set webhook:', error);
      });
} else {
  bot.setWebHook('')
      .then(() => {
          console.log('Polling mode enabled');
      });
}

bot.on('error', (error) => {
  console.error('Bot error:', error);
});

bot.on('webhook_error', (error) => {
  console.error('Webhook error:', error);
});

app.use(express.json());

const languages = {
  Indian: {
    Assamese: "assamese",
    Hindi: "hindi",
    Punjabi: "punjabi",
    Tamil: "tamil",
    Telugu: "telugu",
    Marathi: "marathi",
    Bengali: "bengali",
    Urdu: "urdu",
    Malayalam: "malayalam",
    Marathi: "marathi",
    Kannada: "kannada",
    Gujarati: "gujarati",
    Odia: "odia",
    Sanskrit: "sanskrit",
    Maithili: "maithili",
    Konkani: "konkani",
    Nepali: "nepali",
  },
  Asian: {
    Chinese: "chinese",
    Japanese: "japanese",
    Korean: "korean",
    Malay: "malay",
    Thai: "thai",
    Vietnamese: "vietnamese",
    Indonesian: "indonesian",
    Filipino: "filipino",
    Burmese: "burmese",
    Lao: "lao",
    Khmer: "khmer",
  },
  American: {
    English: "english",
    Spanish: "spanish",
    Portuguese: "portuguese",
    French: "french",
    Haitian_Creole: "haitian_creole",
    Quechua: "quechua",
    Guarani: "guarani",
    Aymara: "aymara",
  },
  European: {
    French: "french",
    German: "german",
    Italian: "italian",
    Russian: "russian",
    Dutch: "dutch",
    Greek: "greek",
    Polish: "polish",
    Swedish: "swedish",
    Norwegian: "norwegian",
    Danish: "danish",
    Finnish: "finnish",
    Czech: "czech",
    Hungarian: "hungarian",
    Romanian: "romanian",
    Slovak: "slovak",
    Bulgarian: "bulgarian",
    Serbian: "serbian",
    Croatian: "croatian",
    Bosnian: "bosnian",
    Slovenian: "slovenian",
    Latvian: "latvian",
    Lithuanian: "lithuanian",
    Estonian: "estonian",
    Icelandic: "icelandic",
    Irish: "irish",
    Maltese: "maltese",
    Albanian: "albanian",
  },
  MiddleEastern: {
    Arabic: "arabic",
    Hebrew: "hebrew",
    Turkish: "turkish",
    Persian: "persian",
    Kurdish: "kurdish",
    Armenian: "armenian",
    Georgian: "georgian",
    Azerbaijani: "azerbaijani",
  },
  African: {
    Swahili: "swahili",
    Amharic: "amharic",
    Yoruba: "yoruba",
    Zulu: "zulu",
    Somali: "somali",
    Afrikaans: "afrikaans",
    Malagasy: "malagasy",
    Shona: "shona",
    Xhosa: "xhosa",
    Igbo: "igbo",
    Sesotho: "sesotho",
    Hausa: "hausa",
    Kinyarwanda: "kinyarwanda",
  },
  Oceanian: {
    Samoan: "samoan",
    Maori: "maori",
    Fijian: "fijian",
    Hawaiian: "hawaiian",
  },
};

let userLanguagePreferences = {};

app.post(`/bot${botToken}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const message = `Hello! I am Anuvadak - an AI-based language translation bot.
  Contact @pulkitgarg04 (GitHub: https://www.github.com/pulkitgarg04) for any issues.
    
  \nUse /help to see available commands.`
  bot.sendMessage(chatId, message);
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `Available Commands:
  - /start: Start the bot
  - /help: List all commands
  - /choose_language: Choose the language for translation
  - /translate: Translate text to the chosen language`;
  bot.sendMessage(chatId, helpMessage);
});

bot.onText(/\/choose_language/, (msg) => {
  const chatId = msg.chat.id;

  const regionButtons = [];
  const regionKeys = Object.keys(languages);
  for (let i = 0; i < regionKeys.length; i += 2) {
    regionButtons.push([
      { text: regionKeys[i], callback_data: `region_${regionKeys[i]}` },
      regionKeys[i + 1]
        ? { text: regionKeys[i + 1], callback_data: `region_${regionKeys[i + 1]}` }
        : null,
    ].filter(Boolean));
  }

  bot.sendMessage(chatId, "Please choose a language region:", {
    reply_markup: {
      inline_keyboard: regionButtons,
    },
  });
});

bot.on("callback_query", (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  if (data.startsWith("region_")) {
    const selectedRegion = data.split("_")[1];

    const languageButtons = [];
    const languageKeys = Object.keys(languages[selectedRegion]);
    for (let i = 0; i < languageKeys.length; i += 3) {
      languageButtons.push(
        languageKeys.slice(i, i + 3).map((lang) => ({
          text: lang,
          callback_data: `lang_${languages[selectedRegion][lang]}`,
        }))
      );
    }

    bot.sendMessage(chatId, `You selected ${selectedRegion}. Now, please choose a language:`, {
      reply_markup: {
        inline_keyboard: languageButtons,
      },
    });
  } else if (data.startsWith("lang_")) {
    const selectedLanguage = data.split("_")[1];

    userLanguagePreferences[chatId] = selectedLanguage;
    const formattedLanguage = selectedLanguage[0].toUpperCase() + selectedLanguage.slice(1);

    bot.sendMessage(
      chatId,
      `You have selected language ${formattedLanguage}. Use /translate to start translating your text.`
    );
  }

  bot.answerCallbackQuery(callbackQuery.id);
});

bot.onText(/\/translate/, (msg) => {
  const chatId = msg.chat.id;
  const selectedLanguage = userLanguagePreferences[chatId];

  if (selectedLanguage) {
    bot.sendMessage(
      chatId,
      `You have chosen to translate to language code ${selectedLanguage}. Please send me the text to translate.`
    );
  } else {
    bot.sendMessage(
      chatId,
      "You need to choose a language first! Use /choose_language."
    );
  }
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  if (!msg.text.startsWith("/") && userLanguagePreferences[chatId]) {
    const targetLang = userLanguagePreferences[chatId];

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = await genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });
      const result = await model.generateContent([
        `Translate the following text to ${targetLang} without additional comments: "${msg.text}"`,
      ]);

      bot.sendMessage(chatId, result.response.text());
    } catch (error) {
      console.error("Error:", error);
      bot.sendMessage(
        chatId,
        "Sorry, I encountered an error or I cannot translate this. Please try again later."
      );
    }
  }

  if (!msg.text.startsWith("/") && !userLanguagePreferences[chatId]) {
    bot.sendMessage(
      chatId,
      "You need to choose a language first! Use /choose_language."
    );
  }

  if (msg.text == "/") {
    bot.sendMessage(chatId, "Invalid command. Use /help to see available commands.");
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.get("*", (req, res) => {
  res.send("Hello World! This is Anuvadak - an AI-based language translation bot.");
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying another port...`);
      setTimeout(() => {
          server.close();
          server.listen(0, '0.0.0.0');
      }, 1000);
  } else {
      console.error('Server error:', err);
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
      console.log('Server closed');
      process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  if (err.code !== 'EADDRINUSE') {
      process.exit(1);
  }
});