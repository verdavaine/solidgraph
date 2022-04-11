import {
  Application,
  authProviders,
  configureWunderGraphApplication,
  cors,
  EnvironmentVariable,
  introspect,
  templates,
} from '@wundergraph/sdk'
import operations from './wundergraph.operations'
import server from './wundergraph.server'

const dbParams = {
  apiNamespace: "db",
  databaseURL: new EnvironmentVariable("DATABASE_URL"),
}

const db = process.env.TYPEDB == "postgresql" ? introspect.postgresql(dbParams): introspect.mysql(dbParams);
const countries = introspect.graphql({
  apiNamespace: "countries",
  url: "https://countries.trevorblades.com/",
});

const myApplication = new Application({
  name: 'api',
  apis: [countries, db],
})

// configureWunderGraph emits the configuration
configureWunderGraphApplication({
  application: myApplication,
  server,
  codeGenerators: [
    {
      templates: [
        templates.typescript.client,
        templates.typescript.inputModels,
        templates.typescript.jsonSchema,
        templates.typescript.linkBuilder,
        templates.typescript.operations,
        templates.typescript.responseModels,
      ],
    },
    {
      templates: [
          ...templates.typescript.react
      ],
      path: "../components/generated/",
    }  
  ],
  cors: {
    ...cors.allowAll,
    allowedOrigins:
      process.env.NODE_ENV === 'production'
        ? ['https://solidgraph.ovh']
        : ['http://localhost:3000'],
  },
  authorization: {
    roles: ['user', 'superadmin'],
  },
  authentication: {
    cookieBased: {
      providers: [
        process.env.NODE_ENV !== "production" ?
        authProviders.demo():
        authProviders.github({
          id: "github",
          clientId: new EnvironmentVariable("github_clientId"),
          clientSecret: new EnvironmentVariable("github_clientSecret")
        }),
      ],
      authorizedRedirectUris: ['http://localhost:3000','https://solidgraph.ovh'],
    },
  },
  operations,
  security: {
    enableGraphQLEndpoint: process.env.NODE_ENV !== "production",
    allowedHosts: ["api.solidgraph.ovh"]
  },
})
