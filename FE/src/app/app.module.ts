import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { PagesModule } from './pages/pages.module';
import { SharedComponentsModule } from './shared-components/shared-components.module';
import { provideHttpClient, withInterceptors, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthModule } from './auth/auth.module';
import { authenticatedRequestInterceptor } from './interceptors/authenticated-request.interceptor';

@NgModule({ declarations: [
        AppComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        SharedComponentsModule,
        PagesModule,
        AuthModule], providers: [
        provideAnimationsAsync(),
        provideHttpClient(withInterceptors([authenticatedRequestInterceptor])),
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class AppModule { }
