import {configureWunderGraphServer} from "@wundergraph/sdk";
import type {HooksConfig} from "../components/generated/wundergraph.hooks";
import type {InternalClient} from "../components/generated/wundergraph.internal.client";
import {GraphQLObjectType, GraphQLSchema, GraphQLString} from "graphql";
import type {GraphQLExecutionContext} from "../components/generated/wundergraph.server";

const superAdmins = [
  'paul75011@gmail.com',
  "jens@wundergraph.com",
  // replace or add your own github email address
  // to make yourself a super admin as well
]

export default configureWunderGraphServer<HooksConfig, InternalClient>((serverContext) => ({
    hooks: {
      authentication: {
        postAuthentication: async (user) => {
          if (user.email) {
            try {
              await serverContext.internalClient.mutations.SetLastLogin({ email: user.email })
            } catch (e) {
              console.log(e)
            }
          }
        },
        mutatingPostAuthentication: async (user) => {
          if (!user.email) {
            return {
              status: 'deny',
              message: "No email address provided"
            }
          }
    
          if (superAdmins.find((s) => s === user.email) !== undefined) {
            return {
              status: 'ok',              
              user: {
                ...user,
                roles: ['user', 'superadmin'],
              },
            }
          }
    
          return {
            status: 'ok',
            user: {
              ...user,
              roles: ['user'],
            },
          }
        },
      },
      queries: {
        MockQuery: {
          mockResolve: async () => {
            return {
              data: {
                findFirstusers: {
                  id: 1,
                  email: 'webmaster@solidgraph.ovh',
                  name: 'Hervé',
                },
              },
            }
          },
        },
      },
      mutations: {},
    }, 
    graphqlServers: [
      {
          apiNamespace: "gql",
          serverName: "gql",
          enableGraphQLEndpoint: true,
          schema: new GraphQLSchema({
              query: new GraphQLObjectType<any, GraphQLExecutionContext>({
                  name: 'RootQueryType',
                  fields: {
                      hello: {
                          type: GraphQLString,
                          resolve(root, args, ctx) {
                            ctx.log.info(`headers: ${JSON.stringify(ctx.requestContext.clientRequest.headers)}`);
                            return ctx.requestContext.clientRequest.headers["User-Agent"] || "world";
                        }
                      },
                  },
              }),
          })
      }
  ],
}));

