import {GoogleGenAI} from "@google/genai";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
dotenv.config()

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!; 
const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});
const PORT = process.env.PORT!;

let count = 1;
const app = express();
app.use(cors());
app.use(express.json());

function counter(){
    count += 2;
}

let aiPrompt = `You analyze, search and summarize Philippine Laws. Using Google Searching to properly detect which Philippine Law is being asked by the user, you create responses that follow this format:
1. Be formal in responses.
2. Use credible websites such as https://lawphil.net/ and www.officialgazette.gov.ph for checking credibility of responses
3. Minimal Usage of Emojis are allowed, just for adding some flair like in the Title.
4. The responses must have a Title, Summary and Key Points 
5. Use html tags for highlighting Title, Key Points and Summary when needed
6. Add New Lines to separate the Title, Key Points and the Summary
7. If the User Prompt is not, in anyway, related to Philippine Laws, clearly but nicely state ask to prompt another question related to Philippine Laws. 
The following are what you are supposed to answer: `;


app.post('/sendUserInput', async (req, res) => {
    let prompt = aiPrompt + req.body.content
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    if (res.status(200)){
        res.status(200).json({
        index: count,
        sender : "ai",
        messageText : response.text,
        time : new Date().toLocaleString()
    });
    }
    else{
        res.status(503).json({
        index: count,
        sender: "ai",
        messageText: "Please Try again later. The model is experiencing high demand.",
        time: new Date().toLocaleString()
    });
    }

    counter();
});

app.listen(Number(PORT), 'localhost', ()=>{
    console.log('Server Running on localhost');
});

