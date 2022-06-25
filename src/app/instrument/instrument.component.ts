import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {RDFData, SparqlService} from "../sparql/sparql.service";

@Component({
  selector: 'app-instrument',
  templateUrl: './instrument.component.html',
  styleUrls: ['./instrument.component.css']
})
export class InstrumentComponent implements OnInit {
  instruments: Array<RDFData> | undefined
  roles: Array<RDFData> | undefined
  instrumentIdx: number | undefined
  roleIdx: number | undefined
  genres: Array<RDFData> | undefined
  musicians: Array<RDFData> | undefined
  class: RDFData | undefined;

  constructor(route: ActivatedRoute, private sparql: SparqlService) {
    this.sparql.getInstruments().subscribe(instruments => {
      this.instruments = instruments
      let paramMap = route.snapshot.paramMap
      if (paramMap.get('instrument') !== null) {
        this.instrumentIdx = this.instruments.findIndex(e => e['instrument'] === paramMap.get('instrument'))
      }
    })
    this.sparql.getProductionRoles().subscribe(roles => {
      this.roles = roles
      let paramMap = route.snapshot.paramMap
      if (paramMap.get('role') !== null) {
        this.roleIdx = this.roles.findIndex(e => e['role'] === paramMap.get('role'))
      }
    })
  }

  ngOnInit(): void {
  }

  queryInstrumentInfo() {
    this.roleIdx = undefined
    this.class = undefined
    this.genres = undefined
    this.musicians = undefined
    this.sparql.getMostSpecificClassOf(this.instruments![this.instrumentIdx!]['instrument']).subscribe(c => this.class = c[0])
    this.sparql.getGenresWith(this.instruments![this.instrumentIdx!]['instrument']).subscribe(genres => this.genres = genres)
    this.sparql.getMusiciansWithInstrument(this.instruments![this.instrumentIdx!]['instrument']).subscribe(musicians => this.musicians = musicians)
  }

  queryRoleInfo() {
    this.instrumentIdx = undefined
    this.class = undefined
    this.genres = undefined
    this.musicians = undefined
    this.sparql.getMostSpecificClassOf(this.roles![this.roleIdx!]['role']).subscribe(c => this.class = c[0])
    this.sparql.getMusiciansWithProductionRole(this.roles![this.roleIdx!]['role']).subscribe(musicians => this.musicians = musicians)
  }

  format(s: string) {
    s = s.charAt(0).toUpperCase() + s.slice(1)
    if (!s.endsWith('.'))
      s += '.'
    return s
  }
}
