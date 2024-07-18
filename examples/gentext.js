const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function run() {
  const prompt = "Write a story about a magic backpack.";
  const result = await model.generateContent(prompt);
  const text = result.text();
  console.log(text);
}
run();
