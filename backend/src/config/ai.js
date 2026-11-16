export const generateAIResponse = async (messages) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;

  if (!apiKey || !model) {
    throw new Error('OpenRouter API key or model is missing');
  }

  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-OpenRouter-Title': 'AI Codebase Doctor'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 1500
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || 'OpenRouter request failed'
    );
  }

  const answer = data.choices?.[0]?.message?.content;

  if (!answer) {
    throw new Error('AI returned an empty response');
  }

  return {
    answer,
    usage: data.usage || null,
    model: data.model || model
  };
};