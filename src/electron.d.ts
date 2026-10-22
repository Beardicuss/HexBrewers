export {};

declare global {
  interface Window {
    hexbrewersDisplay?: {
      setResolution(width: number, height: number): Promise<boolean>;
    };
  }
}
