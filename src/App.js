import React from "react";
import "./App.css";

const katex = require("katex");

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ctrlDown: false,
      qDown: false,
      xDown: false,
      modifyCount: 0,
      content: "\\text{Welcome to }\\tmacs\\\\ 1+1=3\\\\ \\log_264=5",
      macros: [
        //TODO: Consider if these macros should actually be stored in component state. This doesn't seem like the brightest idea.
        //Macros for the katex editor, applied before rendering the math. tKatajisto
        { from: "#", to: "\\text", doInsideBrackets: true },
        { from: "*", to: "\\cdot ", doInsideBrackets: true },
        { from: "\\and", to: "\\land", doInsideBrackets: true },
        { from: "\\mot", to: "\\Box", doInsideBrackets: true },
        { from: "\\or", to: "\\lor", doInsideBrackets: true },
        //FIXME: If there is whitespace between closing and opening brackets it causes \frac{}_HERE_{} to fail.
        //HACK: Not a real fix for the issue. tKatajisto
        { from: "}\n{", to: "}{", doInsideBrackets: true },
        { from: "\\vec", to: "\\overline", doInsideBrackets: true },
        {
          from: "\\tmacs",
          to: "\\boxed{\\tt{Tmacs}}",
          doInsideBrackets: true
        },
        { from: "\n", to: "\\\\", doInsideBrackets: false }
      ],
      oldLen: 0,
      settings: false,
      showEditor: true,
      texFont: 20,
      doRenderKatex: true,
      cachedKatex: ""
    };
    this.handle = this.handle.bind(this);
    this.toggle = this.toggle.bind(this);
    this.toggleEditor = this.toggleEditor.bind(this);
    this.changeFont = this.changeFont.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleKeyup = this.handleKeyup.bind(this);
  }
  handleKeydown(event) {
    if (event.which == 17) this.setState({ ctrlDown: true });
    if (event.which == 81) this.setState({ qDown: true });
    if (event.which == 88) this.setState({ xDown: true });
    if (this.state.ctrlDown && this.state.qDown) {
      let expression = prompt("Enter math:");
      if (expression != "" && expression != null) alert(eval(expression));
      this.setState({
        ctrlDown: false,
        qDown: false
      });
    }
    if (this.state.ctrlDown && this.state.xDown) {
      this.setState({
        doRenderKatex: true,
        ctrlDown: false,
        xDown: false
      });
    }
    console.log();
  }
  handleKeyup(event) {
    if (event.which == 17) this.setState({ ctrlDown: false });
    if (event.which == 81) this.setState({ qDown: false });
    if (event.which == 88) this.setState({ xDown: false });
  }
  componentDidMount() {
    //NOTE: Load saved math. tKatajisto
    if (localStorage.savedMath) {
      this.setState({
        content: localStorage.savedMath,
        doRenderKatex: true
      });
    }
    //NOTE: This is a small calculator thingy wich prompts the user for an expression and returns the result as an alert. tKatajisto
    document.addEventListener("keydown", this.handleKeydown);
    document.addEventListener("keyup", this.handleKeyup);
    this.interval = setInterval(
      () => this.setState({ doRenderKatex: true }),
      3000
    );
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  //NOTE: Update function. tKatajisto
  handle(event) {
    let fieldVal = event.target.value;
    let newModifyCount;
    if (this.state.modifyCount >= 10) {
      localStorage.setItem("savedMath", fieldVal);
      newModifyCount = 0;
    } else {
      newModifyCount = this.state.modifyCount + 1;
    }
    this.setState({
      content: fieldVal,
      oldLen: fieldVal.length,
      modifyCount: newModifyCount
    });
  }
  //TODO: This might not be the best way to do this. tKatajisto
  //FIXME: runs for every macro seperately. *PERFORMANCE ISSUES INCOMING*
  handleMacro(macro, texString) {
    //TODO: Clean up these into something nicer.
    const mathText = texString;
    let textIdentifier = "\\text";
    let mathTextAfterMacro = "";
    let rBrackets = 0;
    let lBrackets = 0;
    let inTextBlock = false;
    let justStartedInTextBlock = false;
    //HACK: Modifying i inside the loop is probably not idea.
    for (let i = 0; i < mathText.length; i++) {
      if (i + macro.from.length > mathText.length) {
        mathTextAfterMacro += mathText.substring(
          i,
          i + Math.abs(i - mathText.length)
        );
        break;
      }
      if (mathText[i] === "{") lBrackets++;
      if (mathText[i] === "}") rBrackets++;
      if (inTextBlock) {
        if (justStartedInTextBlock) {
          if (mathText[i] === "{") {
            justStartedInTextBlock = false;
          }
        } else {
          if (lBrackets === rBrackets) {
            inTextBlock = false;
          }
        }
        mathTextAfterMacro += mathText[i];
        continue;
      }
      if (mathText.substring(i, i + textIdentifier.length) === textIdentifier) {
        i += textIdentifier.length - 1;
        mathTextAfterMacro += textIdentifier;
        inTextBlock = true;
        justStartedInTextBlock = true;
        continue;
      }
      if (mathText[i] === "{") lBrackets++;
      if (mathText[i] === "}") rBrackets++;
      if (!macro.doInsideBrackets && lBrackets === rBrackets) {
        if (mathText.substring(i, i + macro.from.length) === macro.from) {
          mathTextAfterMacro += macro.to;
          i += macro.from.length - 1;
          continue;
        }
      } else if (mathText.substring(i, i + macro.from.length) === macro.from) {
        mathTextAfterMacro += macro.to;
        i += macro.from.length - 1;
        continue;
      }
      mathTextAfterMacro += mathText[i];
    }
    return mathTextAfterMacro;
  }
  preprocess(tex) {
    let rdy = tex;
    this.state.macros.map(x => (rdy = this.handleMacro(x, rdy)));
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
    let math;
    if (this.state.doRenderKatex === true) {
      math = katex.renderToString(this.preprocess(this.state.content), {
        throwOnError: false
      });
      this.setState({
        doRenderKatex: false,
        cachedKatex: math
      });
    } else {
      math = this.state.cachedKatex;
    }
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
              spellCheck="false"
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
