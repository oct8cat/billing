import mongoose, { Schema, Document, Model } from "mongoose";
import { TCustomer } from "./Customer";
import { TSubscription } from "./Subscription";

export type TChargeStatus = "pending" | "success" | "failed";

export type TCharge = Document & {
  customer: TCustomer;
  subscription: TSubscription;
  nextChargeAttemptAt: Date | null;
  status: TChargeStatus;
};

export type TChargeModel = Model<TCharge>;

export const ChargeSchema = new Schema({
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
});

export const Charge = mongoose.model<TCharge, TChargeModel>("Charge", ChargeSchema);
