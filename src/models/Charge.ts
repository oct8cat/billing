import mongoose, { Schema, Document, Model } from "mongoose";
import { TCustomer } from "./Customer";
import { TSubscription } from "./Subscription";

export enum EChargeStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

export type TCharge = Document & {
  customer: TCustomer;
  subscription: TSubscription;
  nextChargeAttemptAt: Date | null;
  status: EChargeStatus;
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
  status: {
    type: Schema.Types.String,
    enum: Object.values(EChargeStatus),
    required: true,
  },
});

export const Charge = mongoose.model<TCharge, TChargeModel>("Charge", ChargeSchema);
