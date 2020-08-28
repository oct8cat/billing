import { graphql, GraphQLSchema } from "graphql";
import path from "path";
import fs from "fs";
import { makeExecutableSchema } from "apollo-server";
import makeCtx, { TCtx } from "../../src/graphql/ctx";
import resolvers from "../../src/graphql/resolvers";

const typeDefsPath = path.resolve(__dirname, "../../src/graphql/typeDefs.graphql");

const typeDefs = fs.readFileSync(typeDefsPath, "utf-8");

export const schema = makeExecutableSchema({ typeDefs, resolvers });

export const ctx = makeCtx();

export const makeGQLExecutor = (schema: GraphQLSchema, ctx: TCtx) => async <D = any>(source: ESource, args?: any) => {
  const { errors, data } = await graphql<D>(schema, source, null, ctx, args);
  if (errors) throw errors[0];
  return data as D;
};

export const execGQL = makeGQLExecutor(schema, ctx);

export enum ESource {
  FIND_CUSTOMERS = `{
    findCustomers {
      data {
        id
        name
      }
    }
  }`,
  CREATE_CUSTOMER = `mutation($input: CreateCustomerInput!) {
    createCustomer(input: $input) {
      customer {
        id
        name
      }
    }
  }`,
}
