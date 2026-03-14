import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema({
    eventId: {
        type: String,
        required: true,
        index: true
    },
    layoutId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EventLayout',
        index: true
    },
    organizerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    accountName: {
        type: String,
        required: true,
        maxlength: 100
    },
    accountNumber: {
        type: String,
        required: true,
        maxlength: 50
    },
    bankName: {
        type: String,
        required: true,
        maxlength: 100
    },
    branchName: {
        type: String,
        required: true,
        maxlength: 100
    }
}, {
    timestamps: true
});

const BankAccount = mongoose.model('BankAccount', bankAccountSchema);

export default BankAccount;
