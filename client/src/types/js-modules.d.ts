declare module "*.jsx" {
  const Component: any;
  export default Component;
}

declare module "*.js" {
  const moduleExports: any;
  export default moduleExports;
}

declare module "*authService" {
  export const registerUser: (data: any) => Promise<any>;
}

declare module "*userService" {
  export const getProfile: () => Promise<any>;
}
