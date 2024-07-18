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

const document1 = {
  fileData: {
    mimeType: 'application/pdf',
    fileUri: `gs://cloud-samples-data/generative-ai/pdf/form_1040_2013.pdf`
  }
};
const document2 = {
  fileData: {
    mimeType: 'application/pdf',
    fileUri: `gs://cloud-samples-data/generative-ai/pdf/form_1040_2023.pdf`
  }
};

async function generateContent() {
  const req = {
    contents: [
      {role: 'user', parts: [document1, document2, {text: `The first document is from 2013, the second one from 2023. How did the standard deduction evolve?`}]}
    ],
  };

  const streamingResp = await generativeModel.generateContentStream(req);

  for await (const item of streamingResp.stream) {
    process.stdout.write('stream chunk: ' + JSON.stringify(item) + '\n');
  }

  process.stdout.write('aggregated response: ' + JSON.stringify(await streamingResp.response));
}

generateContent();
