import "./style";
import { Component, render } from "preact";
import KeyboardEventHandler from "react-keyboard-event-handler";
import { prettyOutput, translateNumbers, addRandomNumber, init } from "./logic";
import _ from "lodash";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.board = addRandomNumber(init());
    this.state = {
      board: addRandomNumber(init())
    };
  }

  move = direction => {
    const { board } = this.state;

    const translatedBoard = translateNumbers(direction, board);
    const updatedBoard = _.isEqual(translatedBoard, board)
      ? board
      : addRandomNumber(translatedBoard);
    this.setState({
      board: updatedBoard
    });
  };

  render() {
    const { board } = this.state;
    const boardRows = prettyOutput(board);

    return (
      <div>
        {boardRows[0]}
        <br />
        {boardRows[1]}
        <br />
        {boardRows[2]}
        <br />
        {boardRows[3]}
        <KeyboardEventHandler
          handleKeys={["up", "down", "left", "right"]}
          onKeyEvent={key => this.move(key)}
        />
      </div>
    );
  }
}
if (typeof window !== "undefined") {
  render(<App />, document.getElementById("root"));
}
