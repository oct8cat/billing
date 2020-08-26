import { FilterQuery } from "mongoose";
import { TCustomer, TCustomerModel } from "../models/Customer";

export type TCustomersService = {
  findCustomer(filterQuery: FilterQuery<TCustomer>): TFindCustomerQuery;
};

export default (
  // @inject
  Customer: TCustomerModel
): TCustomersService => ({
  findCustomer(filterQuery) {
    return Customer.findOne(filterQuery);
  },
});

export type TFindCustomerQuery = ReturnType<TCustomerModel["findOne"]>;
