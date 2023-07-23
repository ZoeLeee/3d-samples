import { useEffect, useRef } from "react";
import "./App.css";
import { BabylonCanvas } from "./components/babylon-canvas";
import { initThreejs } from "./engine/initThree";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Root from "./view/Root";
import ErrorPage from "./view/ErrorPage";
import Contact from "./view/Test";
import "./shaders";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "contacts/:contactId",
        element: <Contact />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
