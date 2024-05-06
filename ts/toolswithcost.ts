#!/usr/bin/env -S npm run tsn -T

import { env } from './env';
import Anthropic from '@anthropic-ai/sdk';
import { AnthropicVertex } from '@anthropic-ai/vertex-sdk';
import {accessSecretVersion} from './secmanager';

const {assert} = require('node:assert');
process.env.CLOUD_ML_REGION = env.location;
process.env.ANTHROPIC_VERTEX_PROJECT_ID = env.project;

async function calculateCost(model: string, inputTokens: number, outputTokens: number, toolTokens: number) {
  switch (model) {
    case 'claude-3-opus-20240229':
      const opusInputCost = inputTokens * 0.015;
      const opusOutputCost = outputTokens * 0.075;
      const opusToolCost = toolTokens * 0.015;
      const opusTotalCost = opusInputCost + opusOutputCost + opusToolCost;
      console.log(`Estimated cost for Claude 3 Opus: $${opusTotalCost.toFixed(5)}`);
      break;
    case 'claude-3-sonnet-20240229':
      const sonnetInputCost = inputTokens * 0.003;
      const sonnetOutputCost = outputTokens * 0.015;
      const sonnetToolCost = toolTokens * 0.003;
      const sonnetTotalCost = sonnetInputCost + sonnetOutputCost + sonnetToolCost;
      console.log(`Estimated cost for Claude 3 Sonnet: $${sonnetTotalCost.toFixed(5)}`);
      break;
    case 'claude-3-haiku-20240307':
      const haikuInputCost = inputTokens * 0.00025;
      const haikuOutputCost = outputTokens * 0.00125;
      const haikuToolCost = toolTokens * 0.00025;
      const haikuTotalCost = haikuInputCost + haikuOutputCost + haikuToolCost;
      console.log(`Estimated cost for Claude 3 Haiku: $${haikuTotalCost.toFixed(5)}`);
      break;
    default:
      console.error('Invalid model name');
  }
}

async function toolExample() {
  await accessSecretVersion();

  const clientAnthropic = new Anthropic();
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

  // Token usage statistics
  const promptTokens = message.usage.input_tokens
  const completionTokens = message.usage.output_tokens
//   const toolTokens = tool.tokens;
  const toolTokens = 0;
  const totalTokens = promptTokens + completionTokens + toolTokens;

  console.log('Token usage statistics:');
  console.log(`Prompt tokens: ${promptTokens}`);
  console.log(`Completion tokens: ${completionTokens}`);
  console.log(`Tool tokens: ${toolTokens}`);
  console.log(`Total tokens: ${totalTokens}`);

  // Calculate the cost
  calculateCost(message.model, promptTokens, completionTokens, toolTokens);
}

toolExample().catch((err) => {
  console.error(err);
  process.exit(1);
});