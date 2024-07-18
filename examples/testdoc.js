// const {Document} = require('@google-cloud/documentai');

// const document2 = new Document({
//   content: [
//     {
//       type: 'table',
//       table: {
//         headerRows: [
//           {
//             cells: [
//               {
//                 text: 'Name',
//               },
//               {
//                 text: 'Age',
//               },
//             ],
//           },
//         ],
//         rows: [
//           {
//             cells: [
//               {
//                 text: 'John',
//               },
//               {
//                 text: '25',
//               },
//             ],
//           },
//           {
//             cells: [
//               {
//                 text: 'Mary',
//               },
//               {
//                 text: '27',
//               },
//             ],
//           },
//         ],
//       },
//     },
//   ],
// });

  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  const { env } = require('./.env.js/index.js');
  const projectId = env.project;
  const location = env.location;


  // Imports the Google Cloud client library
  const {DocumentProcessorServiceClient} = require('@google-cloud/documentai');

  // Instantiates a client
  const client = new DocumentProcessorServiceClient();

  async function processDocument() {
    // The full resource name of the location, e.g.:
    // projects/project-id/locations/location
    const name = `projects/${projectId}/locations/${location}`;

    // Read the file into memory.
    const fs = require('fs').promises;
    const imageFile = await fs.readFile('invoice.pdf');

    // Convert the image data to a Buffer and base64 encode it.
    const encodedImage = Buffer.from(imageFile).toString('base64');

    const request = {
      name,
      rawDocument: {
        content: encodedImage,
        mimeType: 'application/pdf',
      },
    };

    // Recognizes text entities in the PDF document
    const [result] = await client.processDocument(request);

    const {document} = result;
    const {text} = document;

    // Read the text recognition output from the processor
    // console.log(`Full document text: ${text}`);
    // console.log(`Full document text: ${text}`);
    for (const page of document.pages) {
      for (const paragraph of page.paragraphs) {
        const paragraphText = getText(paragraph.layout.textAnchor, text);
        console.log(`Paragraph text: ${paragraphText}`);
        for (const token of paragraph.layout.tokens) {
          const tokenText = getText(token.layout.textAnchor, text);
          console.log(`\tToken text: ${tokenText}`);
        }
      }
    }
  }

  function getText(textAnchor, text) {
    if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
      return '';
    }

    // First shard contains the actual text
    const startIndex = textAnchor.textSegments[0].startIndex;
    const endIndex = textAnchor.textSegments[0].endIndex;
    return text.substring(startIndex, endIndex);
  }
  processDocument();  
