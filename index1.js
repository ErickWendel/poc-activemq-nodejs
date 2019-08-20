const container = require("rhea");

let confirmed = 0;
let sent = 0;

const total = 100;
let GLOBAL_SCHEDULED_ITEMS = [];
const GLOBAL_LISTENED_ITEMS = {};

container.on("accepted", function(context) {
  if (++confirmed === total) {
    console.log("all messages confirmed", GLOBAL_SCHEDULED_ITEMS.length);

    // context.connection.close();
  }
});

container.on("error", function(context) {
  console.error("%s %j", context.error, context.error);
});

container.on("disconnected", function(context) {
  if (context.error) console.error("%s %j", context.error, context.error);
  sent = confirmed;
});

container.on("sendable", function(context) {
  const stillWaitingItems = GLOBAL_SCHEDULED_ITEMS.filter(
    ({ data, sender }) => {
      // continues on the list for the next execution
      if (!sender.sendable()) return true;

      // console.log("sender sent " + data);
      sender.send({
        body: data
      });

      return false;
    }
  );

  GLOBAL_SCHEDULED_ITEMS = stillWaitingItems;
});

container.on("message", function(context) {
  const address = context.receiver.options.source.address;
  const body = context.message.body;
  GLOBAL_LISTENED_ITEMS[address](body);

  //   console.log("received on ", address, body);

  context.delivery.accept();
});

class RabbitMq {
  constructor() {
    this.senders = {};
    this.receivers = {};
  }
  connect() {
    this.connection = container.connect({
      host: "activemq",
      port: 5672,
      password: "activemq",
      //   transport: "ssl",
      username: "activemq"
      //   channel_max: 10000
    });
  }
  static _subscribeEvent(event, onMessage) {
    GLOBAL_LISTENED_ITEMS[event] = onMessage;
  }
  static _scheduleEvent(data, sender) {
    GLOBAL_SCHEDULED_ITEMS.push({ data, sender });
  }
  publish(data, event) {
    if (!this.senders[event])
      this.senders[event] = this.connection.open_sender(event);

    RabbitMq._scheduleEvent(data, this.senders[event]);
  }

  subscribe(event, onMessage) {
    // do not remove open_receiver code below. It will open a listener
    if (!this.receivers[event])
      this.receivers[event] = this.connection.open_receiver(event);

    RabbitMq._subscribeEvent(event, onMessage);
  }
}

const rb = new RabbitMq();
rb.connect();

while (sent < total) {
  sent++;
  rb.publish("test1: " + sent, "examples1");
  rb.publish("test2: " + sent, "examples2");
  rb.publish("test3: " + sent, "examples3");
  //   publish("test2: " + sent, "examples2");
}

rb.subscribe("examples1", msg => console.log("msg1", msg));
rb.subscribe("examples2", msg => console.log("msg2", msg));
rb.subscribe("examples3", msg => console.log("msg3", msg));
