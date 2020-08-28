import { IFieldResolver } from "apollo-server";
import { TCtx } from "./ctx";

export type TResolver<A = {}, C = TCtx> = IFieldResolver<any, C, A>;

export const findCustomers: TResolver = async (_, __, ctx) => {
  const customers = await ctx.customersService.findCustomers({});
  return { data: customers };
};

export const createCustomer: TResolver<{ input: { name: string } }> = async (_, { input }, ctx) => {
  const customer = await ctx.customersService.createCustomer(input);
  return { customer };
};

export default {
  Query: {
    findCustomers,
  },
  Mutation: {
    createCustomer,
  },
};
