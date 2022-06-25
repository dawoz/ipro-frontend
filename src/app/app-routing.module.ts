import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {BandComponent} from "./band/band.component";
import {GenreComponent} from "./genre/genre.component";
import {InstrumentComponent} from "./instrument/instrument.component";
import {HomeComponent} from "./home/home.component";
import {MusicianComponent} from "./musician/musician.component";

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'band', component: BandComponent },
  { path: 'genre', component: GenreComponent },
  { path: 'instrument', component: InstrumentComponent },
  { path: 'musician', component: MusicianComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
