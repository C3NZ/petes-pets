const express = require('express');
const Pet = require('../models/pet');
const multer = require('multer');
const Uploader = require('s3-uploader');

// Middleware for handling multipart data
const upload = multer({ dest: 'uploads/' });

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
    versions: [
        {
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

const router = express.Router();

// NEW PET
router.get('/new', (req, res) => {
    res.render('pets-new');
});

router.get('/search', (req, res, next) => {
    const term = new RegExp(req.query.term, 'i');
    // Allow users to search for both dog name and species
    const currentPage = req.query.page || 1;

    Pet
        .paginate(
            { $or: [{ name: term }, { species: term }] },
            { page: currentPage },
        )
        .then((results) => {
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
            res.render('pets-show', { pet });
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

module.exports = router;
