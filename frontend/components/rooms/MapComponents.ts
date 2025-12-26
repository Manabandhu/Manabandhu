// Base file for TypeScript - actual implementation is in .native.ts or .web.ts
// This file is only used for type checking
import type { ComponentType } from 'react';
import type { Region, MarkerProps } from 'react-native-maps';

export type MapViewType = ComponentType<any> | null;
export type MarkerType = ComponentType<MarkerProps> | null;
export type ProviderType = any;

// These will be replaced by platform-specific implementations
export const MapView: MapViewType = null;
export const Marker: MarkerType = null;
export const PROVIDER_GOOGLE: ProviderType = null;

