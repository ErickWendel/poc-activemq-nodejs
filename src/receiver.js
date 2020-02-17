const defaultHost = "amqp://activemq:activemq@localhost"
const host = process.env.QUEUE_URL || defaultHost
const topic = process.env.TOPIC_EXAMPLE || "TOPIC_EXAMPLE"

const QueueHandler = require('./QueueHandler')
const queue = new QueueHandler(host)
const cluster = require('cluster');
const numCPUs = require('os').cpus();

if (cluster.isMaster) {
  console.log('Master process is running');
  // Fork workers
  for (const i of numCPUs) {
    cluster.fork();
  }
} else {
  main(`${'child'}:${process.pid}`)
}

async function main(program) {
  try {
    console.log(`${program} - listening...`, topic)
    await queue.connect()
    await queue.subscribe(topic, msg => {
      console.log(`${program} - **received: ${JSON.stringify(msg.content)}`)
    })

  } catch (error) {
    console.log('rrr', error)
  }

}