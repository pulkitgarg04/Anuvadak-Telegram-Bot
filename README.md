# Anuvadak - AI-based Translation Telegram Bot

Anuvadak is a Telegram bot designed to provide seamless, real-time language translation. Powered by AI, Anuvadak can translate text into multiple languages and can be easily integrated into Telegram to help users communicate across language barriers.

## Features

- **Real-time translation** - Translate messages instantly in your chat.
- **Multiple languages** - Supports translation between a wide range of languages.
- **User-friendly** - Simple commands to get quick translations directly on Telegram.

## Getting Started

Follow these instructions to set up and run Anuvadak on your local machine.

### Prerequisites

- **Node.js** - Download and install [Node.js](https://nodejs.org/).
- **Telegram Bot Token** - Create a bot using [BotFather](https://core.telegram.org/bots#botfather) on Telegram and obtain your unique bot token.
- **Translation API** - Sign up for an AI-based translation API (like Gemini) and get an API key.

### Installation

1. **Clone the Repository**

    ```bash
    git clone https://github.com/pulkitgarg04/anuvadak-telegram-bot.git
    cd anuvadak-telegram-bot
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Environment Setup**

    Create a `.env` file in the root of your project and add the following:

    ```plaintext
    API_KEY = # Your Google API Key
    BOT_TOKEN = # Your Telegram Bot Token
    PORT = # Port number
    NODE_ENV = production
    ```

4. **Run the Bot**

    ```bash
    node index.js
    ```

    The bot should now be up and running!