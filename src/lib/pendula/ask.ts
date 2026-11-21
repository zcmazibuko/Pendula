import { createServerFn } from "@tanstack/react-start";

export const askPendula = createServerFn({ method: "POST" })
  .validator((input: { question: string; facts: string }) => {
    const question = input?.question?.trim() ?? "";
    const facts = input?.facts?.trim() ?? "";
    if (question.length < 3 || question.length > 800) throw new Error("Ask a shorter question");
    if (facts.length > 12000) throw new Error("The facts packet is too large");
    return { question, facts };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Pendula Intelligence is offline in this environment. The built-in answers still work." };
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 420,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are Pendula Intelligence, an educational assistant for a South African school programme. Use ONLY the JSON facts. Never invent statistics, names or diagnoses. Do not infer laziness, family failure or a learning disorder. Points are virtual rewards, not money. If the facts do not answer the question, say what is missing. Write in plain South African English, in under 160 words.",
          },
          {
            role: "user",
            content: `Facts:\n${data.facts}\n\nQuestion:\n${data.question}`,
          },
        ],
      }),
    });
    if (!res.ok) return { ok: false as const, error: `The assistant could not answer just now (${res.status}). Use the grounded answers instead.` };
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content?.trim();
    if (!text) return { ok: false as const, error: "The assistant returned an empty answer." };
    return { ok: true as const, text };
  });
