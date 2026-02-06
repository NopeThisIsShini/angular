import { computed, Signal, signal, WritableSignal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

/**
 * A simplified, high-performance state management base.
 * Designed for fast development and minimal boilerplate.
 */
export abstract class SignalStore<T extends object> {
  private readonly _state: WritableSignal<T>;
  
  /**
   * The complete state as a readonly signal.
   */
  readonly state: Signal<T>;

  /**
   * Automatic selectors for every property in your state.
   * Usage: store.$.propertyName()
   */
  readonly $: { readonly [K in keyof T]: Signal<T[K]> };

  constructor(initialState: T) {
    this._state = signal<T>(initialState);
    this.state = this._state.asReadonly();

    // Create a proxy to automatically provide signals for any state property
    this.$ = new Proxy({} as any, {
      get: (_, prop: string) => {
        return computed(() => (this._state() as any)[prop]);
      },
    });
  }

  /**
   * Select a specific slice of state with a custom selector.
   */
  protected select<K>(selector: (state: T) => K): Signal<K> {
    return computed(() => selector(this._state()));
  }

  /**
   * Patch the state with a partial update.
   */
  protected patchState(update: Partial<T> | ((state: T) => Partial<T>)): void {
    this._state.update((current) => {
      const partial = typeof update === 'function' ? update(current) : update;
      return { ...current, ...partial };
    });
  }

  /**
   * Connect an Observable to a state property for automatic updates.
   * Great for API calls or stream-based state.
   */
  protected connect<K extends keyof T>(key: K, observable$: Observable<T[K]>): void {
    observable$.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.patchState({ [key]: value } as unknown as Partial<T>);
    });
  }

  /**
   * Reset the state to its initial value.
   */
  protected reset(initialState: T): void {
    this._state.set(initialState);
  }
}
