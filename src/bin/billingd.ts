import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import apolloService from "../services/apolloService";
import resolvers from "../../src/graphql/resolvers";
import makeCtx from "../../src/graphql/ctx";

const typeDefsPath = path.resolve(__dirname, "../../src/graphql/typeDefs.graphql");
const typeDefs = fs.readFileSync(typeDefsPath, "utf-8");

const main = async () => {
  const port = process.env.PORT || 3000;
  const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/billing";
  const ctx = makeCtx();
  await mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
  await apolloService(typeDefs, resolvers, ctx).startApolloServer(+port);
  console.log(`Now running on http://localhost:${port}`);
};

if (require.main === module) {
  main();
}
