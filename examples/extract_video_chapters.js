const {VertexAI} = require('@google-cloud/vertexai');

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({project: 'gen-lang-client-0714220459', location: 'us-central1'});
const model = 'gemini-1.5-pro-preview-0409';

// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    'maxOutputTokens': 8192,
    'temperature': 1,
    'topP': 0.95,
  },
  safetySettings: [
    {
        'category': 'HARM_CATEGORY_HATE_SPEECH',
        'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
        'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
        'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
        'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
        'category': 'HARM_CATEGORY_HARASSMENT',
        'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
    }
  ],
});

const video1 = {
  fileData: {
    mimeType: 'video/mp4',
    fileUri: `gs://cloud-samples-data/generative-ai/video/rio_de_janeiro_beyond_the_map_rio.mp4`
  }
};
const text1 = {text: `Chapterize the video content by grouping the video content into chapters and providing summary for each chapter. Please only capture key events and highlights. If you are not sure about any info, please do not make it up. Return the result in the JSON format with keys as follows : \"timecode\", \"chapterSummary\"`};

async function generateContent() {
  const req = {
    contents: [
      {role: 'user', parts: [video1, text1]}
    ],
  };

  const streamingResp = await generativeModel.generateContentStream(req);

  for await (const item of streamingResp.stream) {
    process.stdout.write('stream chunk: ' + JSON.stringify(item) + '\n');
  }

  process.stdout.write('aggregated response: ' + JSON.stringify(await streamingResp.response));
}

generateContent();
