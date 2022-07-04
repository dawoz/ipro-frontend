import { Component, OnInit } from '@angular/core';
import {RDFData, SparqlService} from "../sparql/sparql.service";
import {ActivatedRoute} from "@angular/router";

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

  /**
   * Load bands and if the URL has a band argument, read it
   *
   * @param sparql
   * @param route
   */
  constructor(private sparql: SparqlService, private route: ActivatedRoute) {
    this.sparql.getBands().subscribe(d => {
      this.bandsUri = d.map<string>(e => e['band'])
      this.bands = d.map<string>(e => e['bandLabel'])
      let bandParam = route.snapshot.paramMap.get('band')
      if (bandParam !== null) {
        this.bandIdx = this.bandsUri.indexOf(bandParam)
        this.queryAlbums()
      }
    })
  }

  ngOnInit(): void {
  }

  /**
   * Load albums of the selected band. If the URL has a album argument, read it
    */
  queryAlbums() {
    this.albumIdx = undefined
    this.sparql.getAlbumsOfBand(this.bandsUri![this.bandIdx!]).subscribe(albums => {
      this.albums = albums
      let albumParam = this.route.snapshot.paramMap.get('album')
      if (albumParam !== null) {
        this.albumIdx = this.albums.findIndex(r => r['album'] === albumParam)
        this.queryAlbumInfo()
      }
    })
  }

  /**
   * Query album information
   */
  queryAlbumInfo() {
    this.membersInstrument = {}
    this.membersRole = {}
    let a = this.albums![this.albumIdx!]
    // get tracks
    this.sparql.getTracksOfAlbum(a['album']).subscribe(tracks => this.tracks[a['album']] = tracks)
    // get genres
    this.sparql.getGenresOfAlbum(a['album']).subscribe(genres => this.genres = genres)
    // get members
    this.sparql.getMembersOfAlbum(a['album']).subscribe(members => {
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
