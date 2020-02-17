const defaultHost = "amqp://activemq:activemq@localhost"
const host = process.env.QUEUE_URL || defaultHost
const topic = process.env.TOPIC_EXAMPLE || "TOPIC_EXAMPLE"

const queueHandler = require('./QueueHandler')
const Queue = new queueHandler(host)

  ; (async function main() {
    try {
      await Queue.connect()
      console.log('listening...', topic)
      await Queue.subscribe(topic, msg => {
        console.table(`**received: ${JSON.stringify(msg.content)}`)
      })

    } catch (error) {
      console.log('rrr', error)
    }

  })()