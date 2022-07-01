import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BandComponent } from './band/band.component';
import { GenreComponent } from './genre/genre.component';
import { InstrumentComponent } from './instrument/instrument.component';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import {FormsModule} from "@angular/forms";
import { MusicianComponent } from './musician/musician.component';
import { EvolutionComponent } from './evolution/evolution.component';
import {NgVerticalTimelineModule} from "ng-vertical-timeline";

@NgModule({
  declarations: [
    AppComponent,
    BandComponent,
    GenreComponent,
    InstrumentComponent,
    HomeComponent,
    MusicianComponent,
    EvolutionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgVerticalTimelineModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
