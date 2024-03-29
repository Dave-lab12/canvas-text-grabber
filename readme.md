# CanvasTextGrabber
**Extract text from web pages with intuitive drawing and highlighting**


## Demo
![demo](https://github.com/Dave-lab12/canvas-text-grabber/assets/56738450/2e5f1d7f-6507-4ef3-9945-878b1846f7d2)

## Features

- **Interactive Drawing:** Define the selection area by drawing freely on the screen.
- **Visual Highlighting:** Selected text elements are visually highlighted for clarity.
- **Enhanced Customization:** Adjust line style, canvas appearance, and text highlighting using CSS object types for full flexibility and type safety.
- **Callback Functions:** Get notified when drawing is finished and when text is selected.
- **Touch and Mouse Support:** Works seamlessly with both touch devices and mouse input.

## Installation

```bash
npm install canvas-text-grabber
```

## Usage

The latest update allows for more granular control over styles by using CSS object types. Here's how to customize your `CanvasTextGrabber` instance:

```javascript
import CanvasTextGrabber from 'canvas-text-grabber';

const grabber = new CanvasTextGrabber({
  canvasStyles: {
    border: "2px dashed blue",
    backgroundColor: "rgba(255, 255, 255, 0.5)"
  },
  selectedElementsStyle: {
    backgroundColor: "lightgreen"
  },
  // More customizable options...
});

// Initialize on a specific element or the entire document body
grabber.initialize(document.querySelector('.my-container')); 

// Listen for drawing completion and access selected elements
grabber.isDrawingFinished((selectedElements) => {
  console.log('Drawing completed. Selected elements:', selectedElements);
});

grabber.getSelectedText((text) => {
  console.log('Selected text:', text);
});
```

## Methods

- **initialize(element: HTMLElement | null):** Starts the text grabbing process on the specified element.
- **clearCanvas():** Clears the drawing on the canvas.
- **finishDrawing():** Finishes the text grabbing process and cleans up.
- **isDrawingFinished(callback: DrawingFinishedCallback):** Notifies when drawing is finished.
- **getSelectedText(callback: TextSelectedCallback):** Returns the selected text.

## Options

Styles now defined using CSS object types for enhanced customization and type safety:

```typescript
import type * as CSS from 'csstype';

interface Options {
  selectedElementsClass: string,
  selectedElementsStyle: Partial<CSS.Properties>,
  stokeStyle: string,
  lineWidth: number,
  lineCap: CanvasLineCap,
  canvasStyles: Partial<CSS.Properties>,
  canvasId: string,
  spanClass: string,
  spanWrapperClass: string,
  spanStyle: Partial<CSS.Properties>,
  spanWrapperStyle: Partial<CSS.Properties>
}
```

## Additional Notes

- **Temporary DOM Modification:** The library temporarily modifies the DOM to wrap text elements in spans for precise selection and restores the original DOM state afterward.
- **Browser Compatibility:** Tested in modern browsers; compatibility with older browsers may vary.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change. Please ensure to update tests as appropriate.

## License

MIT License
