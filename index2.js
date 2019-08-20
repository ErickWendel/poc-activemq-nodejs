var AMQPClient = require("amqp10").Client;

const Policy = require("amqp10").Policy,
  Promise = require("bluebird");

var client = new AMQPClient(Policy.merge({}, Policy.ActiveMQ)); // Uses PolicyBase default policy

async function main() {
  await client.connect("amqp://activemq:activemq@activemq");
  const [receiver] = await Promise.all([
    client.createReceiver("START_CONTACT")
  ]);

  receiver.on("message", function(message, list, t, b) {
    console.log("Rx message: ", message.body);
    //   console.log('Rx: ', message);
    //   console.log(JSON.stringify(list))
  });
  const sender = await client.createSender("START_CONTACT");
  let list = [];
  for (let i = 0; i < 1000; i++) {
    list.push({ key: "Value", i });
  }
  await sender.send(list);
}
main();
