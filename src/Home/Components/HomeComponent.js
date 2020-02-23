import React from "react";
import { Helmet } from "react-helmet";

function HomeComponent() {
  const renderSeoTags = () => {
    return (
      <Helmet>
        <title>dishServe</title>
        <meta name="description" content="Taste is good" />
        <meta
          property="og:title"
          content="short title of your website/webpage"
        />
        <meta property="og:url" content="https://www.example.com/webpage/" />
        <meta
          property="og:description"
          content="description of your website/webpage"
        />
      </Helmet>
    );
  };
  return (
    <div className="App">
      {renderSeoTags()}
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default HomeComponent;
