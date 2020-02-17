const defaultHost = "amqp://activemq:activemq@localhost"
const host = process.env.QUEUE_URL || defaultHost
const topic = process.env.TOPIC_EXAMPLE || "TOPIC_EXAMPLE"

const QueueHandler = require('./QueueHandler')
const queue = new QueueHandler(host)
const faker = require('faker')

    ; (async function main() {
        try {
            await queue.connect()
            console.log('sending messages at', topic)
            setInterval(async () => {
                for(let i = 0; i < 100; i++) {
                    await queue.publishMessage(
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