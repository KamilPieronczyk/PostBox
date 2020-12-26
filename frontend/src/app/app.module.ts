import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PostboxContentComponent } from './postbox-content/postbox-content.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {CookieService} from 'ngx-cookie-service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment'
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    PostboxContentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    HttpClientModule,
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
