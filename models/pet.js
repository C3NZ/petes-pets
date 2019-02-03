// Imports
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

// Import Schema from mongoose
const { Schema } = mongoose;

// Limit the amount of records to return per query
mongoosePaginate.paginate.options = {
    limit: 3,
};

// Create the pet schema
const PetSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    species: {
        type: String,
        required: true,
    },
    birthday: {
        type: Date,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    purchasedAt: {
        type: Date,
    },
    picUrl: {
        type: String,
    },
    picUrlSq: {
        type: String,
    },
    avatarURL: {
        type: String,
    },
    favoriteFood: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        minlength: 60,
        required: true,
    },
},
{
    timestamps: true,
});


// add indexes for our pet schema (without weights)
PetSchema.index({
    name: 'text',
    species: 'text',
    favoriteFood: 'text',
    description: 'text',
});

// Enable mongoose paginate for the pet schema
PetSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Pet', PetSchema);
