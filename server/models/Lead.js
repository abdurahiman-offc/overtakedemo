import mongoose from 'mongoose';

const carDetailSchema = new mongoose.Schema({
    brandName: { type: String },
    modelName: { type: String },
    fuelType: { type: String },
    kmDriven: { type: String },
    additionalReqs: { type: String },
    intent: { type: String, enum: ['buying', 'selling'] }
});

const assignmentRecordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date, default: Date.now },
    assignedBy: { type: String } // System or another user ID
});

const leadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    place: { type: String },
    leadOrigin: {
        type: String,
        enum: ['WhatsApp', 'Insta', 'FB', 'Walk-in', 'Tele', 'Referral', 'Web', 'OLX', 'Other'],
        default: 'Other'
    },
    enquiredVehicle: { type: String },
    leadType: { type: String, enum: ['hot', 'warm', 'cold'], default: 'cold' },
    status: { type: String, enum: ['new', 'contacted', 'followed_up', 'closed', 'lost'], default: 'new' },
    notes: [{ type: String }],
    tags: [{ type: String }],

    carDetails: [carDetailSchema],

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignmentHistory: [assignmentRecordSchema],

    followupDate: { type: Date },
    followupNote: [{ type: String }],
    followupCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Lead', leadSchema);
