const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(

    {
        originalUrl: {
            type: String, 
            required: [true, 'Original URL is required'], 
            trim: true, 
            maxlength: [2048, 'Original URL cannot exceed 2048 characters']
        }, 

        shortCode: {
            type: String,
            required: [true, 'Short code is required'], 
            unique: true, 
            trim: true
        }, 

        clicks: {
            type: Number, 
            default: 0, 
            min: [0, 'Clicks cannot be negative']
        }, 

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
            default: null
        },
    }, 
    {
        timestamps: true
    }
);

urlSchema.index ({ user: 1, createdAt: -1 });

module.exports = mongoose.model ('Url', urlSchema);