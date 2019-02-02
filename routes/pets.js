const express = require('express');
const Pet = require('../models/pet');
const multer = require('multer');
const Uploader = require('s3-uploader');
const stripe = require('stripe')(process.env.PRIVATE_STRIPE_API_KEY);


// Middleware for handling multipart data
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Instantiate client for uploading to amazon s3
const client = new Uploader(process.env.S3_BUCKET, {
    aws: {
        path: 'pets/avatar',
        region: process.env.S3_REGION,
        acl: 'public-read',
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
    cleanup: {
        versions: true,
        original: true,
    },
    versions: [ {
        maxWidth: 400,
        aspect: '16:10',
        suffix: '-standard',
    },
    {
        maxWidth: 300,
        aspect: '1:1',
        suffix: '-square',
    },
    ],
});

// NEW PET
router.get('/new', (req, res) => {
    res.render('pets-new');
});

// SEARCH FOR A NEW PET
router.get('/search', (req, res, next) => {
    const term = new RegExp(req.query.term, 'i');
    const currentPage = req.query.page || 1;

    // Allow users to search for both dog name and species
    Pet
        .paginate(
            { $or: [{ name: term }, { species: term }] },
            { page: currentPage },
        )
        .then((results) => {
            // Attach the found pets, current count, and the 
            res.locals.pets = results.docs;
            res.locals.pageCount = results.pages
            res.locals.currentPage = currentPage;
            res.locals.term = req.query.term;

            res.render('pets-index', {
                pets: results.docs,
                pageCount: results.pages,
                currentPage,
                term: req.query.term,
            });
        })
        .catch(err => next(err));
});

// CREATE PET
router.post('/', upload.single('avatar'), (req, res, next) => {
    const pet = new Pet(req.body);

    // Check if the user has sent over a file
    if (req.file) {
        // Upload the image to the bucket
        client.upload(req.file.path, {}, (err, versions, meta) => {
            if (err) return res.status(400).json(err);

            // Grab the bucket url and attach it to the avatar
            const url = versions[0].url.split('-');
            url.pop();
            pet.avatarURL = url.join('-');

            // Save the pet and send it to the user
            pet
                .save()
                .then((newPet) => {
                    // eslint-disable-next-line
                    res.json({pet: newPet})
                })
                .catch((err) => {
                    return next(err);
                });
        });
    }
});

// SHOW PET
router.get('/:id', (req, res) => {
    Pet
        .findById(req.params.id)
        .exec((err, pet) => {
            // Attach the pet and public stripe api key
            res.locals.pet = pet;
            res.locals.PUBLIC_STRIPE_API_KEY = process.env.PUBLIC_STRIPE_API_KEY; 

            // Render the single pet
            res.render('pets-show', res.locals);
        });
});

// EDIT PET
router.get('/:id/edit', (req, res) => {
    Pet
        .findById(req.params.id)
        .exec((err, pet) => {
            res.render('pets-edit', { pet });
        });
});

// UPDATE PET
router.put('/:id', upload.single('avatar'), (req, res, next) => {
    // Check if the user has sent over a file
    if (req.file) {
        // Upload the image to the bucket
        client.upload(req.file.path, {}, (err, versions, meta) => {
            if (err) return res.status(400).json(err);
            // Grab the bucket url and attach it to the avatar
            const url = versions[0].url.split('-');
            url.pop();
            req.body.avatarURL = url.join('-');

            Pet
                .findByIdAndUpdate(req.params.id, req.body)
                .then(pet => res.json({ pet }))
                .catch((err) => next(err));
        });
    } else {
        // No photo was uploaded, just update the rest of the pet   
        Pet
            .findByIdAndUpdate(req.params.id, req.body)
            .then(pet => res.json({ pet }))
            .catch((err) => next(err));
    }
});

// DELETE PET
router.delete('/:id', (req, res) => {
    Pet
        .findByIdAndRemove(req.params.id)
        .exec((err, pet) => {
            return res.redirect('/')
        });
});

router.post('/:id/purchase', (req, res, next) => {
    const token = req.body.stripeToken;

    // Create the official charge
    Pet
        .findOne({ _id: req.params.id })
        .exec((err, pet) => {
            if (err) return next(err);

            stripe
                .charges
                .create({
                    amount: pet.price * 100,
                    currency: 'usd',
                    description: `Purchased ${pet.name}, ${pet.species}`,
                    source: token,
                })
                .then(charge => res.redirect(`/pets/${req.params.id}`))
                .catch( err => next(err))
        })
});

module.exports = router;
