const functions = require('@google-cloud/functions-framework');

/**
 * HTTP Cloud Function that uses a secret stored in Secret Manager.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
functions.http('helloSecret', async (req, res) => {
  // Retrieve the API key from the environment variable.
  const apiKey = process.env.API_KEY;

  // Make an API call using the API key.
  const response = await fetch('https://example.com/api/v1/endpoint', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  // Send the API response to the client.
  res.send(response.body);
});
