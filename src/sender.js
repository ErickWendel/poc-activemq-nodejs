const defaultHost = "amqp://activemq:activemq@localhost"
const host = process.env.QUEUE_URL || defaultHost
const topic = process.env.TOPIC_EXAMPLE || "TOPIC_EXAMPLE"

const queueHandler = require('./QueueHandler')
const Queue = new queueHandler(host)
const faker = require('faker')

    ; (async function main() {
        try {
            await Queue.connect()
            console.log('sending messages at', topic)
            setInterval(async () => {
                for(let i = 0; i < 100; i++) {
                    await Queue.publishMessage(
                        {
                            name: `${faker.name.firstName()} ${faker.name.lastName()}`
                        },
                        topic
                    )

                }
            }, 500);

        } catch (error) {
            console.log('rrr', error)
        }

    })()