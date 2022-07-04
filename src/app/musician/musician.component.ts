import { Component, OnInit } from '@angular/core';
import {RDFData, SparqlService} from "../sparql/sparql.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-musician',
  templateUrl: './musician.component.html',
  styleUrls: ['./musician.component.css']
})
export class MusicianComponent implements OnInit {
  musicianIdx: number | undefined
  musicians: Array<RDFData> | undefined
  bandAlbums: Record<string, Array<RDFData>> | undefined
  instruments: Array<RDFData> | undefined
  roles: Array<RDFData> | undefined
  classes: Array<RDFData> | undefined

  /**
   * Load musicians. If the URL has an arg, read it
   *
   * @param sparql
   * @param route
   */
  constructor(private sparql: SparqlService, private route: ActivatedRoute) {
    this.sparql.getMusicians().subscribe(musicians => {
      this.musicians = musicians.sort((a,b) => a['musicianLabel'].localeCompare(b['musicianLabel']))
      let musicianParam = route.snapshot.paramMap.get('musician')
      if (musicianParam !== null) {
        this.musicianIdx = this.musicians!.findIndex(e => e['musician'] === musicianParam)
        this.queryMusician()
      }
    })
  }

  ngOnInit(): void {
  }

  format(s: string) {
    s = s.charAt(0).toUpperCase() + s.slice(1)
    if (!s.endsWith('.'))
      s += '.'
    return s
  }

  entries = Object.entries

  /**
   * Load musician info
   */
  queryMusician() {
    this.sparql.getBandsAndAlbumsOfMusician(this.musicians![this.musicianIdx!]['musician']).subscribe(res => {
      this.bandAlbums = {}
      for (let r of res) {
        if (this.bandAlbums[r['bandLabel']] === undefined)
          this.bandAlbums[r['bandLabel']] = []
        this.bandAlbums[r['bandLabel']].push(r)
      }
    })
    this.sparql.getInstrumentsOfMusician(this.musicians![this.musicianIdx!]['musician']).subscribe(instruments =>
      this.instruments = instruments.sort(
        (a,b) => a['instrumentLabel'].localeCompare(b['instrumentLabel'])))
    this.sparql.getSubclassesOfMusician(this.musicians![this.musicianIdx!]['musician']).subscribe(classes => this.classes = classes)
  }

  albumsCondition() {
    return this.bandAlbums !== undefined && this.entries(this.bandAlbums).length > 0
  }
}
