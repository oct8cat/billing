import mongoose, { Schema, Document, Model } from "mongoose";
import { TCustomer } from "./Customer";
import { TSubscription } from "./Subscription";

export type TSubscriptionSpellPeriod = "monthly" | "weekly";

export type TSubscriptionSpell = Document & {
  _customer: TCustomer;
  _subscription: TSubscription;
  period: TSubscriptionSpellPeriod;
};

export type TSubscriptionSpellModel = Model<TSubscriptionSpell>;

export enum ESubscriptionSpellPeriod {
  MONTHLY = "monthly",
  WEEKLY = "weekly",
}

export const SubscriptionSpellSchema = new Schema({
  _customer: {
    type: Schema.Types.ObjectId,
    ref: "Subscription",
    required: true,
  },
  _subscriptionSpell: {
    type: Schema.Types.ObjectId,
    ref: "SubscriptionSpell",
    required: true,
  },
  period: {
    type: Schema.Types.String,
    required: true,
    enum: Object.values(ESubscriptionSpellPeriod),
  },
});

export const SubscriptionSpell = mongoose.model<TSubscriptionSpell, TSubscriptionSpellModel>(
  "SubscriptionSpell",
  SubscriptionSpellSchema
);
