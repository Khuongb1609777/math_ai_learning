# Deep-Dive Analysis: In-Flight Async Re-Entrancy & Dynamic Import Locking in `src/app.js`

**Author**: Milestone M2 Iteration 3 Explorer 3 (`m2_it3_explorer_3`)  
**Date**: 2026-11-09  
**Target File**: `src/app.js` (`App.prototype.handleOpenShowcase` and `handleCloseShowcase`)  
**Target Test**: `tests/modal_deep_stress_adversarial.test.js` (Vector 2: Double Backdrop & Listener Leaks under Concurrent Bursts)  

---

## 1. Executive Summary

In Milestone M2, the KHKT Research Showcase modal (`KhktShowcaseModal`) is loaded dynamically via ES module dynamic import (`await import('./components/KhktShowcaseModal.js')`) to maintain optimal initial bundle footprint and lazy initialization.

However, during adversarial stress testing (`tests/modal_deep_stress_adversarial.test.js`), Challenger 2 demonstrated that **un-awaited rapid invocations** of `app.handleOpenShowcase()` create severe race conditions during the in-flight dynamic import window:
1. When 50 concurrent async calls are fired simultaneously (`Promise.all(Array.from({ length: 50 }, () => app.handleOpenShowcase()))`), or when 30 rapid alternating open/close cycles occur without awaiting, multiple invocations execute concurrently.
2. In an un-guarded or naively guarded implementation, while `await import(...)` is suspended waiting for module resolution, subsequent invocations enter `handleOpenShowcase()`. Because `this.showcaseModal` is still `null` and the first call has yielded execution back to the microtask queue, each subsequent call initiates another dynamic import and eventually mounts another `.khkt-modal-backdrop` into `#modal-root`.
3. As a result, up to 50 stacked backdrops are mounted into the DOM, and up to 50 distinct `keydown` ESC listeners are attached to `document`, causing severe visual layering glitches and permanent memory leaks.
4. Furthermore, in existing intermediate implementations, secondary concurrent callers awaiting `this._showcaseImportPromise` do not have error boundaries around `await this._showcaseImportPromise`, creating an **UnhandledPromiseRejection** vulnerability if the dynamic import ever fails.

This report provides the exhaustive forensic analysis of in-flight async re-entrancy, formulates a multi-tiered dynamic import locking and module caching architecture, and presents an exact, surgical drop-in fix for `src/app.js`.

---

## 2. Root Cause Analysis

### 2.1 The Asynchronous Suspension Window

In ECMAScript, dynamic module imports (`import(...)`) are asynchronous and return a `Promise`. When `await import(...)` is encountered in an `async` method, JavaScript immediately yields execution back to the caller and the microtask/event queue:

```
t=0ms: Invocation 1: app.handleOpenShowcase()
       ├── Synchronous check: this.showcaseModal === null
       ├── Initiates dynamic import: p = import('./components/KhktShowcaseModal.js')
       └── Suspends at: await p (Yields execution to event loop!)

t=0.01ms: Invocation 2: app.handleOpenShowcase() (Un-awaited!)
          ├── Runs synchronously on the SAME event loop tick!
          ├── Checks this.showcaseModal: STILL NULL! (Invocation 1 hasn't finished)
          ├── [WITHOUT LOCK]: Initiates another import: p2 = import(...)
          └── Suspends at: await p2

... Invocations 3 to 50 repeat the exact same sequence!

t=1.5ms: Module finishes loading. Promises resolve in microtask queue:
         ├── Invocation 1 resumes: creates Modal 1 -> mounts Backdrop 1 -> binds Keydown Listener 1
         ├── Invocation 2 resumes: creates Modal 2 -> mounts Backdrop 2 -> binds Keydown Listener 2
         └── Invocations 3..50 resume: mount Backdrops 3..50 -> leak Keydown Listeners 3..50
```

### 2.2 In-Flight Alternating Storm Hazards (Open -> Close -> Open without Await)

Consider the adversarial loop executed in `tests/modal_deep_stress_adversarial.test.js:597`:

```javascript
for (let i = 0; i < 30; i++) {
  if (i % 2 === 0) {
    app.handleOpenShowcase();
  } else {
    app.handleCloseShowcase();
  }
}
await app.handleOpenShowcase();
```

Here:
1. `app.handleOpenShowcase()` is an un-awaited asynchronous function.
2. `app.handleCloseShowcase()` is a synchronous function that sets `this.state.isShowcaseModalOpen = false` and clears `modalRoot.innerHTML = ''`.
3. During iterations 0, 2, 4, ... 28, new asynchronous calls are spawned while previous imports are still in flight.
4. Interspersed iterations 1, 3, 5, ... 29 synchronously cancel the open state (`this.state.isShowcaseModalOpen = false`).
5. When the in-flight dynamic imports finally resolve, if an invocation does not re-verify `this.state.isShowcaseModalOpen`, it will proceed to mount a backdrop into `#modal-root` even though the user/controller explicitly closed it!

### 2.3 Secondary Caller Unhandled Rejection Hazard

In partial guard patterns where an in-flight promise is cached:
```javascript
if (this._showcaseImportPromise) {
  this.state.isShowcaseModalOpen = true;
  await this._showcaseImportPromise; // <--- DANGER!
  ...
}
```
If the dynamic import rejects (for example, network disconnection during CDN load, corrupted bundle, or file system permission error):
- The primary caller (initiator of `import(...)`) handles the rejection via `try { ... } catch (e) { ... }`.
- However, all concurrent callers (callers 2..50) that entered the guard and awaited `this._showcaseImportPromise` **outside** a `try/catch` block will throw an uncaught promise rejection, crashing the application runner!

---

## 3. Architecture of the Surgical Solution

To guarantee zero duplicate backdrops, zero leaked listeners, 100% resilience against rapid concurrent bursts, and zero unhandled rejections, `App.prototype.handleOpenShowcase()` must implement a **4-tier defense**:

```
┌────────────────────────────────────────────────────────────────────────┐
│ App.prototype.handleOpenShowcase()                                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
               ┌────────────────────▼────────────────────┐
               │ Tier 1: Instance & DOM Attachment Check │
               │ Is this.showcaseModal open & attached?  │
               └────────┬───────────────────────┬────────┘
                        │ YES                   │ NO
               ┌────────▼────────┐              │
               │ State=true; RET │              │
               └─────────────────┘              │
                                                ▼
                               ┌────────────────────────────────┐
                               │ Tier 2: Cached Class Check     │
                               │ Has module been imported?      │
                               │ (this._KhktShowcaseModalClass) │
                               └────────┬───────────────┬───────┘
                                        │ YES           │ NO
                               ┌────────▼────────┐      │
                               │ Inst/Mount Synch│      │
                               └─────────────────┘      │
                                                        ▼
                                       ┌────────────────────────────────┐
                                       │ Tier 3: In-Flight Locking      │
                                       │ Is import promise in-flight?   │
                                       │ (this._showcaseImportPromise)  │
                                       └────────┬───────────────┬───────┘
                                                │ YES           │ NO
                                       ┌────────▼────────┐      │
                                       │ Coalesce Calls  │      │
                                       │ (Safe Await     │      │
                                       │  inside try)    │      │
                                       └─────────────────┘      │
                                                                ▼
                                               ┌────────────────────────────────┐
                                               │ Tier 4: Primary Dynamic Import │
                                               │ 1. Set this.state.is... = true │
                                               │ 2. Create Import Promise       │
                                               │ 3. Await & Cache Class         │
                                               │ 4. Clear Promise handle        │
                                               │ 5. Check if closed mid-flight  │
                                               │ 6. Mount exactly 1 instance    │
                                               └────────────────────────────────┘
```

### Detailed Tier Breakdown:

1. **Tier 1 (Existing Instance & DOM Attachment Verification)**:
   - If `this.showcaseModal` already exists, check whether `this.showcaseModal.modalEl` is currently attached to `#modal-root`.
   - If it is already attached and open, simply guarantee `this.state.isShowcaseModalOpen = true` and return immediately.
   - If it exists but is detached or closed, update container and invoke `open()`.

2. **Tier 2 (Module Class Caching — `this._KhktShowcaseModalClass`)**:
   - Once `import('./components/KhktShowcaseModal.js')` succeeds, cache the class constructor in `this._KhktShowcaseModalClass`.
   - Any future calls to `handleOpenShowcase()` (even after a prior instance was destroyed) bypass asynchronous dynamic imports entirely and instantiate synchronously, eliminating microtask re-entrancy altogether!

3. **Tier 3 (In-Flight Promise Coalescing with Error Boundaries)**:
   - If `this._showcaseImportPromise` is already active when a call arrives, set `this.state.isShowcaseModalOpen = true` and await the existing promise inside `try { await this._showcaseImportPromise; } catch (err) { ... }`.
   - Once resolved, verify `if (!this.state.isShowcaseModalOpen) return;`.
   - If the modal was already mounted by the primary caller, secondary callers simply verify DOM attachment and exit idempotently without duplicate calls to `mount()`.

4. **Tier 4 (Atomic Primary Import & Cancellation Guard)**:
   - The primary caller creates `this._showcaseImportPromise = import('./components/KhktShowcaseModal.js')`.
   - Upon resolution, immediately caches `this._KhktShowcaseModalClass` and nullifies `this._showcaseImportPromise`.
   - Checks `if (!this.state.isShowcaseModalOpen) return;` to handle the case where `handleCloseShowcase()` was invoked during the import delay.
   - Instantiates exactly one `KhktShowcaseModal` and mounts it into `modalRoot`.

---

## 4. Proposed Code Replacement for `src/app.js`

```javascript
  /**
   * Opens KHKT Research Showcase modal
   * Defends against in-flight async re-entrancy, concurrent bursts, and state inversion
   */
  async handleOpenShowcase() {
    let modalRoot = document.getElementById('modal-root');
    if (!modalRoot) {
      modalRoot = document.createElement('div');
      modalRoot.id = 'modal-root';
      document.body.appendChild(modalRoot);
    }

    // Tier 1: Modal instance already exists
    if (this.showcaseModal) {
      const isAttached = Boolean(
        modalRoot &&
        modalRoot.children &&
        (Array.isArray(modalRoot.children)
          ? modalRoot.children.includes(this.showcaseModal.modalEl)
          : this.showcaseModal.modalEl?.parentNode === modalRoot)
      );
      if (this.showcaseModal.isOpen() && isAttached) {
        this.state.isShowcaseModalOpen = true;
        return;
      }
      this.state.isShowcaseModalOpen = true;
      if (this.showcaseModal.options.container !== modalRoot) {
        this.showcaseModal.options.container = modalRoot;
      }
      this.showcaseModal.open();
      return;
    }

    // Tier 2: Module is already imported and cached
    if (this._KhktShowcaseModalClass) {
      this.state.isShowcaseModalOpen = true;
      this.showcaseModal = new this._KhktShowcaseModalClass({
        container: modalRoot,
        language: this.state.language,
        onClose: this.handleCloseShowcase
      });
      this.showcaseModal.mount(modalRoot);
      return;
    }

    // Tier 3: In-flight Async Dynamic Import Locking & Re-Entrancy Coalescing
    if (this._showcaseImportPromise) {
      this.state.isShowcaseModalOpen = true;
      try {
        await this._showcaseImportPromise;
      } catch (err) {
        if (!this.state.isShowcaseModalOpen) return;
      }

      // Check if user or controller cancelled open while import was pending
      if (!this.state.isShowcaseModalOpen) return;

      // Primary caller has already mounted this.showcaseModal or rendered fallback
      if (this.showcaseModal) {
        const isAttached = Boolean(
          modalRoot &&
          modalRoot.children &&
          (Array.isArray(modalRoot.children)
            ? modalRoot.children.includes(this.showcaseModal.modalEl)
            : this.showcaseModal.modalEl?.parentNode === modalRoot)
        );
        if (!isAttached || !this.showcaseModal.isOpen()) {
          this.showcaseModal.open();
        }
      }
      return;
    }

    // Tier 4: Primary Dynamic Import Initiator
    this.state.isShowcaseModalOpen = true;

    try {
      this._showcaseImportPromise = import('./components/KhktShowcaseModal.js');
      const module = await this._showcaseImportPromise;
      const KhktShowcaseModal = module?.KhktShowcaseModal;
      this._KhktShowcaseModalClass = KhktShowcaseModal;
      this._showcaseImportPromise = null;

      // Check if user requested close while import was in flight
      if (!this.state.isShowcaseModalOpen) {
        return;
      }

      if (KhktShowcaseModal) {
        if (!this.showcaseModal) {
          this.showcaseModal = new KhktShowcaseModal({
            container: modalRoot,
            language: this.state.language,
            onClose: this.handleCloseShowcase
          });
          this.showcaseModal.mount(modalRoot);
        } else {
          if (this.showcaseModal.options.container !== modalRoot) {
            this.showcaseModal.options.container = modalRoot;
          }
          this.showcaseModal.open();
        }
        return;
      }
      this.renderShowcaseModalFallback(modalRoot);
    } catch (e) {
      this._showcaseImportPromise = null;
      if (!this.state.isShowcaseModalOpen) return;
      try {
        this.renderShowcaseModalFallback(modalRoot);
      } catch (fallbackError) {
        this.state.isShowcaseModalOpen = false;
      }
    }
  }
```

---

## 5. Non-Overlapping Coordination with Parallel Explorers

- **Explorer 1 (`m2_it3_explorer_1`)**: Investigates Ghost Modal Detachment (`modalRoot.innerHTML = ''` unlinking `modalEl` from DOM without `KhktShowcaseModal.open()` checking parent re-attachment).
  * Boundary: Explorer 1 ensures `KhktShowcaseModal.prototype.open()` re-attaches `this.modalEl` to `container` if detached.
  * Our fix in `app.js` is 100% complementary: it checks `isAttached` before calling `open()`.
- **Explorer 2 (`m2_it3_explorer_2`)**: Investigates State Inversion (closing previous modal instance dispatches `khkt:modal-closed`, resetting `this.state.isShowcaseModalOpen = false` while reopening).
  * Boundary: Explorer 2 ensures closing a prior instance does not invert `app.state.isShowcaseModalOpen` when called from within `handleOpenShowcase()`.
  * Our fix in `app.js` handles `this.state.isShowcaseModalOpen = true` idempotently without closing active instances unnecessarily.
- **Explorer 3 (This Agent)**: Targets in-flight dynamic import locking, secondary caller error boundaries, promise coalescing, and module class caching in `handleOpenShowcase()`.

Zero merge conflict exists between the three explorer recommendations.
