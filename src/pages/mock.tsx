import { useWunderGraph, useQuery } from "../lib/hooks";
import { Component, Show } from "solid-js";
import { MockQueryResponse } from "../../.wundergraph/generated/models";
import { ResponseOK } from "@wundergraph/sdk";

const MockPage: Component = () => {
  const { response: mockQuery } = useQuery.MockQuery();
  return (
    <p>
      mock
      <Show
        when={mockQuery().status === "loading"}
        fallback={
          (mockQuery().status === "ok" || mockQuery().status === "cached") && (
            <pre>
              {JSON.stringify(
                (mockQuery() as ResponseOK<MockQueryResponse>).body.data || {},
                null,
                2
              )}
            </pre>
          )
        }
      >
        <td>loading...</td>
      </Show>
    </p>
  );
};

export default MockPage;
