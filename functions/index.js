// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
const TinEye = require('tineye-api');
const admin = require('firebase-admin');
admin.initializeApp();

// The Firebase Admin SDK to access the Firebase Realtime Database.
const credentials = functions.config().tineye;
console.log(credentials.pub);

const api = new TinEye(
    `https://api.tineye.com/rest/,${credentials.priv},${credentials.pub}`
);

exports.searchResults = functions.https.onCall(() => {
    // const userId = context.auth.uid;
    // const userRef = db.doc(`users/${userId}`)
    // const userSnap = await userRef.get();
    const params = {
        offset: 0,
        limit: 10,
        sort: 'score',
        order: 'desc',
    };

    // const url = req.query.text;
    const url = 'https://tineye.com/images/meloncat.jpg';
    return api
        .searchUrl(url, params)
        .then(function(response) {
            console.log(response);
            // res(response);
        })
        .catch(function(error) {
            console.log(error);
            // res.json(error);
        });
});
// api
//     .searchUrl(url, params)
//     .then(function(response) {
//         console.log(response);
//     })
//     .catch(function(error) {
//         console.log(error);
//     });

// var img = fs.readFileSync('/Users/Mypath/image.jpg');
// var params = {
//     offset: 0,
//     limit: 10,
//     sort: 'size',
//     order: 'asc',
// };
// api
//     .searchData(img, params)
//     .then(function(response) {
//         console.log(response);
//     })
//     .catch(function(error) {
//         console.log(error);
//     });

// api
//     .remainingSearches()
//     .then(function(response) {
//         console.log(response);
//     })
//     .catch(function(error) {
//         console.log(error);
//     });

// api
//     .imageCount()
//     .then(function(response) {
//         console.log(response);
//     })
//     .catch(function(error) {
//         console.log(error);
//     });

// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest(async(req, res) => {
    // Grab the text parameter.
    const original = req.query.text;
    // Push the new message into the Realtime Database using the Firebase Admin SDK.
    const snapshot = await admin
        .database()
        .ref('/messages')
        .push({ original: original });
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    res.redirect(303, snapshot.ref.toString());
});

// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.makeUppercase = functions.database
    .ref('/messages/{pushId}/original')
    .onCreate((snapshot, context) => {
        // Grab the current value of what was written to the Realtime Database.
        const original = snapshot.val();
        console.log('Uppercasing', context.params.pushId, original);
        const uppercase = original.toUpperCase();
        // You must return a Promise when performing asynchronous tasks inside a Functions such as
        // writing to the Firebase Realtime Database.
        // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
        return snapshot.ref.parent.child('uppercase').set(uppercase);
    });