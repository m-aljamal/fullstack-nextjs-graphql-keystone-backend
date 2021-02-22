import { ProductImage } from "./schemas/ProductImage";
import { Product } from "./schemas/Product";
import { createAuth } from "@keystone-next/auth";
import { User } from "./schemas/User";
import "dotenv/config";
import { config, createSchema } from "@keystone-next/keystone/schema";
import {
  withItemData,
  statelessSessions,
} from "@keystone-next/keystone/session";
import { insertSeedData } from "./seed-data";
const databaseURL = process.env.DATABASE_URL;
const sessionConfig = {
  maxAge: 60 * 60 * 24 * 30,
  secret: process.env.COOKIE_SECRET,
};

const { withAuth } = createAuth({
  listKey: `User`,
  identityField: `email`,
  secretField: "password",
  initFirstItem: {
    fields: ["name", "email", "password"],
  },
});

export default withAuth(
  config({
    server: {
      cors: {
        origin: [process.env.FRONTEND_URL],
        credentials: true,
      },
    },
    db: {
      adapter: "mongoose",
      url: databaseURL,
      // create data-seed of products
      async onConnect(keystone) {
        console.log("connected to database");
        if (process.argv.includes("--seed-data")) {
          await insertSeedData(keystone);
        }
      },
    },
    lists: createSchema({
      User,
      Product,
      ProductImage,
    }),
    ui: {
      isAccessAllowed: ({ session }) => {
        return !!session?.data;
      },
    },
    // here we can add middleware
    session: withItemData(statelessSessions(sessionConfig), {
      User: `id`,
    }),
  })
);
