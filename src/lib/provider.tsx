import { Client } from "../../components/generated/wundergraph.client";
import type { UserListener } from "@wundergraph/sdk";
import type { User } from "../../components/generated/wundergraph.server";

import {
  createContext,
  Component,
  createSignal,
  Accessor,
  Setter,
  onCleanup,
  onMount,
} from "solid-js";

export interface Config {
  client: Client;
  user: Accessor<User | undefined>;
  initialized: Accessor<boolean>;
  initializing: Accessor<boolean>;
  onWindowFocus: Accessor<Date>;
  onWindowBlur: Accessor<Date>;
  refetchMountedQueries: Accessor<Date>;
  setRefetchMountedQueries: Setter<Date>;
  queryCache: { [key: string]: Object };
}

export const WunderGraphContext = createContext<Config | undefined>();

export interface Props {
  endpoint?: string;
}

export const WunderGraphProvider: Component<Props> = (props) => {
  let onFocus = () => {},
    onBlur = () => {};
  const [user, setUser] = createSignal<User | undefined>();
  const [onWindowBlur, setOnWindowBlur] = createSignal(new Date());
  const [onWindowFocus, setOnWindowFocus] = createSignal(new Date());
  const [refetchMountedQueries, setRefetchMountedQueries] = createSignal(
    new Date()
  );
  const [initialized, setInitialized] = createSignal(false);
  const [initializing, setInitializing] = createSignal(false);
  const queryCache: { [key: string]: Object } = {};
  const client = new Client({ baseURL: props.endpoint });
  client.setLogoutCallback(() => {
    Object.keys(queryCache).forEach((key) => delete queryCache[key]);
  });
  const userListener: UserListener<User> = (userOrNull: User | null) => {
    if (userOrNull === null) {
      setUser(undefined);
    } else {
      setUser(userOrNull);
    }
  };
  client.setUserListener(userListener);
  (async () => {
    await client.fetchUser();
    setInitialized(true);
  })();
  onFocus = async () => {
    setInitializing(true);
    await client.fetchUser();
    setOnWindowFocus(new Date());
    setInitialized(true);
    setInitializing(false);
  };
  onBlur = () => {
    setInitialized(false);
    setOnWindowBlur(new Date());
  };
  onMount(() => {
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
  });
  onCleanup(() => {
    window.removeEventListener("focus", onFocus);
    window.removeEventListener("blur", onBlur);
  });
  return (
    <WunderGraphContext.Provider
      value={{
        client,
        user,
        initialized,
        initializing,
        onWindowBlur,
        onWindowFocus,
        refetchMountedQueries,
        setRefetchMountedQueries,
        queryCache,
      }}
    >
      {props.children}
    </WunderGraphContext.Provider>
  );
};
