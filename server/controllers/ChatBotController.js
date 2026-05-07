// const ChatBotService = require("../services/ChatBotService");

// class ChatBotController {
//     constructor() {
//         this.chatbotService = new ChatBotService();
//     }

//     async askChatbot(req, res, next) {
//         try {
//             const { prompt } = req.body;
//             const reply = await this.chatbotService.askAI(prompt);

//             res.status(200).json({
//                 success: true,
//                 reply
//             });

//         } catch (error) {
//              next(error)
//         }
//     }
// }

// module.exports = ChatBotController;









const ChatBotService = require("../services/ChatBotService");

class ChatBotController {

    constructor() {
        this.chatbotService = new ChatBotService();
    }

    /**
     * General FAQ chatbot
     */
    async askChatbot(req, res, next) {
        try {

            const { prompt } = req.body;

            const reply = await this.chatbotService.askAI(prompt);

            res.status(200).json({
                success: true,
                reply
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Event FAQ chatbot
     */
    async askEventChatbot(req, res, next) {
        try {

            const { prompt } = req.body;

            const reply = await this.chatbotService.askEventAI(prompt);

            res.status(200).json({
                success: true,
                reply
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Venue FAQ chatbot
     */
    async askVenueChatbot(req, res, next) {
        try {

            const { prompt } = req.body;

            const reply = await this.chatbotService.askVenueAI(prompt);

            res.status(200).json({
                success: true,
                reply
            });

        } catch (error) {
            next(error);
        }
    }

}

module.exports = ChatBotController;