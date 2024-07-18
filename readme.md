![Alt text](image.png)

## local test before deployment
while using functions-framework, can setup a local server to test the function locally,

manage the test script and test data.json file.
```
npx @google-cloud/functions-framework --target=codebot
```
```
curl -X POST -H "Content-Type: application/json" --data @data.json https://us-central1-gen-lang-client-0714220459.cloudfunctions.net/codebot
```

## generate a help site for start a first vertex project in gcloud, 



![Alt text](image-1.png)