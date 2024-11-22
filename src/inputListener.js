import { cellPixelSize } from "./constants.js";
import { DropMessage, RotateMessage, MoveMessage } from "./messages.js";

/**
 * Sets up all event listeners for user interactions:
 * - A click on the canvas or a key press on the down arrow will send a `DropMessage`.
 * - A movement of the mouse on the canvas will send a `MoveMessage` with the corresponding column.
 * - A key press on the left or right arrow will send a left or right `RotateMessage`.
 * @param canvas The canvas on which the game is drawn
 * @param messageListener The callback function handling the messages to be sent. It expects a `Message` as unique argument.
 */
export function setListeners(canvas, messageListener) {
  canvas.addEventListener("click", () => messageListener(new DropMessage()));
  canvas.addEventListener("mousemove", mouseMoveHandler(messageListener));
  document.addEventListener("keydown", keyHandler(messageListener));
}

export const mouseMoveHandler = (messageListener) => {
  // debounce messages to once per column
  let lastColumn = -1;
  return (event) => {
    const column = Math.floor(event.offsetX / cellPixelSize);
    if (column !== lastColumn) {
      messageListener(new MoveMessage(column));
      lastColumn = column;
    }
  };
};

export const keyHandler = (messageListener) => {
  return (event) => {
    // Prevent the default action to avoid scrolling the page
    if (["ArrowLeft", "ArrowRight", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
    }

    // Dispatch the message according to the key pressed
    switch (event.key) {
      case "ArrowLeft":
        messageListener(new RotateMessage("left"));
        break;
      case "ArrowRight":
        messageListener(new RotateMessage("right"));
        break;
      case "ArrowDown":
        messageListener(new DropMessage());
        break;
    }
  };
};
