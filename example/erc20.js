const Web3 = require("web3");
const EEAClient = require("../src");
const HumandStandartTokenJson = require("./solidity/HumanStandardToken/HumanStandardToken.json");
const ethUtil = require("../src/custom-ethjs-util");

const web3 = new EEAClient(new Web3("http://localhost:20000"), 2018);

web3.eth.Contract(HumandStandartTokenJson.abi); // pass by reference monkey patch

// create HumanStandardToken constructor
const constructorAbi = HumandStandartTokenJson.abi.find(e => {
  return e.type === "constructor";
});
const constructorArgs = web3.eth.abi
  .encodeParameters(constructorAbi.inputs, [
    1000000,
    "DrumG Technologies Token",
    10,
    "DrumG"
  ])
  .slice(2);

const contractOptions = {
  data: `0x${HumandStandartTokenJson.binary}${constructorArgs}`,
  privateFrom: "A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=",
  privateFor: ["Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs="],
  privateKey: "8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63"
};

web3.eea
  .sendRawTransaction(contractOptions)
  .then(hash => {
    console.log(`Transaction Hash ${hash}`);
    return web3.eea.getTransactionReceipt(
      hash,
      "A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo="
    );
  })
  .then(privateTransactionReceipt => {
    console.log("Private Transaction Receipt");
    console.log(privateTransactionReceipt);
    return privateTransactionReceipt.contractAddress;
  })
  .then(contractAddress => {
    // can we do a web3.eea.Contract? somehow need to override to use the eea.sendRawTransaction when invoking contract methods
    // const contract = web3.eth.Contract(HumandStandartTokenJson.abi, contractAddress);
    // contract.methods.transfer(["to", "value"]).send(??)

    // already 0x prefixed
    const functionAbi = HumandStandartTokenJson.abi.find(element => {
      return element.name === "transfer";
    });
    const transferTo = `0x${ethUtil
      .privateToAddress(
        Buffer.from(
          "c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3",
          "hex"
        )
      )
      .toString("hex")}`;
    const functionArgs = web3.eth.abi
      .encodeParameters(functionAbi.inputs, [transferTo, 1])
      .slice(2);

    return web3.eea.sendRawTransaction({
      to: contractAddress,
      data: functionAbi.signature + functionArgs,
      privateFrom: "A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=",
      privateFor: ["Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs="],
      privateKey:
        "8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63"
    });
  })
  .then(transactionHash => {
    console.log(`Transaction Hash ${transactionHash}`);
    return web3.eea.getTransactionReceipt(
      transactionHash,
      "A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo="
    );
  })
  .then(privateTransactionReceipt => {
    console.log("Private Transaction Receipt");
    console.log(privateTransactionReceipt);
    if (privateTransactionReceipt.logs.length > 0) {
      console.log("Log 0");
      console.log(privateTransactionReceipt.logs[0]);
    }
    return privateTransactionReceipt;
  })
  .catch(e => {
    console.log(e);
  });
