import React from "react";
import ReactDOM from "react-dom";
import Loadable from "react-loadable";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import registerServiceWorker from "./registerServiceWorker";

const AppBundle = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// Checking for hot module replacement
// !module.hot
//   ? ReactDOM.render(AppBundle, document.getElementById("root"))
//   :
// window.onload = () => {

// };
Loadable.preloadReady().then(() => {
  ReactDOM.hydrate(AppBundle, document.getElementById("root"));
});
const displayToastFunc = message => {
  ReactDOM.render(
    <div className="newUpdateWrapper">
      New Version is available
      <a href={window.location.href} className="refreshContent">
        REFRESH
      </a>
      <span className="closeToast">x</span>
    </div>,
    document.getElementById("service-worker-toast-root")
  );
  // setTimeout(() => {
  //   document.getElementById("service-worker-toast-root").innerHTML = "";
  // }, 4000);
};
try {
  registerServiceWorker(displayToastFunc);
} catch (e) {
  console.log(e.message);
}
