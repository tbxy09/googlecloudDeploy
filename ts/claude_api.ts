#!/usr/bin/env -S npm run tsn -T

import { env } from './env';
import Anthropic from '@anthropic-ai/sdk';
import { AnthropicVertex } from '@anthropic-ai/vertex-sdk';
const { assert } = require('assert');

// Instantiates a client

process.env.CLOUD_ML_REGION = env.location;
process.env.ANTHROPIC_VERTEX_PROJECT_ID = env.project;


async function toolExample() {
  const clientAnthropic = new Anthropic()


  const userMessage: Anthropic.Beta.Tools.ToolsBetaMessageParam = {
    role: 'user',
    content: 'What is the weather in SF?',
  };
  const tools: Anthropic.Beta.Tools.Tool[] = [
    {
      name: 'get_weather',
      description: 'Get the weather for a specific location',
      input_schema: {
        type: 'object',
        properties: { location: { type: 'string' } },
      },
    },
  ];

  const message = await clientAnthropic.beta.tools.messages.create({
    model: env.model_haiku,
    max_tokens: 1024,
    messages: [userMessage],
    tools,
  });
  console.log('Initial response:');
  console.dir(message, { depth: 4 });

  assert(message.stop_reason === 'tool_use');

  const tool = message.content.find(
    (content): content is Anthropic.Beta.Tools.ToolUseBlock => content.type === 'tool_use',
  );
  assert(tool);
  console.log('Tool use:');
  console.log(JSON.stringify(tool, null, 4));
}


export async function handler(prompt) {
  const clientAnthropic = new Anthropic()
  const result = await clientAnthropic.messages.create({
    messages: [
      {
        role: 'user',
        content: prompt
      },
    ],
    model: env.model_haiku,
    max_tokens: 300,
  });
  console.log(JSON.stringify(result, null, 2));
  return result.content[0]?.text;
}