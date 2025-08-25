const dotenv = require('dotenv')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
dotenv.config();


exports.stripeWebhook = (request, response) => {
    let event = request.body;
    var endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (endpointSecret) {
        const signature = request.headers['stripe-signature'];
        try {
            event = stripe.webhooks.constructEvent(
                request.body,
                signature,
                endpointSecret
            );
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`, err.message);
            return response.sendStatus(400);
        }
    }

    if (event.type == "checkout.session.completed"){
        var session = event.data.object;
        var metaData = session.metadata;
        var frontendUid = metaData.frontendUid;
        console.log("FrontendUID --> " + frontendUid); // b6c977a4b64c20ff8abaf71d99ff9f21251de4bc2e3a4baf9244f104bf1e9c5a

        response.status(200).send({"message": "success"});

    } else {
        response.status(200).send({"message": "other event type handled"});
    };
}
