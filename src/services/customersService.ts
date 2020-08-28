import { FilterQuery } from "mongoose";
import { TCustomer, TCustomerModel } from "../models/Customer";

export type TCustomersService = {
  findCustomer(filterQuery?: FilterQuery<TCustomer>): TFindCustomerQuery;
  findCustomers(filterQuery: FilterQuery<TCustomer>): TFindCustomersQuery;
  createCustomer(input: TCreateCustomerInput): Promise<TCustomer>;
};

export default (
  // @inject
  Customer: TCustomerModel
): TCustomersService => ({
  findCustomer(filterQuery) {
    return Customer.findOne(filterQuery);
  },
  findCustomers(filterQuery) {
    return Customer.find(filterQuery);
  },
  createCustomer(input) {
    return Customer.create(input);
  },
});

export type TFindCustomerQuery = ReturnType<TCustomerModel["findOne"]>;
export type TFindCustomersQuery = ReturnType<TCustomerModel["find"]>;
export type TCreateCustomerInput = Pick<TCustomer, "name">;
