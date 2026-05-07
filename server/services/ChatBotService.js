// const Groq = require("groq-sdk");
// const ChatBotRepository = require("../repositories/ChatbotRepository");

// class ChatBotService {
//     constructor() {
//         this.chatbotRepo = new ChatBotRepository();

//         this.groq = new Groq({
//             apiKey: process.env.GROQ_API_KEY
//         });
//     }

//     async buildSystemPrompt() {

//         const faqs = await this.chatbotRepo.getFAQs();

//         const faqText = faqs.length > 0
//             ? faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")
//             : "No FAQs available.";

//         return `
// You are an AI assistant for the Eventia event management platform.

// Below are known questions and answers from the system:

// ${faqText}

// Rules:
// - Always prioritize answers from the FAQ list.
// - If the question is not in the list, answer using general knowledge about the platform.
// - Keep answers short, clear, and helpful.
// `;
//     }

//     async askAI(userPrompt) {

//         const systemPrompt = await this.buildSystemPrompt();

//         const response = await this.groq.chat.completions.create({
//             model: "llama-3.3-70b-versatile",
//             messages: [
//                 {
//                     role: "system",
//                     content: systemPrompt
//                 },
//                 {
//                     role: "user",
//                     content: userPrompt
//                 }
//             ],
//             max_tokens: 500
//         });

//         return response.choices[0].message.content;
//     }
// }

// module.exports = ChatBotService;




const Groq = require("groq-sdk");
const ChatBotRepository = require("../repositories/ChatbotRepository");

class ChatBotService {

    constructor() {

        this.chatbotRepo = new ChatBotRepository();

        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
    }

    /**
     * ---------- GENERAL FAQ ----------
     */

    async buildSystemPrompt() {

        const faqs = await this.chatbotRepo.getFAQs();

        const faqText = faqs.length > 0
            ? faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")
            : "No FAQs available.";

        return `
You are an AI assistant for the Eventia event management platform.

Below are known questions and answers from the system:

${faqText}

Rules:
- Always prioritize answers from the FAQ list.
- If the question is not in the list, answer using general knowledge about the platform.
- Keep answers short, clear, and helpful.
`;
    }

    async askAI(userPrompt) {

        const systemPrompt = await this.buildSystemPrompt();

        const response = await this.groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            max_tokens: 500
        });

        return response.choices[0].message.content;
    }

    /**
     * ---------- EVENT FAQ ----------
     */

    async buildEventPrompt() {

        const faqs = await this.chatbotRepo.getEventFAQs();

        const faqText = faqs.length > 0
            ? faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")
            : "No event FAQs available.";

        return `
You are an AI assistant specialized in answering questions about EVENTS on the Eventia platform.

${faqText}

Rules:
- Answer using the event FAQs above.
- If the answer is not found, provide general guidance about events.
- Keep answers short and clear.
`;
    }

    async askEventAI(userPrompt) {

        const systemPrompt = await this.buildEventPrompt();

        const response = await this.groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            max_tokens: 500
        });

        return response.choices[0].message.content;
    }

    /**
     * ---------- VENUE FAQ ----------
     */

    async buildVenuePrompt() {

        const faqs = await this.chatbotRepo.getVenueFAQs();

        const faqText = faqs.length > 0
            ? faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")
            : "No venue FAQs available.";

        return `
You are an AI assistant specialized in answering questions about VENUES on the Eventia platform.

${faqText}

Rules:
- Answer using the venue FAQs above.
- If the answer is not found, provide general guidance about venues.
- Keep answers short and clear.
`;
    }

    async askVenueAI(userPrompt) {

        const systemPrompt = await this.buildVenuePrompt();

        const response = await this.groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            max_tokens: 500
        });

        return response.choices[0].message.content;
    }

}

module.exports = ChatBotService;