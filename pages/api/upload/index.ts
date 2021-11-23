// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
// import { ErrorBody, ErrorCode, GatewayError, SendMessageResult, UnknownError } from '../../../../utils'
// import { isAuthorized } from '../../../../services/auth.service'
// import { DsbApiService } from '../../../../services/dsb-api.service'
// import { signPayload } from '../../../../services/identity.service'


// type Response = (SendMessageResult & { transactionId: string }) | { err: ErrorBody }

import { EventHubProducerClient } from "@azure/event-hubs";
import bodyParser from "body-parser";


// Load the .env file if it exists

import { v4 as uuid } from "uuid";

// Define connection string and related Event Hubs entity name here
const connectionString = "";
const eventHubName = "";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).end()
    }
    const authHeader = req.headers.authorization
    return forPOST(req, res)

}

async function forPOST(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    try {
        //taking only the content of the file from the request body
        const lines = (req.body).split('\n')
        const payload = lines
            .slice(3, lines.length - 2)
            .filter((line) => line !== '\r')
            .join('')


        const transactionId = uuid();

        const producer = new EventHubProducerClient(connectionString, eventHubName);

        console.log("Creating and sending a batch of events...");


        const eventsToSend = JSON.parse(payload)


        // By not specifying a partition ID or a partition key we allow the server to choose
        // which partition will accept this message.
        //
        // This pattern works well if the consumers of your events do not have any particular
        // requirements about the ordering of batches against other batches or if you don't care
        // which messages are assigned to which partition.
        //
        // If you would like more control you can pass either a `partitionKey` or a `partitionId`
        // into the createBatch() `options` parameter which will allow you full control over the
        // destination.
        const batchOptions = {
            // The maxSizeInBytes lets you manually control the size of the batch.
            // if this is not set we will get the maximum batch size from Event Hubs.
            //
            // For this sample you can change the batch size to see how different parts
            // of the sample handle batching. In production we recommend using the default
            // and not specifying a maximum size.
            //
            // maxSizeInBytes: 200
        };

        let batch = await producer.createBatch(batchOptions);

        let numEventsSent = 0;

        // add events to our batch
        let i = 0;

        while (i < eventsToSend.length) {
            // messages can fail to be added to the batch if they exceed the maximum size configured for
            // the EventHub.
            const isAdded = batch.tryAdd({ body: eventsToSend[i] });

            if (isAdded) {
                console.log(`Added eventsToSend[${i}] to the batch`);
                ++i;
                continue;
            }

            if (batch.count === 0) {
                // If we can't add it and the batch is empty that means the message we're trying to send
                // is too large, even when it would be the _only_ message in the batch.
                //
                // At this point you'll need to decide if you're okay with skipping this message entirely
                // or find some way to shrink it.
                console.log(`Message was too large and can't be sent until it's made smaller. Skipping...`);
                ++i;
                continue;
            }

            // otherwise this just signals a good spot to send our batch
            console.log(`Batch is full - sending ${batch.count} messages as a single batch.`);
            // console.log('batches', batch)
            await producer.sendBatch(batch);
            numEventsSent += batch.count;

            // and create a new one to house the next set of messages
            batch = await producer.createBatch(batchOptions);
        }

        // send any remaining messages, if any.
        if (batch.count > 0) {
            console.log(`Sending remaining ${batch.count} messages as a single batch.`);
            // console.log('batches', batch)
            await producer.sendBatch(batch);
            numEventsSent += batch.count;
        }

        console.log(`Sent ${numEventsSent} events`);

        if (numEventsSent !== eventsToSend.length) {
            throw new Error(`Not all messages were sent (${numEventsSent}/${eventsToSend.length})`);
        }

        await producer.close();
        console.log(`ingested event. requestId: ${transactionId}`);

        return res.send({ transactionId })

        // return res.status(200).send('Ok')
    } catch (err) {
        console.log(err);
    }
}
export default handler
