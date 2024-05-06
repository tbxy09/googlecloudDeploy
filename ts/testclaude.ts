// #!/usr/bin/env -S npm run tsn -T

// // import { Anthropic } from '@anthropic-ai/vertex-sdk';
// // const {AnthropicVertex} = require('@anthropic-ai/vertex-sdk')
// // Reads from the `CLOUD_ML_REGION` & `ANTHROPIC_VERTEX_PROJECT_ID`
// // environment variables.
// // const { env } = require('./env.js');
// // import { env } from './env';
// // import { AnthropicVertex } from '@anthropic-ai/vertex-sdk';
// // const {Anthropic} = require('@anthropic-ai/sdk')
// // const assert = require('assert');


// // export 
// // CLOUD_ML_REGION = "gen-lang-client-0714220459"
// // PROJECT_LOCATION = "us-central1"
// // export const CLOUD_ML_REGION = env.location
// // export const PROJECT_LOCATION = env.location
// process.env.CLOUD_ML_REGION = env.location
// process.env.ANTHROPIC_VERTEX_PROJECT_ID = env.project;



// const client = new AnthropicVertex()

// async function toolExample() {
//   const userMessage: Anthropic.Beta.Tools.ToolsBetaMessageParam = {
//     role: 'user',
//     content: 'What is the weather in SF?',
//   };
//   const tools: Anthropic.Beta.Tools.Tool[] = [
//     {
//       name: 'get_weather',
//       description: 'Get the weather for a specific location',
//       input_schema: {
//         type: 'object',
//         properties: { location: { type: 'string' } },
//       },
//     },
//   ];

//   const message = await client.beta.tools.messages.create({
//     model: env.modelhaiku,
//     max_tokens: 1024,
//     messages: [userMessage],
//     tools,
//   });
//   console.log('Initial response:');
//   console.dir(message, { depth: 4 });

//   assert(message.stop_reason === 'tool_use');

//   const tool = message.content.find(
//     (content): content is Anthropic.Beta.Tools.ToolUseBlock => content.type === 'tool_use',
//   );
//   assert(tool);

//   const result = await client.beta.tools.messages.create({
//     model: 'claude-3-opus-20240229',
//     max_tokens: 1024,
//     messages: [
//       userMessage,
//       { role: message.role, content: message.content },
//       {
//         role: 'user',
//         content: [
//           {
//             type: 'tool_result',
//             tool_use_id: tool.id,
//             content: [{ type: 'text', text: 'The weather is 73f' }],
//           },
//         ],
//       },
//     ],
//     tools,
//   });
//   console.log('\nFinal response');
//   console.dir(result, { depth: 4 });
// }
// async function main() {
//   const result = await client.messages.create({
//     messages: [
//       {
//         role: 'user',
//         content: 'Hello!',
//       },
//     ],
//     model: 'claude-3-sonnet@20240229',
//     max_tokens: 300,
//   });
//   console.log(JSON.stringify(result, null, 2));
// }

// main().catch((err) => {
//   console.error(err);
//   process.exit(1);
// });