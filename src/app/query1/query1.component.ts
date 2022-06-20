import { Component, OnInit } from '@angular/core';
import {SparqlService} from "../sparql/sparql.service";

@Component({
  selector: 'app-query1',
  templateUrl: './query1.component.html',
  styleUrls: ['./query1.component.css']
})
export class Query1Component implements OnInit {

  constructor(private sparql: SparqlService) { }

  ngOnInit(): void {
    this.sparql.getBands().subscribe(d => console.log(d))
  }

}
