declare module "@/services/auth" {
  const authProviderModule: any;
  export = authProviderModule;
}

declare module "@/lib/*" {
  const m: any;
  export = m;
}

declare module "@/components/*" {
  const m: any;
  export = m;
}

export {};
