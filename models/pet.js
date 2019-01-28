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
    },
    birthday: {
        type: Date,
    },
    picUrl: {
        type: String,
    },
    picUrlSq: {
        type: String,
    },
    favoriteFood: {
        type: String,
    },
    description: {
        type: String,
    },
},
{
    timestamps: true,
});

// Enable mongoose paginate for the pet schema
PetSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Pet', PetSchema);
