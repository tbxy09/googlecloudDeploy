const {
  VertexAI,
  FunctionDeclarationSchemaType,
} = require('@google-cloud/vertexai');

const { env } = require('./.env.js/index.js');
const fs = require('fs');

const functionDeclarations = [
  {
      function_declarations: [
          {
              name: 'get_current_weather',
              description: 'get weather in a given location',
              parameters: {
                  type: FunctionDeclarationSchemaType.OBJECT,
                  properties: {
                      location: { type: FunctionDeclarationSchemaType.STRING },
                      unit: {
                          type: FunctionDeclarationSchemaType.STRING,
                          enum: ['celsius', 'fahrenheit'],
                      },
                  },
                  required: ['location'],
              },
          },
      ],
  },
];

const functionResponseParts = [
  {
      functionResponse: {
          name: 'get_current_weather',
          response: { name: 'get_current_weather', content: { weather: 'super nice' } },
      },
  },
];

/**
* TODO(developer): Update these variables before running the sample.
*/
function fileToGenerativePart(path, mimeType) {
  // const data = await fs.readFile('invoice.pdf');
  return {
      inlineData: {
          data: Buffer.from(fs.readFileSync(path))
              .toString('base64'),
          mimeType
      },
  };
}
function gstoGenrativePart(path, miniType) {
  const document1 = {
      fileData: {
          mimeType: miniType,
          fileUri: path,
      }
  };
  return document1;
}
async function functionCallingStreamChat(
  projectId = env.project,
  location = env.location,
  model = env.model,
) {
  // Initialize Vertex with your Cloud project and location
  const vertexAI = new VertexAI({ project: projectId, location: location });

  // Instantiate the model
  const generativeModel = vertexAI.preview.getGenerativeModel({
      model: model,
  });
  const requestfile = {
      contents: [
          {
              role: 'user', parts:
                  [fileToGenerativePart('image.png', 'image/png')]
          },
          { role: 'user', parts: [{ text: 'explain the image' }] }
      ],
      // tools: functionDeclarations,
  }
  const requestdoc = {
      contents: [
          {
              role: 'user', parts:
                  [
                    {
                      'text': 'explain the doc',
                    },
                    gstoGenrativePart('gs://cloud-samples-data/generative-ai/pdf/form_1040_2013.pdf', 'application/pdf'),
                  ]
          },
      ],
      // tools: functionDeclarations,
  };
  console.log(JSON.stringify(requestdoc))
  const request = {
      contents: [
          { role: 'user', parts: [{ text: 'What is the weather in Boston?' }] },
          {
              role: 'model',
              parts: [
                  {
                      functionCall: {
                          name: 'get_current_weather',
                          args: { location: 'Boston' },
                      },
                  },
              ],
          },
          { role: 'user', parts: functionResponseParts },
      ],
      tools: functionDeclarations,
  };
  const streamingResp = await generativeModel.generateContentStream(requestdoc);
  for await (const item of streamingResp.stream) {
      console.log(item.candidates[0].content.parts[0].text);
  }
}
functionCallingStreamChat(env.project, env.location, env.model)
// functionCallingStreamChat(env.projectId, env.location, env.model);