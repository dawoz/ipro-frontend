import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {Query1Component} from "./query1/query1.component";
import {Query2Component} from "./query2/query2.component";
import {Query3Component} from "./query3/query3.component";
import {Query4Component} from "./query4/query4.component";
import {Query5Component} from "./query5/query5.component";
import {Query6Component} from "./query6/query6.component";
import {Query7Component} from "./query7/query7.component";
import {Query8Component} from "./query8/query8.component";
import {HomeComponent} from "./home/home.component";

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'query1', component: Query1Component },
  { path: 'query2', component: Query2Component },
  { path: 'query3', component: Query3Component },
  { path: 'query4', component: Query4Component },
  { path: 'query5', component: Query5Component },
  { path: 'query6', component: Query6Component },
  { path: 'query7', component: Query7Component },
  { path: 'query8', component: Query8Component }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
