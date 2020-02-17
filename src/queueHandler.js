const {
    Connection, ReceiverEvents
} = require('rhea-promise');
const uuidv4 = require('uuid/v4');


class QueueHandler {
    constructor(connectionString) {
        this.senders = {};
        this.receivers = {};
        this.connectionData = this._parseConnectionUrl(connectionString);
    }
    _parseConnectionUrl(connectionString) {
        const url = new URL(connectionString)
        const {
            username,
            protocol,
            password,
            host,
            port
        } = url

        return {
            protocol: protocol.replace(':', ""),
            username,
            protocol,
            password,
            host,
            port
        }
    }
    async connect() {
        const data = this.connectionData;
        const connection = new Connection({
            ...data,
            reconnect: false,
        });

        this.connection = await connection.open();
    }


    async publishMessage(data, event) {
        const senderName = uuidv4();

        const senderOptions = {
            name: senderName,
            target: {
                address: event
            },
            sendTimeoutInSeconds: 10,
            onError(context) {
                const senderError = context.sender && context.sender.error;
                if (senderError) {
                    Logger.error(">>>>> An error occurred for sender '%s': %O.",
                        senderName, senderError);
                }
            },
            onSessionError(context) {
                const sessionError = context.session && context.session.error;
                if (sessionError) {
                    Logger.error(">>>>> An error occurred for session of sender '%s': %O.",
                        senderName, sessionError);
                }
            }
        };

        if (!this.senders[event]) {
            this.senders[event] = await this.connection.createAwaitableSender(senderOptions);
        }
        const sender = this.senders[event];
        const delivery = await sender.send({ body: data });

        return delivery;
    }

    async subscribe(event, onMessage) {
        const receiverName = uuidv4();
        const receiverOptions = {
            name: receiverName,
            source: {
                address: event
            },
            onSessionError(context) {
                const sessionError = context.session && context.session.error;
                if (sessionError) {
                    Logger.error(">>>>> An error occurred for session of receiver '%s': %O.",
                        receiverName, sessionError);
                }
            }
        };

        if (!this.receivers[event]) {
            this.receivers[event] = await this.connection.createReceiver(receiverOptions);
        }
        const receiver = this.receivers[event];
        receiver.on(ReceiverEvents.message, (context) => {
            onMessage({ content: JSON.stringify(context.message.body) });
        });
        receiver.on(ReceiverEvents.receiverError, (context) => {
            const receiverError = context.receiver && context.receiver.error;
            if (receiverError) {
                Logger.error(">>>>> An error occurred for receiver '%s': %O.",
                    receiverName, receiverError);
                onMessage({ error: context.receiver.error });
            }
            onMessage({ error: context.receiver });
        });
    }
}
module.exports = QueueHandler;