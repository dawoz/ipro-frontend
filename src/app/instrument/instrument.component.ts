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

  constructor(route: ActivatedRoute, private sparql: SparqlService) {
    console.log(route.snapshot.paramMap.get('instrument') + ' ' + route.snapshot.paramMap.get('role'))
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
  }

  queryRoleInfo() {
    this.instrumentIdx = undefined
  }
}
