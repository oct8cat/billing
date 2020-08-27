import mongoose, { Schema, Document, Model } from "mongoose";
import { TCustomer } from "./Customer";
import { TCharge } from "./Charge";

export enum EChargeAttemptStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

export type TChargeAttempt = Document & {
  customer: TCustomer;
  status: EChargeAttemptStatus;
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
    enum: Object.values(EChargeAttemptStatus),
    required: true,
  },
});

export const ChargeAttempt = mongoose.model<TChargeAttempt, TChargeAttemptModel>("ChargeAttempt", ChargeAttemptSchema);
