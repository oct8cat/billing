import mongoose, { Schema, Document, Model } from "mongoose";
import { TCustomer } from "./Customer";
import { TSubscriptionSpell } from "./SubscriptionSpell";
import { TCharge } from "./Charge";

export type TSubscription = Document & {
  customer: TCustomer;
  subscriptionSpell: TSubscriptionSpell;
  nextChargeAt: Date | null;
  pendingCharge: TCharge | null;
};

export type TSubscriptionModel = Model<TSubscription>;

export const SubscriptionSchema = new Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: "Subscription",
    required: true,
  },
  subscriptionSpell: {
    type: Schema.Types.ObjectId,
    ref: "SubscriptionSpell",
    required: true,
  },
});

export const Subscription = mongoose.model<TSubscription, TSubscriptionModel>("Subscription", SubscriptionSchema);
