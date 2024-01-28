type Options = {
    selectedElementsClass: string,
    selectedElementsStyle: string,
    stokeStyle: string,
    lineWidth: number,
    lineCap: CanvasLineCap,
    canvasStyle: string,
    canvasId: string,
    spanClass: string,
    spanWrapperClass: string,
    spanStyle: string,
    spanWrapperStyle: string
}
type DrawingFinishedCallback = (finished: boolean) => void;
type TextSelectedCallback = (text: string | undefined) => void;

export class CanvasTextGrabber {
    private isDrawing = false;
    canvas: HTMLCanvasElement | null = null;
    ctx: CanvasRenderingContext2D | null = null;
    container: HTMLElement | null = null;
    boundingRect: { left: number; top: number; width: number; height: number; } = { height: 0, left: 0, top: 0, width: 0 };
    selectionArea = { startX: 0, startY: 0, endX: 0, endY: 0 };
    private originalNodeClone: Node | null = null;

    private boundResizeCanvas: ((event: UIEvent) => void) | null = null;
    private boundStartDrawing: ((event: MouseEvent | TouchEvent) => void) | null = null;
    private boundDraw: ((event: MouseEvent | TouchEvent) => void) | null = null;
    private boundStopDrawing: ((event: MouseEvent | TouchEvent) => void) | null = null;

    private onDrawingFinishedCallback: DrawingFinishedCallback | null = null;
    private onTextSelectedCallback: TextSelectedCallback | null = null;

    private drawnPath: { x: number; y: number; }[] = [];
    private options: Options = {
        selectedElementsClass: "highlighted",
        selectedElementsStyle: "background-color:yellow;",
        stokeStyle: "red",
        lineWidth: 10,
        lineCap: "round",
        canvasStyle: "border:10px solid red;position:absolute;top:0;left:0;zIndex:10",
        canvasId: "IS-canvas",
        spanClass: "text-span",
        spanStyle: "",
        spanWrapperClass: "span-wrapper-div",
        spanWrapperStyle: "display:inline;"
    }

    constructor(options?: Partial<Options>) {
        this.options = { ...this.options, ...options };
        this.boundResizeCanvas = this.resizeCanvas.bind(this);
        this.boundStartDrawing = this.startDrawing.bind(this);
        this.boundDraw = this.draw.bind(this);
        this.boundStopDrawing = this.stopDrawing.bind(this);
    }

    private drawCanvas(element: HTMLElement) {
        const canvas = document.createElement('canvas');
        canvas.id = this.options.canvasId;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.cssText = this.options.canvasStyle;
        document.body.style.overflow = 'hidden';

        element ? element.appendChild(canvas) : document.body.appendChild(canvas);
        return canvas;
    }

    private resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.height = window.innerHeight;
        this.canvas.width = window.innerWidth;
    }

    private getEventCoordinates(event: TouchEvent | MouseEvent) {
        if (!this.canvas) return { offsetX: 0, offsetY: 0 };
        let offsetX, offsetY;
        if ('touches' in event) {
            // Handle touch events
            offsetX = event.touches[0].clientX - this.canvas.getBoundingClientRect().left;
            offsetY = event.touches[0].clientY - this.canvas.getBoundingClientRect().top;
        } else {
            // Handle mouse events
            offsetX = event.offsetX;
            offsetY = event.offsetY;
        }
        return { offsetX, offsetY };
    }

    private startDrawing(event: TouchEvent | MouseEvent) {
        event.preventDefault();

        this.isDrawing = true;

        const { offsetX, offsetY } = this.getEventCoordinates(event);
        this.drawnPath = [{ x: offsetX, y: offsetY }];
        this.ctx?.beginPath();
        this.ctx?.moveTo(offsetX, offsetY);
        this.ctx && (this.ctx.lineWidth = this.options.lineWidth);
        this.ctx && (this.ctx.lineCap = this.options.lineCap);
        this.ctx && (this.ctx.strokeStyle = this.options.stokeStyle);
    }

    private wrapTextWithSpan(element: HTMLElement) {
        const childNodes = Array.from(element.childNodes);
        if (childNodes.length === 0) return;
        for (const child of childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
                const text = child.nodeValue;
                if (!text) return;
                const spans = text
                    .split(/\s+/)
                    .filter((word: string) => word.length > 0)
                    .map((word: string) => `<span class=${this.options.spanClass} style=${this.options.spanStyle}>${word}</span>`)
                    .join(' ');

                const spanWrapper = document.createElement('div');
                this.options.spanWrapperStyle && (spanWrapper.style.cssText = this.options.spanWrapperStyle);

                spanWrapper.classList.add(this.options.spanWrapperClass);
                spanWrapper.innerHTML = spans;
                element.replaceChild(spanWrapper, child);
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                this.wrapTextWithSpan(child as HTMLElement);
            }
        }
    }

    private draw(event: TouchEvent | MouseEvent) {
        event.preventDefault();
        if (!this.isDrawing) return;
        const { offsetX, offsetY } = this.getEventCoordinates(event);
        this.drawnPath.push({ x: offsetX, y: offsetY });

        this.ctx?.lineTo(offsetX, offsetY);
        this.ctx?.stroke();
    }

    private getTextFromDomElements(selectedElements: Element[] | undefined) {
        if (!selectedElements) return;
        const elements = Array.from(selectedElements);
        if (elements.length === 0) return;
        return elements.map((el) => el.textContent).join(' ');
    }

    private saveCurrentDomState() {
        if (!this.container) return;
        this.originalNodeClone = this.container.cloneNode(true);
    }

    private restoreDomState() {
        if (!this.container) return;
        this.originalNodeClone && this.container.replaceWith(this.originalNodeClone);
    }

    private isElementInsideArea(element: Element, area: typeof this.boundingRect) {
        if (!this.canvas) return;
        const rect = element.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();

        // Calculate the position of the element relative to the canvas
        const elLeft = rect.left - canvasRect.left;
        const elRight = rect.right - canvasRect.left;
        const elTop = rect.top - canvasRect.top;
        const elBottom = rect.bottom - canvasRect.top;

        // Check if the element is inside the bounding rectangle
        return (
            elLeft < area.left + area.width &&
            elRight > area.left &&
            elTop < area.top + area.height &&
            elBottom > area.top
        );
    }

    private calculateBoundingRectangle() {
        const xs = this.drawnPath.map((p) => p.x);
        const ys = this.drawnPath.map((p) => p.y);
        this.boundingRect = {
            left: Math.min(...xs),
            top: Math.min(...ys),
            width: Math.max(...xs) - Math.min(...xs),
            height: Math.max(...ys) - Math.min(...ys),
        };
    }

    private getSelectedElements() {
        if (!this.container) return;
        const insideElements: Element[] = [];
        const allSpans = this.container.querySelectorAll('span');
        allSpans.forEach((span) => {
            if (this.isElementInsideArea(span, this.boundingRect)) {
                insideElements.push(span);
                span.classList.add(this.options.selectedElementsClass);
                span.style.cssText += this.options.selectedElementsStyle;
            } else {
                span.classList.remove(this.options.selectedElementsClass);
                span.style.cssText = '';
            }
        });
        return insideElements;
    }

    private stopDrawing(event: TouchEvent | MouseEvent) {
        event.preventDefault();
        if (!this.isDrawing) return;
        this.isDrawing = false;

        this.calculateBoundingRectangle();
        this.clearCanvas();
        this.ctx?.beginPath();
        this.ctx?.rect(
            this.boundingRect.left,
            this.boundingRect.top,
            this.boundingRect.width,
            this.boundingRect.height
        );
        this.ctx?.stroke();

        const elements = this.getSelectedElements();
        const text = this.getTextFromDomElements(elements);

        if (this.onDrawingFinishedCallback) {
            this.onDrawingFinishedCallback(true);
        }

        if (this.onTextSelectedCallback) {
            this.onTextSelectedCallback(text);
        }
    }

    private addEventListeners(element: HTMLElement, eventHandlerOptionsTriples: Array<[string, EventListener | EventListenerObject, boolean | AddEventListenerOptions | undefined]>) {
        eventHandlerOptionsTriples.forEach(([event, handler, options]) => element.addEventListener(event, handler, options));
    }

    private removeEventListeners(element: HTMLElement, eventHandlerPairs: Array<[string, EventListener | EventListenerObject]>) {
        eventHandlerPairs.forEach(([event, handler]) => element.removeEventListener(event, handler));
    }

    public clearCanvas() {
        if (!this.canvas) return;
        this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public finishDrawing() {
        this.canvas?.remove();
        document.body.style.overflow = 'auto';
        this.onDrawingFinishedCallback = null;
        this.onTextSelectedCallback = null;
        this.restoreDomState();


        this.boundResizeCanvas && window.removeEventListener('resize', this.boundResizeCanvas, {});

        if (this.container) {
            const eventHandlers = [
                ['pointerdown', this.boundStartDrawing],
                ['pointermove', this.boundDraw],
                ['pointerup', this.boundStopDrawing],
                ['pointerout', this.boundStopDrawing],
                ['touchstart', this.boundStartDrawing],
                ['touchmove', this.boundDraw],
                ['touchend', this.boundStopDrawing]
            ]
            // @ts-expect-error todo fix this type later 
            this.removeEventListeners(this.container, eventHandlers);
        }

    }

    public async isDrawingFinished(callback: DrawingFinishedCallback) {
        this.onDrawingFinishedCallback = callback;
    }

    public async getSelectedText(callback: TextSelectedCallback) {
        this.onTextSelectedCallback = callback;
    }

    public initialize(element: HTMLElement | null) {
        if (!element) return;
        this.container = element;
        this.saveCurrentDomState();
        this.wrapTextWithSpan(element);

        this.canvas = this.drawCanvas(element);
        this.ctx = this.canvas.getContext('2d');
        this.boundResizeCanvas && window.addEventListener('resize', this.boundResizeCanvas);

        const eventHandlers = [
            ['pointerdown', this.boundStartDrawing],
            ['pointermove', this.boundDraw],
            ['pointerup', this.boundStopDrawing],
            ['pointerout', this.boundStopDrawing],
            ['touchstart', this.boundStartDrawing, { passive: false }],
            ['touchmove', this.boundDraw, { passive: false }],
            ['touchend', this.boundStopDrawing, { passive: false }]
        ];
        // @ts-expect-error todo fix this type later 
        this.addEventListeners(element, eventHandlers);

    }

}
