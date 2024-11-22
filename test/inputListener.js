import { expect } from "chai";
import { MoveMessage, RotateMessage, DropMessage } from "../src/messages.js";
import { cellPixelSize } from "../src/constants.js";
import { keyHandler, mouseMoveHandler } from "../src/inputListener.js";

describe("Input listener", () => {
  describe("Mouse move handler", () => {
    it("Moving mouse to same position should not send message twice", () => {
      const messages = [];
      const messageListener = (message) => messages.push(message);
      const handler = mouseMoveHandler(messageListener);

      // simulate two mouse events in same column
      handler({ offsetX: 10 }); // Column 0
      handler({ offsetX: 20 }); // Still Column 0

      expect(messages).to.have.lengthOf(
        1,
        "Should only receive one message for same column"
      );
      expect(messages[0]).to.be.instanceOf(
        MoveMessage,
        "Should receive a MoveMessage"
      );
      expect(messages[0].getCol()).to.equal(
        0,
        "Message should be for column 0"
      );
    });

    it("Should compute correct column based on mouse position", () => {
      const messages = [];
      const messageListener = (message) => messages.push(message);
      const handler = mouseMoveHandler(messageListener);

      // Test multiple column positions
      const testPositions = [
        { offsetX: 0, expectedColumn: 0 }, // Start of column 0
        { offsetX: cellPixelSize, expectedColumn: 1 }, // Start of column 1
        { offsetX: cellPixelSize - 1, expectedColumn: 0 }, // End of column 0
        { offsetX: cellPixelSize * 2.5, expectedColumn: 2 }, // Middle of column 2
        { offsetX: cellPixelSize * 3.9, expectedColumn: 3 }, // End of column 3
      ];

      testPositions.forEach(({ offsetX, expectedColumn }) => {
        // Clear previous messages
        messages.length = 0;

        // Call handler directly with mock event
        handler({ offsetX });

        // Verify message
        expect(messages).to.have.lengthOf(
          1,
          `Should receive one message for position ${offsetX}`
        );
        expect(messages[0]).to.be.instanceOf(
          MoveMessage,
          "Should receive a MoveMessage"
        );
        expect(messages[0].getCol()).to.equal(
          expectedColumn,
          `Mouse at position ${offsetX} should map to column ${expectedColumn}`
        );
      });
    });
  });

  describe("Key handler", () => {
    it("Should send correct messages for arrow keys", () => {
      const messages = [];
      const messageListener = (message) => messages.push(message);
      const handler = keyHandler(messageListener);

      const testCases = [
        {
          key: "ArrowLeft",
          expectedMessage: new RotateMessage("left"),
          description: "left rotation",
        },
        {
          key: "ArrowRight",
          expectedMessage: new RotateMessage("right"),
          description: "right rotation",
        },
        {
          key: "ArrowDown",
          expectedMessage: new DropMessage(),
          description: "drop",
        },
      ];

      testCases.forEach(({ key, expectedMessage, description }) => {
        // Clear previous messages
        messages.length = 0;

        // Create mock event with preventDefault spy
        const mockEvent = {
          key,
          preventDefault: () => {},
        };

        // Handle key event
        handler(mockEvent);

        // Verify message
        expect(messages).to.have.lengthOf(
          1,
          `Should receive one message for ${description}`
        );
        expect(messages[0]).to.deep.equal(
          expectedMessage,
          `Should receive correct message for ${description}`
        );
      });
    });

    it("Should not send messages for non-arrow keys", () => {
      const messages = [];
      const messageListener = (message) => messages.push(message);
      const handler = keyHandler(messageListener);

      const nonArrowKeys = ["a", "Enter", "Escape", "Space"];

      nonArrowKeys.forEach((key) => {
        const mockEvent = {
          key,
          preventDefault: () => {},
        };

        handler(mockEvent);

        expect(messages).to.have.lengthOf(
          0,
          `Should not receive message for key ${key}`
        );
      });
    });
  });
});
