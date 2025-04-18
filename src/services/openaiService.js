const openai = require('../config/openai');

class OpenAIService {
  async generateResponse(input) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: input
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Erro ao gerar resposta com OpenAI:', error);
      throw error;
    }
  }
}

module.exports = new OpenAIService(); 