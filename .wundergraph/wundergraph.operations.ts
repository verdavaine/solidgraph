import {configureWunderGraphOperations} from "@wundergraph/sdk";
import type { OperationsConfiguration } from "./generated/wundergraph.operations";

const disableAuth = <Configs extends OperationsConfiguration>(config: Configs): Configs => {
  return {
    ...config,
    authentication: {
      required: false,
    },
  }
}

const enableAuth  = <Configs extends OperationsConfiguration>(config: Configs): Configs => {
  return {
    ...config,
    authentication: {
      required: true,
    },
  }
}

export default configureWunderGraphOperations<OperationsConfiguration>({
  operations: {
      defaultConfig: {
          authentication: {
              required: false
          }
      },
      queries: config => ({
          ...config,
          caching: {
              enable: false,
              staleWhileRevalidate: 60,
              maxAge: 60,
              public: true
          },
          liveQuery: {
              enable: true,
              pollingIntervalSeconds: 1,
          }
      }),
      mutations: config => ({
          ...config,
      }),
      subscriptions: config => ({
          ...config,
      }),
      custom: {
        //Requires to be logged to load messages
        //Messages: enableAuth        
      }
  }
});