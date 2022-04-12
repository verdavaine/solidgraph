import { Component } from "solid-js";
import { lazy } from "solid-js";
import { Routes, Route, Link } from "solid-app-router";
import styles from "../styles/App.module.css";
import Countries from "./pages/lazyload";

const Chat = lazy(() => import("./pages/index"));
const UpdateUser = lazy(() => import("./pages/updateuser"));
const AdminPage = lazy(() => import("./pages/admin/index"));
const TestQuery = lazy(() => import("./pages/testquery"));
const Mock = lazy(() => import("./pages/mock"));
const NotFound = lazy(() => import("./pages/[...all]"));

const App: Component = () => {
  return (
    <>
      <p>
        <a href="https://github.com/verdavaine/solidgraph" target="new">
          SolidGraph
        </a>{" "}
        lets you build apps with{" "}
        <a href="https://www.solidjs.com/" target="new">
          SolidJS
        </a>{" "}
        and{" "}
        <a href="https://wundergraph.com/" target="new">
          WunderGraph
        </a>
        <br></br>
        This real-time chat has been built with SolidGraph
        <br></br>
      </p>
      <nav class={styles.nav}>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/updateuser">Update User</Link>
          </li>
          <li>
            <Link href="/admin">Admin</Link>
          </li>
          <li>
            <Link href="/testquery">Test Query</Link>
          </li>
        </ul>
      </nav>
      <div class={styles.container}>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/updateuser" element={<UpdateUser />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/testquery" element={<TestQuery />} />
          <Route path="/mock" element={<Mock />} />
          <Route path="/*all" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
