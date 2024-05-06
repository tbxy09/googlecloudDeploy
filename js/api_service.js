/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Service that calls the Vertex AI API for generative AI text
 * prediction.
 */

/**
 * [Vertex AI Platform](https://cloud.google.com/vertex-ai/docs) client library.
 */
const {
  FunctionDeclarationSchemaType,
  VertexAI
} = require('@google-cloud/vertexai');
const { env } = require('./env.js');
// const { response } = require('express');

// Prompts used to generate text using Vertex AI.
const questionPrompt = 'The following message was sent by a user in a chat conversation.'
  + ' Does the message contain a question? Answer yes or no only.\n\nMessage:';
const chatCorpusPrompt = 'You are an AI Knowledge Assistant that can answer questions'
  + ' from new employees based on previous answers given by users in a chat space'
  + ' or content posted by users in the chat space.\n\n'
  + 'This is the conversation history so far:';
const answerQuestionPrompt = 'Based on the knowledge provided in the conversation'
  + ' history above, please answer the following question. If the conversation'
  + ' history does not provide an answer to the question, politely explain that'
  + ' you cannot answer the question.';

/**
 * Service that executes AI text prediction.
 */
exports.AIPService = {

  /**
   * Executes AI text prediction to determine whether the message contains a question.
   * @param {!string} message The user message.
   * @return {Promise<boolean>} Whether the user message contains a question.
   */
  containsQuestion: async function (message) {
    const response = await this.callPredict(`${questionPrompt} ${message}`);
    return response.toLowerCase().includes('yes');
  },

  /**
   * Executes AI text prediction to respond to user question.
   * @param {!string} question The user question.
   * @param {!import('../model/message.js').Message[]} messages The messages to feed
   *     into the AI model.
   * @return {Promise<string>} The answer to the user question.
   */
  answerQuestion: async function (question, messages) {
    const messageText = messages.map(message => message.text).join('\n\n');
    return this.callPredict(
      `${chatCorpusPrompt}\n\n${messageText}\n\n${answerQuestionPrompt}\n\n${question}`);
  },

  /**
   * Executes AI text prediction using the given prompt.
   * @param {!string} prompt The prompt to send in the AI prediction request.
   * @return {Promise<string>} The predicted text.
   */
  callPredict: async function (prompt) {
    // Initialize Vertex with the Cloud project and location
    const vertexAI = new VertexAI({
      project: env.project,
      location: env.location,
    });

    const tools = [
      {
        functionDeclarations: [
          {
            name: "editFiles",
            description: 'Edit files in the MemWorkspace of the project',
            parameters: {
              type: FunctionDeclarationSchemaType.ARRAY,
              items: {
                type: FunctionDeclarationSchemaType.OBJECT,
                properties: {
                  action: {
                    type: FunctionDeclarationSchemaType.OBJECT,
                    properties: {
                      type: {
                        type: FunctionDeclarationSchemaType.STRING,
                        enum: ['insert', 'replace', 'delete', 'file', 'remove'],
                      },
                      path: { type: FunctionDeclarationSchemaType.STRING },
                      position: {
                        type: FunctionDeclarationSchemaType.OBJECT,
                        properties: {
                          line: { type: FunctionDeclarationSchemaType.NUMBER },
                          character: { type: FunctionDeclarationSchemaType.NUMBER },
                        },
                      },
                      range: {
                        type: FunctionDeclarationSchemaType.OBJECT,
                        properties: {
                          start: {
                            type: FunctionDeclarationSchemaType.OBJECT,
                            properties: {
                              line: { type: FunctionDeclarationSchemaType.NUMBER },
                              character: { type: FunctionDeclarationSchemaType.NUMBER },
                            },
                          },
                          end: {
                            type: FunctionDeclarationSchemaType.OBJECT,
                            properties: {
                              line: { type: FunctionDeclarationSchemaType.NUMBER },
                              character: { type: FunctionDeclarationSchemaType.NUMBER },
                            },
                          },
                        },
                      },
                      startLine: { type: FunctionDeclarationSchemaType.NUMBER },
                      endLine: { type: FunctionDeclarationSchemaType.NUMBER },
                      code: { type: FunctionDeclarationSchemaType.STRING },
                      content: { type: FunctionDeclarationSchemaType.STRING },
                    },
                    required: ['type', 'path'],
                  },
                },
              },
            },
          },
          {
            name: "init",
            description: 'Initialize the MemWorkspace for the project',
            parameters: {
              type: FunctionDeclarationSchemaType.OBJECT,
              properties: {
                projectRoot: { type: FunctionDeclarationSchemaType.STRING },
                initialFiles: {
                  type: FunctionDeclarationSchemaType.ARRAY,
                  items: {
                    type: FunctionDeclarationSchemaType.OBJECT,
                    properties: {
                      path: { type: FunctionDeclarationSchemaType.STRING },
                      content: { type: FunctionDeclarationSchemaType.STRING },
                    },
                    required: ['path', 'content'],
                  },
                },
              },
              required: ['projectRoot', 'initialFiles'],
            },
          },
        ],
      },
    ];
    const functionResponseParts = [
      {
        functionResponse: {
          name: "edit_files",
          response: {
            name: "edit_files",
            content: {
              // array of editAction
              editActions: [
                {
                  type: "insert",
                  path: "file1.txt",
                  position: {
                    line: 1,
                    character: 1
                  },
                  content: "Hello, World!"
                }
              ]
            }
          }
        }
      }
    ]
    // Instantiate the model
    const generativeModelPreview = vertexAI.preview.getGenerativeModel({
      project: env.project,
      model: env.model,
    });
    // https://${REGION}-aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${REGION}/publishers/google/models/${MODEL_ID}:generateContent \
    const chat = generativeModelPreview.startChat({
      tools: tools,
      //   tool_config: 
    })
    const ret = await chat.sendMessage(prompt)
    const finishReason = ret.response.candidates[0].finishReason;
    console.log(finishReason)
    // console.log(ret.response.candidates[0].content.parts[0])
    if (ret.response.candidates[0].content.parts[0] && ret.response.candidates[0].content.parts[0].functionCall) {
      if (ret.response.candidates[0].content.parts[0].functionCall.name === 'init') {
        //   console.log(ret.response.candidates[0].content.parts[0].functionCall.args.initialFiles)
        return {
          message: 'init',
          files: ret.response.candidates?.[0]?.content?.parts?.[0]?.functionCall?.args?.initialFiles
        }
      } else if (ret.response.candidates[0].content.parts[0].functionCall.name === 'editFiles') {
        //   console.log(ret.response.candidates[0].content.parts[0].functionCall.args[0])
        return {
          message: 'edit_files',
          editActions: ret.response.candidates?.[0]?.content?.parts?.[0]?.functionCall?.args
        }
      }
    } else {
      return {
        message: 'text',
        text: ret.response.candidates?.[0]?.content?.parts?.[0]?.text
      }
    }
  },

}



// const api = this.AIPService
// // call the async callPredict
// const prompt = "generate vscode extension project with feature of keybinding to open the latest modified file "
// api.callPredict(prompt).then((ret) => {
//   console.log(ret)
// })

