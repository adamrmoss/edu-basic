import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

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
