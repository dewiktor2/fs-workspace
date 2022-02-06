import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Message } from '@fs-workspace/api-interfaces';
@Component({
    selector: 'fs-workspace-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    hello$ = this.http.get<Message>('/api/hello');
    constructor(private http: HttpClient) { };
}
