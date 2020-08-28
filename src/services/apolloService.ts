import { ApolloServer, Config } from "apollo-server";
import { TCtx } from "../graphql/ctx";

export type TApolloService = {
  startApolloServer(port?: number): ReturnType<ApolloServer["listen"]>;
};

export default (
  // @inject
  typeDefs: Config["typeDefs"],
  resolvers: Config["resolvers"],
  ctx: TCtx
): TApolloService => ({
  startApolloServer(port = 3000) {
    const apolloServer = new ApolloServer({ typeDefs, resolvers, context: ctx });
    return apolloServer.listen(port);
  },
});
