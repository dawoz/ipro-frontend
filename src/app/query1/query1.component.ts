import { Component, OnInit } from '@angular/core';
import {SparqlService} from "../sparql/sparql.service";

@Component({
  selector: 'app-query1',
  templateUrl: './query1.component.html',
  styleUrls: ['./query1.component.css']
})
export class Query1Component implements OnInit {
  bands: string[] | undefined
  bandsUri: string[] | undefined
  selectedBandUri: string | undefined

  constructor(private sparql: SparqlService) { }

  ngOnInit(): void {
    this.sparql.getBands().subscribe(d => {
        // @ts-ignore
      this.bandsUri = d.map<string>(e => e['band']);
        // @ts-ignore
      this.bands = d.map<string>(e => e['band'].split('#').at(-1).replaceAll('_', ' '));
    })
  }
}
