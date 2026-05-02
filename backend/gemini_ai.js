import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
dotenv.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const PORT = process.env.PORT;
let contents = null;
let count = 0;
const app = express();
app.use(cors());
const getResponse = async function () {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents.content
    });
    return response.text;
};
function counter() {
    count += 1;
}
app.get('/', async (req, res) => {
    contents = {
        content: req.body()
    };
    const result = await getResponse();
    res.status(200).json({
        index: count,
        sender: "ai",
        messageText: contents.content,
        time: new Date().toLocaleString()
    });
    counter();
});
app.listen(PORT);
//# sourceMappingURL=gemini_ai.js.map