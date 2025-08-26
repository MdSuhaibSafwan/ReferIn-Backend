const dotenv = require('dotenv')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const StripeSession = require('../models/payment');

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
        var frontendUid = metaData.frontendUid || null;
        if (frontendUid == null){
            return response.status(200).send({"message": "no frontend uid found"});
        } else {
            // it should be has paid = true
            StripeSession.findSessionByUid(frontendUid)
            .then((resp) => {
                if (resp.data.length > 0){
                    var sessionObjId = resp.data[0].id;
                    StripeSession.updateSession(sessionObjId, {"has_paid": true})
                    .then((resp) => {
                        if (resp.data.length > 0){
                            response.status(200).send({"message": "has been paid successfully"});
                        } else {
                            return response.status(404).send({"message": "no session found"});
                        }
                    })
                } else {
                    return response.status(404).send({"message": "no session found"});
                }
            })
        };



    } else {
        response.status(200).send({"message": "other event type handled"});
    };
}
