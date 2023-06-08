const { Bee, BeeDebug } = require("@ethersphere/bee-js");

async function main() {
  const bee = new Bee("http://localhost:1633"); // Replace with the appropriate Bee node URL
  const beeDebug = new BeeDebug("http://localhost:1635"); // Replace with the appropriate Bee Debug node URL

  try {
    const fileData = "Hello, Bee DevSwarm!"; // Contents of the file

    // Upload file
    const response = await bee.uploadFile(fileData);
    console.log("File uploaded. Reference:", response.reference);

    // Retrieve chunk
    const chunkData = await beeDebug.downloadChunk(response.reference);
    console.log("Chunk retrieved. Data:", chunkData);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();