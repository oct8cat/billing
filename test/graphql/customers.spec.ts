import assert from "assert";
import sinon from "sinon";
import { ESource, ctx, execGQL } from "./helpers";
import { TCustomer, Customer } from "../../src/models/Customer";

describe("graphql", () => {
  describe("findCustomers", () => {
    it("Finds customers", async () => {
      const customers = [new Customer(), new Customer()];
      sinon.stub(ctx.customersService, "findCustomers").resolves(customers);
      const data = await execGQL<{ findCustomers: { data: TCustomer[] } }>(ESource.FIND_CUSTOMERS);
      assert.strictEqual(customers.length, data.findCustomers.data.length);
    });
  });

  describe("createCustomer", () => {
    it("Creates customer", async () => {
      const customer = new Customer();
      sinon.stub(ctx.customersService, "createCustomer").resolves(customer);
      const data = await execGQL(ESource.CREATE_CUSTOMER, {
        input: { name: "alice" },
      });
      assert.strictEqual(customer.id, data.createCustomer.customer.id);
    });
  });
});
