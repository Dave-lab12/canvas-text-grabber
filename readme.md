# CanvasTextGrabber

**Extract text from web pages with intuitive drawing and highlighting**

## Features

- **Interactive drawing:** Define the selection area by drawing freely on the screen.
- **Visual highlighting:** Selected text elements are visually highlighted for clarity.
- **Customizable appearance:** Adjust line style, canvas appearance, and text highlighting to suit your preferences.
- **Callback functions:** Get notified when drawing is finished and when text is selected.
- **Touch and mouse support:** Works seamlessly with both touch devices and mouse input.

## Installation

```bash
npm install canvas-text-grabber
```

## Usage

```javascript
import CanvasTextGrabber from 'canvas-text-grabber';

const grabber = new CanvasTextGrabber({
  // Optional customization options here
});

// Initialize on a specific element or the entire document body
grabber.initialize(document.querySelector('.my-container')); 

// Listen for drawing finished and text selection events
grabber.isDrawingFinished((finished) => {
  if (finished) {
    console.log('Drawing finished!');
  }
});

grabber.getSelectedText((text) => {
  console.log('Selected text:', text);
});
```

## Methods

- **initialize(element: HTMLElement | null):** Starts the text grabbing process on the specified element.
- **clearCanvas():** Clears the drawing on the canvas.
- **finishDrawing():** Finishes the text grabbing process and cleans up.
- **isDrawingFinished(callback: DrawingFinishedCallback):** Calls the provided callback when drawing is finished.
- **getSelectedText(callback: TextSelectedCallback):** Calls the provided callback with the selected text.

## Options

```typescript
interface Options {
  // ... customization options
}
```

## Additional Notes

- **Temporary DOM modification:** The library temporarily modifies the DOM to wrap text elements in spans for precise selection. It restores the original DOM state after finishing.
- **Browser compatibility:** Tested in modern browsers; compatibility with older browsers may vary.

## Contributing

Pull requests are welcome! Please refer to the contribution guidelines for more details.

## License

MIT License
