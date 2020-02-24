import express from "express";
import compression from "compression";
import path from "path";
import React from "react";
import { Provider } from "react-redux";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";

import Loadable from "react-loadable";
import { getBundles } from "react-loadable-ssr-addon";
import AppContainer from "./src/AppContainer";
import store from "./src/configureStore";

import fs from "fs";
import { Helmet } from "react-helmet";
import { matchRoutes } from "react-router-config";
import Routes from "./src/Route";
import cloneDeep from "lodash.clonedeep";
import { SPP_ROUTE } from "./src/Utils/RouteUrl";
import { isArabicLanguageUrl } from "./src/Utils/UserAgent";
import emptyCloneStore from "./src/SsrConfigureStore";
import { GET_BASE_URL_REG_EX } from "./src/Utils/RouteUrl";

const BASE_PATH = process.env.BASE_PATH;

const PORT = process.env.PORT ? process.env.PORT : 3000;
const PORT_SSL = process.env.PORT_SSL ? process.env.PORT_SSL : 3443;
const manifest = require("./dist/react-loadable-ssr-addon.json");

const server = express();
const https = require("https");
const http = require("http");

const jsAndCssBasePath = process.env.JS_CSS_CDN_PATH
  ? process.env.JS_CSS_CDN_PATH
  : "";
var options = {};
if (process.env.STAGE == "production") {
  options = {
    key: fs.readFileSync("/etc/ssl/private/selfsigned.key"),
    cert: fs.readFileSync("/etc/ssl/certs/selfsigned.crt")
  };
}

server.use(function(req, resp, next) {
  if (req.headers["x-forwarded-proto"] == "http") {
    return resp.redirect(301, "https://" + req.headers.host + "/");
  } else {
    return next();
  }
});

server.use(compression());
server.use(function(req, res, next) {
  req.url = req.url.replace(BASE_PATH, "/");
  if (req.url.includes("index.html")) {
    req.url = req.url.replace("index.html", "");
  }

  next();
});
server.use(
  `/robots.txt`,
  express.static(path.join(__dirname, "public/robots.txt"))
);
server.use(
  `/sitemap.xml`,
  express.static(path.join(__dirname, "public/sitemap.xml"))
);
server.use(
  `/manifest.json`,
  express.static(path.join(__dirname, "public/manifest.json"))
);
server.use(
  `/favicon.ico`,
  express.static(path.join(__dirname, "public/favicon.ico"))
);
server.use(`/icon`, express.static(path.join(__dirname, "public/icon/")));

server.use(`/assets`, express.static(path.join(__dirname, "public/assets/")));

// server.use(`/index.html`, express.static(path.join(__dirname, "dist")));

server.get("*.js", function(req, res, next) {
  if (req.url !== "/service-worker.js") {
    let url = req.url.split("?");
    let gipVersionFile = "/dist" + url[0] + ".gz";
    if (fs.existsSync(__dirname + gipVersionFile)) {
      req.url = gipVersionFile + "?" + url[1];
      res.set("Content-Encoding", "gzip");
    } else {
      req.url = "/dist" + req.url;
    }
  } else {
    req.url = "/dist" + req.url;
  }
  res.set("Content-Type", "application/javascript");
  next();
});

server.get("*.css", function(req, res, next) {
  // let url = req.url.split("?");
  // let gipVersionFile = "/dist" + url[0] + ".gz";
  // if (fs.existsSync(__dirname + gipVersionFile)) {
  //   req.url = gipVersionFile + "?" + url[1];
  //   res.set("Content-Encoding", "gzip");
  // } else {
  req.url = "/dist" + req.url;
  // }
  next();
});
server.use("/dist", express.static(path.join(__dirname, "dist")));

if (typeof localStorage === "undefined") {
  global.localStorage = {};
}

server.get("*", async (req, res) => {
  global.navigator = {
    userAgent: req.headers["user-agent"]
  };
  const countryCode = req.headers["cf-ipcountry"];
  let storeObj;
  const userAgent = req.headers["user-agent"];

  const isBot = true;

  var isChrome = /Chrome/.test(userAgent);

  storeObj = cloneDeep(store);

  // }
  //  need to fix this later
  if (typeof fetch !== "function") {
    global.fetch = require("node-fetch-polyfill");
  }
  global.window = {
    location: {
      pathname: req.url,
      search: req.url.split("?")[1],
      href: `${req.headers.host}${req.url}`,
      host: req.headers.host
    },
    isBot
  };
  global.document = {
    cookie: {}
  };
  const filePath = path.resolve(__dirname, "dist/index.html");
  fs.readFile(filePath, "utf8", async (err, htmlData) => {
    let localBaseUrlForInternalRouting = req.url.match(GET_BASE_URL_REG_EX)[0];
    let BASE_URL = localBaseUrlForInternalRouting;
    if (localBaseUrlForInternalRouting !== "/") {
      BASE_URL = localBaseUrlForInternalRouting.replace(/\/$/, "");
    } else {
      BASE_URL = "";
    }
    if (err) {
      console.error("err", err);
      return res.status(404).end();
    }

    const actionsTemp = matchRoutes(
      Routes,
      req.path.replace(localBaseUrlForInternalRouting, "/")
    ).map(({ route }) => {
      return !route.component.preload
        ? route.component
        : isBot
        ? route.component.preload().then(res => res.default)
        : route.component;
    });

    const loadedActions = await Promise.all(actionsTemp);

    const actions = loadedActions
      .map(component => {
        return isBot && component.fetching
          ? component.fetching({
              ...storeObj,
              path: req.path.replace(localBaseUrlForInternalRouting, "/")
            })
          : null;
      })
      .map(
        async actions =>
          await Promise.all(
            (actions || []).map(
              p => p && new Promise(resolve => p.then(resolve).catch(resolve))
            )
          )
      );

    await Promise.all(actions);
    const modules = new Set();
    const html = renderToString(
      <Loadable.Capture report={moduleName => modules.add(moduleName)}>
        <Provider store={isBot ? storeObj : emptyCloneStore}>
          <StaticRouter location={req.url} context={{}} basename={BASE_URL}>
            <AppContainer />
          </StaticRouter>
        </Provider>
      </Loadable.Capture>
    );

    const helmet = Helmet.renderStatic();
    const bundles = getBundles(manifest, [
      ...manifest.entrypoints,
      ...Array.from(modules)
    ]);

    const styles = bundles.css || [];
    const scripts = bundles.js || [];

    let css;
    if (isBot) {
      css = await Promise.all(
        styles.map(file => {
          const cssFile = fs.readFileSync(`./dist/${file.file}`, "utf-8");
          return cssFile.replace(/'/g, "");
        })
      );
    }

    return res.send(
      htmlData
        .replace(
          "<link/>",
          !isBot
            ? styles
                .map(style => {
                  if (isChrome) {
                    return `<link rel="preload" type="text/css" href="${jsAndCssBasePath}${BASE_PATH}${
                      style.file
                    }"   as="style" onload="if(rel!='stylesheet')rel='stylesheet'"></link>`;
                  }
                  return `<link  rel="stylesheet" type="text/css" href="${jsAndCssBasePath}${BASE_PATH}${
                    style.file
                  }" ></link>`;
                })
                .join("\n")
            : `<style>${css.join("")}</style>`
        )
        .replace(
          `<html>`,
          isArabicLanguageUrl()
            ? `<html lang="ar" dir="rtl">`
            : `<html lang="en" dir="ltr">`
        )
        .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
        .replace(
          "</head>",
          scripts
            .map(script => {
              return `<script defer="defer" type="text/javascript" src="${jsAndCssBasePath}${BASE_PATH}${
                script.file
              }"  ></script>`;
            })
            .join("\n") +
            `<script>window.INITIAL_STATE = ${
              isBot ? JSON.stringify(storeObj.getState()) : ""
            }
            window.countryCode = ${JSON.stringify(countryCode)}
          </script>` +
            "</head>"
        )
        .replace(
          "<title>TLC</title>",
          helmet.title.toString() == '<title data-react-helmet="true"></title>'
            ? "<title>TLC</title>"
            : helmet.title.toString()
        )
        .replace(
          "<meta/>",
          `${helmet.meta.toString()}\n${helmet.link.toString()}`
        )
    );
  });
});
Loadable.preloadAll()
  .then(() => {
    http.createServer(server).listen(PORT, () => {
      console.log(`Running on http://localhost:${PORT}/`);
    });
    if (process.env.STAGE == "production") {
      https.createServer(options, server).listen(PORT_SSL, () => {
        console.log(`Running on https://localhost:${PORT_SSL}/`);
      });
    }
  })
  .catch(err => {
    console.log(err);
  });
