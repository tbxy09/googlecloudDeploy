  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */

  // Imports the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Instantiates a client
  const secrectManagerclient = new SecretManagerServiceClient();
  export async function accessSecretVersion() {
    const [version] = await secrectManagerclient.accessSecretVersion({
      name: 'projects/213337631653/secrets/ANTHROPIC_API_KEY/versions/1'
    });

    // Extract the payload as a string.
    const payload = version.payload.data.toString();

    // console.info(`Plaintext: ${payload}`);
    // set to the env ANTHROPIC_API_KEY
    process.env.ANTHROPIC_API_KEY = payload;
  }

  // accessSecretVersion();  
