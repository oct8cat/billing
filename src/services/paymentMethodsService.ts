import { TPaymentMethod, TPaymentMethodModel } from "../models/PaymentMethod";
import { FilterQuery } from "mongoose";

export type TPaymentMethodService = {
  findPaymentMethod(filterQuery: FilterQuery<TPaymentMethod>): TFindPaymentMethodQuery;
};

export default (
  // @inject
  PaymentMethod: TPaymentMethodModel
): TPaymentMethodService => ({
  findPaymentMethod(filterQuery) {
    return PaymentMethod.findOne(filterQuery);
  },
});

export type TFindPaymentMethodQuery = ReturnType<TPaymentMethodModel["findOne"]>;
