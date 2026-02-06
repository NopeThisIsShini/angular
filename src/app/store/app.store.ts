import { Injectable } from '@angular/core';
import { SignalStore } from '@/app/store/signal-store';
import { CallState, callState, getErrorMessage } from '@/app/store/store-utils';
import { UserResult } from '@/app/shared/models/api/common.model';

export interface AppState {
  user: UserResult | null;
  permissions: string[];
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  loadStatus: CallState;
}

const initialAppState: AppState = {
  user: null,
  permissions: [],
  theme: 'light',
  sidebarOpen: true,
  loadStatus: callState(),
};

@Injectable({
  providedIn: 'root',
})
export class AppStore extends SignalStore<AppState> {
  readonly user = this.$.user;
  readonly userId = this.select(s => s.user?.id ?? null);
  readonly permissions = this.$.permissions;
  readonly sidebarOpen = this.$.sidebarOpen;
  readonly isAuthenticated = this.select((s) => !!s.user);
  readonly isLoading = this.select((s) => s.loadStatus === 'loading');

  constructor() {
    super(initialAppState);
  }

  setUser(user: UserResult) {
    this.patchState({ user, loadStatus: 'loaded' });
  }

  setPermissions(permissions: string[]) {
    this.patchState({ permissions });
  }

  toggleSidebar() {
    this.patchState((s) => ({ sidebarOpen: !s.sidebarOpen }));
  }

  setLoading() {
    this.patchState({ loadStatus: 'loading' });
  }

  setLoadError(error: any) {
    this.patchState({ loadStatus: { error: getErrorMessage(error) } });
  }

  clear() {
    this.reset(initialAppState);
  }
}
