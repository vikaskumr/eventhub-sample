const { EventHubConsumerClient, earliestEventPosition } = require("@azure/event-hubs");
const { ContainerClient } = require("@azure/storage-blob");
const { BlobCheckpointStore } = require("@azure/eventhubs-checkpointstore-blob");
import type { NextApiRequest, NextApiResponse } from 'next'

//take these values from .env variable
const connectionString = "";
const eventHubName = "";
const consumerGroup = ""; // name of the default consumer group
const storageConnectionString = "";
const containerName = "";


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).end()
    }
    const authHeader = req.headers.authorization
    return forGET(req, res).catch((err) => {
        console.log("Error occurred: ", err);
    });

}

async function forGET(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    // Create a blob container client and a blob checkpoint store using the client.
    const containerClient = new ContainerClient(storageConnectionString, containerName);
    const checkpointStore = new BlobCheckpointStore(containerClient);

    // Create a consumer client for the event hub by specifying the checkpoint store.
    const consumerClient = new EventHubConsumerClient(consumerGroup, connectionString, eventHubName, checkpointStore);

    // Subscribe to the events, and specify handlers for processing the events and errors.
    const subscription = consumerClient.subscribe({
        processEvents: async (events: string | any[], context: { partitionId: any; consumerGroup: any; updateCheckpoint: (arg0: any) => any; }) => {
            if (events.length === 0) {
                console.log(`No events received within wait time. Waiting for next interval`);
                return;
            }

            for (const event of events) {
                console.log(`Received event: '${event.body}' from partition: '${context.partitionId}' and consumer group: '${context.consumerGroup}'`);
            }
            // Update the checkpoint.
            await context.updateCheckpoint(events[events.length - 1]);
        },

        processError: async (err: any, context: any) => {
            console.log(`Error : ${err}`);
        }
    },
        { startPosition: earliestEventPosition }
    );

    // After 30 seconds, stop processing.
    setTimeout(async () => {
        await subscription.close();
        await consumerClient.close();
        console.log(`Exiting receiveEvents sample`);
    }, 30 * 1000);

}

// forGET().catch((err) => {
//     console.log("Error occurred: ", err);
// });

export default handler