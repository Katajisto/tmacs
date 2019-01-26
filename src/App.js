import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

const katex = require("katex");

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: "\\text{Welcome to Tmacs!}\\\\ 1+1=3\\\\ \\log_264=5",
      macros: [["*", "\\cdot "]],
      oldLen: 0,
      settings: false,
      showEditor: true,
      texFont: 20
    };
    this.handle = this.handle.bind(this);
    this.toggle = this.toggle.bind(this);
    this.toggleEditor = this.toggleEditor.bind(this);
    this.changeFont = this.changeFont.bind(this);
  }
  replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, "g"), replace);
  }
  handle(event) {
    let fieldVal = event.target.value;
    this.setState({
      content: fieldVal,
      oldLen: fieldVal.length
    });
  }
  preprocess(tex) {
    let rdy = tex;
    console.log(rdy);
    this.state.macros.map(x => (rdy = rdy.split(x[0]).join(x[1])));
    console.log(rdy);
    return rdy;
  }
  toggle() {
    this.setState({
      settings: !this.state.settings
    });
  }
  toggleEditor() {
    this.setState({
      showEditor: !this.state.showEditor
    });
  }
  changeFont(event) {
    this.setState({
      texFont: event.target.value
    });
  }
  render() {
    const math = katex.renderToString(this.preprocess(this.state.content), {
      throwOnError: false
    });
    return (
      <div>
        <div className="topBar">
          <h2 className="title">
            <i>Tmacs</i>
          </h2>
          <h4 className="title">By Tuomas Katajisto - t@ktj.st</h4>
        </div>
        <div className="settings">
          <button onClick={this.toggle}>
            {!this.state.settings ? "Show " : "Hide "}settings.
          </button>
          {this.state.settings && (
            <div>
              <input
                type="checkbox"
                checked={this.state.showEditor}
                onClick={this.toggleEditor}
                name="showEditor"
                value="editor"
              />
              Show editor
              <div class="slidecontainer">
                Font size:{" "}
                <input
                  onChange={this.changeFont}
                  type="range"
                  min="1"
                  max="100"
                  value={this.state.texFont}
                  class="slider"
                  id="myRange"
                />
              </div>
            </div>
          )}
        </div>
        <div className="container">
          {this.state.showEditor && (
            <textarea
              spellcheck="false"
              id="textArea"
              className="textArea"
              onChange={this.handle}
              value={this.state.content}
            />
          )}
          <div
            className="texArea"
            style={{ fontSize: this.state.texFont + "px" }}
            dangerouslySetInnerHTML={{ __html: math }}
          />
        </div>
      </div>
    );
  }
}

export default App;
