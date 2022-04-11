import { useMutation, useQuery, useWunderGraph } from "../../lib/hooks";
import { Component, createEffect, createSignal, For, Show } from "solid-js";
import { ResponseOK, User } from "@wundergraph/sdk";
import {
  DeleteAllMessagesByUserEmailResponse,
  MessagesResponse,
} from "../../../.wundergraph/generated/models";
import { MessagesResponseData } from "../../../components/generated/models";

type Aggregation = [string, number][];
type Messages = MessagesResponseData["findManymessages"];

const getMessagesByUser = (messages: Messages = []) => {
  let result: Aggregation = Object.entries(
    messages.reduce((res: any, { users }) => {
      return {
        ...res,
        [users.email]: (res[users.email] || 0) + 1,
      };
    }, {})
  );
  return result;
};

const AdminPage: Component = () => {
  const { user } = useWunderGraph();
  const [email, setEmail] = createSignal<string>("");
  const { response: loadMessages } = useQuery.Messages({
    refetchOnWindowFocus: true,
  });
  const [messages, setMessages] = createSignal<Messages>([]);
  createEffect(() => {
    if (loadMessages().status === "ok" || loadMessages().status == "cached") {
      setMessages(
        (loadMessages() as ResponseOK<MessagesResponse>).body.data
          ?.findManymessages || []
      );
    }
    if (loadMessages().status === "requiresAuthentication") {
      console.log("Messages requiresAuthentication");
      setMessages([]);
    }
  });
  const { mutate: deleteAllMessagesFrom, response: deletedMessages } =
    useMutation.DeleteAllMessagesByUserEmail({
      refetchMountedQueriesOnSuccess: true,
    });
  const disabled = () =>
    user() ? !user()!.roles!.includes("superadmin") : true;
  createEffect(() => setEmail(user()?.email || ""));
  const messageAggregation = () => getMessagesByUser(messages());

  return (
    <div>
      <h1>Admin</h1>

      <h2>Delete all messages by user email</h2>
      <fieldset disabled={disabled()}>
        <label>
          <input
            style={{ width: "50%" }}
            type="email"
            value={email()}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
        </label>

        <button
          style={{ width: "50%" }}
          onClick={() => deleteAllMessagesFrom({ input: { email: email() } })}
        >
          Delete all messages by user email
        </button>

        <Show when={disabled()}>
          <p>
            <em>Only superadmin users can delete other users messages</em>
          </p>
        </Show>

        <Show when={deletedMessages().status === "ok"}>
          <p>
            <em>{`deleted: ${
              (
                deletedMessages() as ResponseOK<DeleteAllMessagesByUserEmailResponse>
              ).body.data?.deleteManymessages?.count
            } messages`}</em>
          </p>
        </Show>
      </fieldset>

      <h2>Messages By User</h2>
      <fieldset style={{ display: "flex", "flex-direction": "column" }}>
        <Show
          when={disabled()}
          fallback={
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Message Count</th>
                </tr>
              </thead>
              <tbody>
                <For each={messageAggregation()}>
                  {([email, count]) => (
                    <tr>
                      <td>{email}</td>
                      <td>{count}</td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          }
        >
          <p>
            <em>Only superadmin users can see other users Email</em>
          </p>
        </Show>
      </fieldset>
    </div>
  );
};

export default AdminPage;
