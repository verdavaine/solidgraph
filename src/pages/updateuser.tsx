import { useMutation, useWunderGraph } from "../lib/hooks";
import { Component, createEffect, createSignal, Show } from "solid-js";

const UpdateUser: Component = () => {
  const {
    user,
    client: { login },
  } = useWunderGraph();
  const [userName, setUserName] = createSignal<string>(user()?.name || "");
  const { mutate: changeName, response: newName } = useMutation.ChangeUserName({
    input: { newName: "" },
  });
  createEffect(() => {
    if (newName().status === "ok") {
      setUserName("");
      console.dir(newName());
    }
  });

  return (
    <fieldset disabled={!user()}>
      <label>
        <input
          style={{ width: "50%" }}
          type="text"
          value={userName()}
          onChange={(e) => setUserName(e.currentTarget.value)}
        />
      </label>

      <button
        style={{ width: "50%" }}
        onClick={() => changeName({ input: { newName: userName() } })}
      >
        Change user name
      </button>

      <Show when={!user()}>
        <p>
          <em>You must log in to change user name</em>
        </p>
      </Show>
    </fieldset>
  );
};

export default UpdateUser;
