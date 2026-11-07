declare module 'leader-line' {
  interface Options {
    color?: string;
    size?: number;
    opacity?: number;
    path?: 'straight' | 'arc' | 'fluid' | 'magnet' | 'grid';
    startPlug?: string;
    endPlug?: string;
    endPlugSize?: number;
    dash?: boolean | { len: number; gap: number };
    hide?: boolean;
    zIndex?: number;
  }
  class LeaderLine {
    constructor(start: Element | string, end: Element | string, options?: Options);
    position(): void;
    remove(): void;
  }
  export = LeaderLine;
}