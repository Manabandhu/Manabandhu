declare module "@/lib/firebase" {
  const firebaseModule: any;
  export = firebaseModule;
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
