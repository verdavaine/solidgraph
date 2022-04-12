import { Component, createEffect, createSignal, Show } from "solid-js";
import {
  useLoadingComplete,
  useMutation,
  useQuery,
  useWunderGraph,
} from "../lib/hooks";
import Spinner from "solidjs-material-spinner";

export interface QueryOptions {
  initialstate: boolean;
  lazy: boolean;
  refetchOnWindowFocus: boolean;
}
const LazyLoad: Component<QueryOptions> = ({
  lazy,
  initialstate,
  refetchOnWindowFocus,
}) => {
  const { user } = useWunderGraph();
  const messages = useQuery.Messages(
    initialstate
      ? {
          initialState: {
            data: {
              findManymessages: [
                {
                  id: 123456,
                  message: "initial message",
                  users: {
                    id: 1,
                    name: "webmaster",
                    email: "webmaster@solidgraph.ovh",
                  },
                },
              ],
            },
          },
          refetchOnWindowFocus,
        }
      : {
          lazy,
          refetchOnWindowFocus,
        }
  );
  const loading = useLoadingComplete(messages.response);
  const [message, setMessage] = createSignal<string>("");
  const { mutate: addMessage, response: messageAdded } = useMutation.AddMessage(
    { refetchMountedQueriesOnSuccess: false }
  );
  const [fectchQueriesOnSuccess, setFectchQueriesOnSuccess] =
    createSignal<boolean>(true);
  createEffect(() => {
    if (messageAdded().status === "ok") {
      setMessage("");
    } else if (messageAdded().status === "requiresAuthentication") {
      console.log("messageAdded : requiresAuthentication");
    }
  });
  return (
    <>
      <fieldset disabled={!user()}>
        <input
          type="text"
          placeholder="message"
          value={message()}
          onChange={(e) => setMessage(e.currentTarget.value)}
        />
        <button
          onClick={() =>
            addMessage({
              refetchMountedQueriesOnSuccess: fectchQueriesOnSuccess(),
              input: { message: message() },
            })
          }
        >
          submit
        </button>
        &nbsp;&nbsp;&nbsp;
        <label for="fetchOnFocus">Refetch queries on success</label>
        <input
          type="checkbox"
          id="fetchOnSuccess"
          checked
          onChange={(event) =>
            setFectchQueriesOnSuccess(event.currentTarget.checked)
          }
        />
      </fieldset>

      <div></div>
      <div>
        <Show
          when={user()}
          fallback={
            <div>
              <p>
                <em>Please Login on Home page to test mutation!</em>
              </p>
            </div>
          }
        >
          <></>
        </Show>
      </div>
      <br></br>
      <div>
        <Show
          when={loading()}
          fallback={<button onClick={() => messages.refetch()}>Refetch</button>}
        >
          <div>
            <Spinner radius={40} color="#08F" stroke={5} />
          </div>
        </Show>
        <br></br>
        <pre>{JSON.stringify(messages.response(), null, 2)}</pre>
      </div>
    </>
  );
};

export default LazyLoad;
