const dotenv = require('dotenv')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const StripeSession = require('../models/payment');
const {v4: uuid4} = require("uuid");

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
};


exports.createCheckoutSession = async (req, res, next) => {
    console.log(req.user);
    var metaUid = req.body.meta_uid;
    var sessionId = req.body.session_id;
    StripeSession.insertSession({"meta_uid": metaUid, "session_id": sessionId, "user_id": req.user.id})
    .then((resp) => {
        var data = {
            "message": "Accepted",
            "data": resp.data
        }
        res.status(201).json(data)
    })
    .catch((err) => {
        var data = {
            "message": "Error",
            "data": err
        }
        res.status(400).json(data)
    })
};


exports.createStripeCheckoutSession = async (req, res, next) => {
  const metaUid = uuid4();
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        meta_uid: metaUid,
        user_id: req.user.id || "",
      },
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    await StripeSession.insertSession({
        "meta_uid": metaUid, 
        "session_id": session.id, 
        "user_id": req.user.id,
        "has_paid": false,
        "is_expired": false
    })

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }

  

};
