import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

/**
 * Lightweight application event bus for requesting tab switches.
 *
 * The interpreter runtime can request a UI tab change (for example, switching to output).
 * `InterpreterService` wires these requests from `RuntimeExecution` into this service.
 */
@Injectable({
    providedIn: 'root'
})
export class TabSwitchService
{
    private readonly switchTabSubject = new Subject<string>();

    /**
     * Observable stream of requested tab ids.
     */
    public readonly switchTab$: Observable<string> = this.switchTabSubject.asObservable();

    /**
     * Request that the UI switch to a specific tab.
     *
     * @param tabId Tab id to activate.
     */
    public requestTabSwitch(tabId: string): void
    {
        // Emit the requested tab id so subscribers (e.g. app component) can switch the active tab.
        this.switchTabSubject.next(tabId);
    }
}
