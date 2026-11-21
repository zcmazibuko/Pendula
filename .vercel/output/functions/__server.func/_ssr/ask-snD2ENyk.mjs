import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ask-snD2ENyk.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var askPendula_createServerFn_handler = createServerRpc({
	id: "82c1adcaaad3a0d8d834f053bcd9d98a222c8afb4ec6d1ef8aa77b671e8f896e",
	name: "askPendula",
	filename: "src/lib/pendula/ask.ts"
}, (opts) => askPendula.__executeServer(opts));
var askPendula = createServerFn({ method: "POST" }).validator((input) => {
	const question = input?.question?.trim() ?? "";
	const facts = input?.facts?.trim() ?? "";
	if (question.length < 3 || question.length > 800) throw new Error("Ask a shorter question");
	if (facts.length > 12e3) throw new Error("The facts packet is too large");
	return {
		question,
		facts
	};
}).handler(askPendula_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "Pendula Intelligence is offline in this environment. The built-in answers still work."
	};
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			max_tokens: 420,
			temperature: .2,
			messages: [{
				role: "system",
				content: "You are Pendula Intelligence, an educational assistant for a South African school programme. Use ONLY the JSON facts. Never invent statistics, names or diagnoses. Do not infer laziness, family failure or a learning disorder. Points are virtual rewards, not money. If the facts do not answer the question, say what is missing. Write in plain South African English, in under 160 words."
			}, {
				role: "user",
				content: `Facts:\n${data.facts}\n\nQuestion:\n${data.question}`
			}]
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `The assistant could not answer just now (${res.status}). Use the grounded answers instead.`
	};
	const text = (await res.json()).choices?.[0]?.message?.content?.trim();
	if (!text) return {
		ok: false,
		error: "The assistant returned an empty answer."
	};
	return {
		ok: true,
		text
	};
});
//#endregion
export { askPendula_createServerFn_handler };
