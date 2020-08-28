import { ApolloServer, Config } from "apollo-server";

export type TApolloService = {
  startApolloServer(port?: number): ReturnType<ApolloServer["listen"]>;
};

export default (
  // @inject
  typeDefs: Config["typeDefs"],
  resolvers: Config["resolvers"]
): TApolloService => ({
  startApolloServer(port = 3000) {
    const apolloServer = new ApolloServer({ typeDefs, resolvers });
    return apolloServer.listen(port);
  },
});
