import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {BandComponent} from "./band/band.component";
import {GenreComponent} from "./genre/genre.component";
import {InstrumentComponent} from "./instrument/instrument.component";
import {HomeComponent} from "./home/home.component";

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'band', component: BandComponent },
  { path: 'genre', component: GenreComponent },
  { path: 'instrument', component: InstrumentComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
