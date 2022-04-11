import { Router } from "solid-app-router";
import { render } from "solid-js/web";

import App from "./App";
import { WunderGraphProvider } from "./lib/provider";

const baseURL = import.meta.env.VITE_BASEURL;

render(
  () => (
    <WunderGraphProvider endpoint={baseURL}>
      <Router>
        <App />
      </Router>
    </WunderGraphProvider>
  ),
  document.getElementById("root") as HTMLElement
);
