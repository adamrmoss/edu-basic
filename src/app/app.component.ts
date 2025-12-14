import { Component } from '@angular/core';
import { WindowComponent } from 'ng-luna';

@Component({
    selector: 'app-root',
    imports: [ WindowComponent ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent
{
    public title = 'EduBASIC';
}
