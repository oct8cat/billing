import supertest from "supertest";
import makeApolloService from "../../src/services/apolloService";

const typeDefs = `type Query { noop: String }`;
const resolvers = {};
const apolloService = makeApolloService(typeDefs, resolvers);

describe("services", () => {
  describe("apolloService", () => {
    describe("startApolloServer", () => {
      it("Starts Apollo server", async () => {
        const { server } = await apolloService.startApolloServer(3000);
        const query = `{ noop }`;
        await supertest("http://localhost:3000")
          .post("/graphql")
          .send({ query })
          .expect(200, { data: { noop: null } });
        await new Promise((resolve) => server.close(resolve));
      });
    });
  });
});
