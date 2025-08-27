import { Kafka } from "kafkajs";
import { ALL_ASSETS } from "@repo/assets/index";

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
})
console.log(kafka);

async function main(){
    const admin = kafka.admin()

    try {
        await admin.connect()
        await admin.createTopics({
            topics: ALL_ASSETS.map((asset) => ({
                topic: asset,
                numPartitions: 1,
            })),
        });
    } catch(err){
        console.log(err)
    } finally {
        await admin.disconnect()
    }

} 

main();