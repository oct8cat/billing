import mongoose, { Schema, Document, Model } from "mongoose";
import { TCustomer } from "./Customer";
import { TSubscription } from "./Subscription";
import { TCharge } from "./Charge";

export type TChargeAttemptStatus = "pending" | "success" | "failed";

export type TChargeAttempt = Document & {
  customer: TCustomer;
  subscription: TSubscription;
  status: TChargeAttemptStatus;
  charge: TCharge;
};

export type TChargeAttemptModel = Model<TChargeAttempt>;

export const ChargeAttemptSchema = new Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  subscription: {
    type: Schema.Types.ObjectId,
    ref: "Subscription",
    required: true,
  },
  status: {
    type: Schema.Types.String,
    required: true,
  },
});

export const ChargeAttempt = mongoose.model<TChargeAttempt, TChargeAttemptModel>(
  "ChargeAttempt",
  ChargeAttemptSchema
);
