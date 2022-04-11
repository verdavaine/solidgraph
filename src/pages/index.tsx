import {
  Query,
  useLiveQuery,
  useMutation,
  useQuery,
  useWunderGraph,
} from "../lib/hooks";
import { createEffect, createSignal, For, Show } from "solid-js";
import { Component } from "solid-js";
import {
  MessagesResponse,
  UserInfoResponse,
} from "../../.wundergraph/generated/models";
import { ResponseOK } from "@wundergraph/sdk";
import { MessagesResponseData } from "../../components/generated/models";

type Messages = MessagesResponseData["findManymessages"];

const Chat: Component = () => {
  const {
    user,
    client: { login, logout, query },
  } = useWunderGraph();

  const [message, setMessage] = createSignal<string>("");

  const { mutate: addMessage, response: messageAdded } = useMutation.AddMessage(
    { refetchMountedQueriesOnSuccess: true }
  );
  const { response: loadMessages } = useLiveQuery.Messages({
    stopOnWindowBlur: false,
  });
  const [messages, setMessages] = createSignal<Messages>([]);

  const { response: userInfo } = useQuery.UserInfo({
    refetchOnWindowFocus: true,
  });

  createEffect(() => {
    if (loadMessages().status === "ok" || loadMessages().status == "cached") {
      setMessages(
        (
          (loadMessages() as ResponseOK<MessagesResponse>).body.data
            ?.findManymessages || []
        ).reverse()
      );
    }
    if (loadMessages().status === "requiresAuthentication") {
      console.log("Display messages requires Authentication");
      setMessages([]);
    }
  });
  createEffect(() => {
    if (messageAdded().status === "ok") {
      setMessage("");
    } else if (messageAdded().status === "requiresAuthentication") {
      console.log("messageAdded : requiresAuthentication");
    }
  });

  return (
    <>
      <h3>Add Message</h3>
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
              refetchMountedQueriesOnSuccess: true,
              input: { message: message() },
            })
          }
        >
          submit
        </button>
      </fieldset>

      <Show
        when={user()}
        fallback={
          <div>
            <p>
              <em>Please Login to be able to use the chat!</em>
            </p>
            <button onClick={() => login.github()}>Login GitHub</button>
          </div>
        }
      >
        <>
          <h3>User</h3>
          <fieldset>
            <table>
              <tbody>
                <tr>
                  <td>Name</td>
                  <td>{user()?.name}</td>
                </tr>
                <tr>
                  <td>Email</td>
                  <td>{user()?.email}</td>
                </tr>
                <tr>
                  <td>Roles</td>
                  <td>{JSON.stringify(user()?.roles)}</td>
                </tr>
                <tr>
                  <td>Last Login</td>
                  <Show
                    when={userInfo().status === "loading"}
                    fallback={
                      (userInfo().status === "ok" ||
                        userInfo().status === "cached") &&
                      (userInfo() as ResponseOK<UserInfoResponse>).body.data
                        ?.findFirstusers?.lastlogin && (
                        <td>
                          {
                            (userInfo() as ResponseOK<UserInfoResponse>).body
                              .data?.findFirstusers?.lastlogin
                          }
                        </td>
                      )
                    }
                  >
                    <td>loading...</td>
                  </Show>
                </tr>
              </tbody>
            </table>

            <button
              onClick={async () => {
                await logout();
                window.location.reload();
              }}
            >
              Logout
            </button>
          </fieldset>
        </>
      </Show>

      {messages() !== null && messages().length !== 0 && (
        <>
          <h3>Messages</h3>

          <fieldset>
            <table style={{ "column-width": "100px" }}>
              <colgroup>
                <col style="width: 15em" />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th>from</th>
                  <th>message</th>
                </tr>
              </thead>
              <tbody>
                <For each={messages()}>
                  {(message) => (
                    <tr>
                      <td>{message.users.name}</td>
                      <td>{message.message}</td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </fieldset>
        </>
      )}
    </>
  );
};

export default Chat;
