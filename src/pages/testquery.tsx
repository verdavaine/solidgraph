import { Component, createEffect, createSignal, Match, Switch } from "solid-js";
import LazyLoad, { QueryOptions } from "./lazyload";

const TestQuery: Component = () => {
  const options: QueryOptions = {
    lazy: true,
    initialstate: false,
    refetchOnWindowFocus: false,
  };

  const [choice, setChoice] = createSignal(1);
  const [fetchOnFocus, setFectchOnFocus] = createSignal(3);

  return (
    <>
      <p>Initial conditions:</p>
      <div>
        <input
          type="radio"
          id="lazyload"
          name="init"
          onChange={() => setChoice(1)}
          checked
        />
        <label for="lazyload">Lazy Load</label>
      </div>
      <div>
        <input
          type="radio"
          id="initialstate"
          name="init"
          onChange={() => setChoice(2)}
        />
        <label for="initialstate">Inital State</label>
      </div>
      <div>
        <input
          type="radio"
          id="none"
          name="init"
          onChange={() => setChoice(3)}
        />
        <label for="none">None</label>
      </div>
      <br></br>
      <div>
        <label for="fetchOnFocus">Refetch on window focus</label>
        <input
          type="checkbox"
          id="fetchOnFocus"
          checked
          onChange={(event) =>
            setFectchOnFocus(event.currentTarget.checked ? 3 : 0)
          }
        />
      </div>
      <br></br>

      <Switch>
        <Match when={choice() + fetchOnFocus() == 1}>
          <LazyLoad
            lazy={true}
            initialstate={false}
            refetchOnWindowFocus={false}
          />
        </Match>
        <Match when={choice() + fetchOnFocus() == 2}>
          <LazyLoad
            lazy={false}
            initialstate={true}
            refetchOnWindowFocus={false}
          />
        </Match>
        <Match when={choice() + fetchOnFocus() == 3}>
          <LazyLoad
            lazy={false}
            initialstate={false}
            refetchOnWindowFocus={false}
          />
        </Match>
        <Match when={choice() + fetchOnFocus() == 4}>
          <LazyLoad
            lazy={true}
            initialstate={false}
            refetchOnWindowFocus={true}
          />
        </Match>
        <Match when={choice() + fetchOnFocus() == 5}>
          <LazyLoad
            lazy={false}
            initialstate={true}
            refetchOnWindowFocus={true}
          />
        </Match>
        <Match when={choice() + fetchOnFocus() == 6}>
          <LazyLoad
            lazy={false}
            initialstate={false}
            refetchOnWindowFocus={true}
          />
        </Match>
      </Switch>
    </>
  );
};

export default TestQuery;
