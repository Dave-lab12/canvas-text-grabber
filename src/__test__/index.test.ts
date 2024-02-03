import { expect, test, describe, beforeEach } from "bun:test";
import { CanvasTextGrabber } from '../index';

describe('CanvasTextGrabber', () => {
    let instance: CanvasTextGrabber;

    beforeEach(() => {
        instance = new CanvasTextGrabber();
    });

    test('should be defined', () => {
        expect(instance).toBeDefined();
    });

});