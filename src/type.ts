import type * as CSS from 'csstype';

export type Options = {
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

export type DrawingFinishedCallback = (selectedDOMElements: Element[] | undefined) => void;
export type TextSelectedCallback = (text: string | undefined) => void;
