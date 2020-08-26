import mongoose, { Schema, Document, Model } from "mongoose";

export type TCustomer = Document & {
  name: string;
};

export type TCustomerModel = Model<TCustomer>;

export const CustomerSchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: true,
    unique: true,
  },
});

export const Customer = mongoose.model<TCustomer, TCustomerModel>("Customer", CustomerSchema);
