import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WindowComponent } from 'ng-luna';

@Component({
    selector: 'app-root',
    imports: [ RouterOutlet, WindowComponent ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent
{
    public title = 'EduBASIC';
}
