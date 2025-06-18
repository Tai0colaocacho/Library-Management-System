import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { Publisher } from "../models/publisherModel.js";

export const createPublisher = catchAsyncErrors(async (req, res, next) => {
    const { name, address, contact_email } = req.body;
    if (!name) return next(new ErrorHandler("Publisher name is required.", 400));
    const publisher = await Publisher.create({ name, address, contact_email });
    res.status(201).json({ success: true, message: "Publisher created.", publisher });
});

export const getAllPublishers = catchAsyncErrors(async (req, res, next) => {
    const publishers = await Publisher.find();
    res.status(200).json({ success: true, publishers });
});

export const updatePublisher = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { name, address, contact_email } = req.body;
    let publisher = await Publisher.findById(id);
    if (!publisher) return next(new ErrorHandler("Publisher not found.", 404));
    publisher.name = name || publisher.name;
    publisher.address = address || publisher.address;
    publisher.contact_email = contact_email || publisher.contact_email;
    await publisher.save();
    res.status(200).json({ success: true, message: "Publisher updated.", publisher });
});

export const deletePublisher = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const isPublisherInUse = await Publisher.findOne({ publisher: id });
    if (isPublisherInUse) {
        return next(new ErrorHandler("Cannot delete publisher as it is in use.", 400));
    }
    await Publisher.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Publisher deleted." });
});