const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true,
            enum: [
                "DevOps",
                "DevSecOps",
                "MLOps",
                "Cloud Infrastructure",
                "CI/CD Automation",
                "Containerization",
                "Kubernetes Management",
                "Monitoring & Logging",
                "Security & Compliance",

            ]
        },

        title: {
            type: String,
            required: true,
        },
        providerName: {
            type: String,
            required: true,
        },
        contactEmail: {
            type: String,
            required: true,
        },
        contactPhone: {
            type: String,
            required: true,
        },
           available: {
            type: Boolean,
            default: true,
        },
        maxBookings: {
            type: Number,
            default: 5,
        },
        currentBookings: {
            type: Number,
            default: 0,
        },
     
    },
    { timestamps: true }

);

module.exports = mongoose.model('Service', ServiceSchema);