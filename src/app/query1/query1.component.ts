import { Component, OnInit } from '@angular/core';
import {RDFData, SparqlService} from "../sparql/sparql.service";

@Component({
  selector: 'app-query1',
  templateUrl: './query1.component.html',
  styleUrls: ['./query1.component.css']
})



export class Query1Component implements OnInit {
  bands: Array<string> | undefined
  bandsUri: Array<string> | undefined
  selectedIndex: number | undefined
  albums: Array<RDFData> | undefined
  tracks: Record<string,RDFData[]> = {}

  constructor(private sparql: SparqlService) { }

  ngOnInit(): void {
    this.sparql.getBands().subscribe(d => {
      this.bandsUri = d.map<string>(e => e['band']);
      this.bands = d.map<string>(e => e['bandLabel']);
    })
  }

  queryAlbums() {
    this.sparql.query1(this.bandsUri![this.selectedIndex!]).subscribe(albums => {
      this.albums = albums
      for (let a of albums) {
        this.sparql.getTracksOf(a['album']).subscribe(tracks => {
            this.tracks[a['album']] = tracks
          }
        )
      }
    })
  }
}
