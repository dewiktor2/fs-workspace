import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Message } from '@fs-workspace/api-interfaces';
import { SwUpdatesService } from './services/sw-update.service';
@Component({
    selector: 'fs-workspace-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    hello$ = this.http.get<Message>('/api/hello');
    constructor(private http: HttpClient, private readonly swUpdateService: SwUpdatesService) { };

    ngOnInit(): void {
        // Start listening for SW version update events.
        this.swUpdateService.enable();
    }
}
