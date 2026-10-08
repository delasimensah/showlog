// Note: @testing-library/react-native v12+ includes jest-native matchers built-in
declare global {
  namespace jest {
    interface Matchers<R> {
      toHavePathname(expectedPathname: string): R;
      toHavePathnameWithParams(expectedPathnameWithParams: string): R;
      toHaveSegments(expectedSegments: string[]): R;
      useLocalSearchParams(expectedParams: Record<string, any>): R;
      useGlobalSearchParams(expectedParams: Record<string, any>): R;
      toHaveRouterState(expectedState: any): R;
    }
  }
}

export {};
