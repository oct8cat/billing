import mongoose, { Schema, Model, Document } from "mongoose";

export enum EPaymentMethodProvider {
  STRIPE = "stripe",
}

export type TStripePaymentMethodData = { stripePaymentMethod: string; stripeCustomer: string };

export type TPaypalPaymentMethodData = { somePaypalToken: string };

export type TPaymentMethodData = TStripePaymentMethodData | TPaypalPaymentMethodData;

export type TPaymentMethod = Document & {
  provider: EPaymentMethodProvider;
  data: TPaymentMethodData;
};

export type TPaymentMethodModel = Model<TPaymentMethod>;

export const PaymentMethodSchema = new Schema({
  provider: {
    type: Schema.Types.String,
    required: true,
    enum: Object.values(EPaymentMethodProvider),
  },
  data: {
    type: Schema.Types.Mixed,
    required: true,
  },
});

export const PaymentMethod = mongoose.model<TPaymentMethod, TPaymentMethodModel>("PaymentMethod", PaymentMethodSchema);
