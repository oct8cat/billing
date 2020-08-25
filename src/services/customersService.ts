import { FilterQuery } from "mongoose";

import { TCustomer, TCustomerModel } from "../models/Customer";

export type TCustomersService = {
  findCustomer(filterQuery: FilterQuery<TCustomer>): ReturnType<TCustomerModel["findOne"]>;
};

export default (Customer: TCustomerModel): TCustomersService => ({
  findCustomer(filterQuery) {
    return Customer.findOne(filterQuery);
  },
});
