import { Component, OnInit } from '@angular/core';
import {RDFData, SparqlService} from "../sparql/sparql.service";

@Component({
  selector: 'app-band',
  templateUrl: './band.component.html',
  styleUrls: ['./band.component.css']
})



export class BandComponent implements OnInit {
  entries = Object.entries

  bands: Array<string> | undefined
  bandsUri: Array<string> | undefined
  bandIdx: number | undefined

  albums: Array<RDFData> | undefined
  albumIdx: number | undefined

  tracks: Record<string,RDFData[]> = {}
  genres: Array<RDFData> | undefined
  membersInstrument: Record<string,RDFData[]> = {}
  membersRole: Record<string, RDFData[]> = {}

  constructor(private sparql: SparqlService) { }

  ngOnInit(): void {
    this.sparql.getBands().subscribe(d => {
      this.bandsUri = d.map<string>(e => e['band']);
      this.bands = d.map<string>(e => e['bandLabel']);
    })
  }

  queryAlbums() {
    this.albumIdx = undefined
    this.sparql.query1(this.bandsUri![this.bandIdx!]).subscribe(albums => this.albums = albums)
  }

  queryAlbumInfo() {
    let a = this.albums![this.albumIdx!]
    // get tracks
    this.sparql.getTracksOf(a['album']).subscribe(tracks => this.tracks[a['album']] = tracks)
    // get genres
    this.sparql.getGenresOf(a['album']).subscribe(genres => this.genres = genres)
    // get members
    this.sparql.getMembersOf(a['album']).subscribe(members => {
      for (let m of members) {
        if (m['roleLabel'] === undefined) {
          if (this.membersInstrument[m['memberLabel']] === undefined)
            this.membersInstrument[m['memberLabel']] = []
          this.membersInstrument[m['memberLabel']].push(m)
        }
        else {
          if (this.membersRole[m['memberLabel']] === undefined)
            this.membersRole[m['memberLabel']] = []
          this.membersRole[m['memberLabel']].push(m)
        }
      }
    })
  }
}
