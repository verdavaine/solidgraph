import { Component, createEffect, Show } from "solid-js";
import { useLoadingComplete, useQuery } from "../lib/hooks";
import Spinner from "solidjs-material-spinner";

const LazyLoad: Component = () => {
  const messages = useQuery.Messages({
    /*initialState: {
      data: {
        findManymessages: [
          {
            id: 123456,
            message: "premier message",
            users: {
              id: 1,
              name: "vdvn",
              email: "rv@hotmail.com",
            },
          },
        ],
      },
    },*/
    //refetchOnWindowFocus: true,
    lazy: true,
  });
  const loading = useLoadingComplete(messages.response);

  return (
    <div>
      <pre>{JSON.stringify(messages.response(), null, 2)}</pre>
      <Show
        when={loading()}
        fallback={<button onClick={() => messages.refetch()}>lazyLoad</button>}
      >
        <div>
          <Spinner radius={40} color="#08F" stroke={5} />
        </div>
      </Show>
    </div>
  );
};

export default LazyLoad;
