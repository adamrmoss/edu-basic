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

    public readonly switchTab$: Observable<string> = this.switchTabSubject.asObservable();

    public requestTabSwitch(tabId: string): void
    {
        this.switchTabSubject.next(tabId);
    }
}
