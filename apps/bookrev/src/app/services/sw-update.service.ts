import {
    ApplicationRef,
    Injectable,
    OnDestroy,
} from '@angular/core'
import { concat, interval, Subject } from 'rxjs'
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker'
import { delay, filter, first, map, switchMap, takeUntil, tap } from 'rxjs/operators'

/**
 * SwUpdatesService
 *
 * @description
 * While enabled, this service will:
 * 1. Check for available ServiceWorker updates every 6 hours.
 * 2. Activate an update as soon as one is available.
 */
@Injectable({providedIn: 'root'})
export class SwUpdatesService implements OnDestroy {
    /* 1 hour check */
    private checkInterval = 1000 * 60 * 60 * 1;
    private onDisable = new Subject<void>()

    constructor(private appRef: ApplicationRef, private swu: SwUpdate) {}

    disable() {
      this.onDisable.next()
    }


    enable() {
        if (!this.swu.isEnabled) {
            return
        }

        // Periodically check for updates (after the app is stabilized).
        const appIsStable = this.appRef.isStable.pipe(
          tap(() => console.log(`App is stable`)),
          first((v) => v)
        );
        concat(appIsStable, interval(this.checkInterval))
            .pipe(takeUntil(this.onDisable))
            .subscribe(() => this.swu.checkForUpdate())

        // Activate available updates.
        this.swu.versionUpdates
            .pipe(
                tap(evt => console.log(`Update available: ${JSON.stringify(evt)}`)),
                filter(
                    (evt): evt is VersionReadyEvent =>
                        evt.type === 'VERSION_READY'
                ),
                map((evt) => ({
                    type: 'UPDATE_AVAILABLE',
                    current: evt.currentVersion,
                    available: evt.latestVersion,
                })),
                tap(evt => console.log(`Update available: ${JSON.stringify(evt)}`)),
                delay(5000),
                switchMap(() => this.swu.activateUpdate()),
                tap(() => window.location.reload()),
                takeUntil(this.onDisable)
            )
            .subscribe();

        // Request an immediate page reload once an unrecoverable state has been detected.
        this.swu.unrecoverable
          .pipe(
              tap(evt => {
                const errorMsg = `Unrecoverable state: ${evt.reason}`;
                console.log(`${errorMsg}\nReloading...`);
              }),
              takeUntil(this.onDisable),
          )
          .subscribe(() => window.location.reload());
    }

    ngOnDestroy() {
        this.disable()
    }
}
