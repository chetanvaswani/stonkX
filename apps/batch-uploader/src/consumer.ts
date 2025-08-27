import { Kafka } from "kafkajs";
import { ALL_ASSETS } from "@repo/assets/index";

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
})

const consumer = kafka.consumer({ groupId: 'sher-akela-ata-hai' });

async function main(){
    await consumer.connect();

    ALL_ASSETS.forEach(async (asset) => {
        await consumer.subscribe({ topic: asset, fromBeginning: true })
    });
    
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                topic, message
            })
        },
    })
}

main()