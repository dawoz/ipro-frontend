import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {RDFData, SparqlService} from "../sparql/sparql.service";

@Component({
  selector: 'app-genre',
  templateUrl: './genre.component.html',
  styleUrls: ['./genre.component.css']
})
export class GenreComponent implements OnInit {
  genres: Array<RDFData> | undefined
  genreIdx: number | undefined

  supergenres: Array<RDFData> | undefined
  subgenres: Array<RDFData> | undefined
  originGenres: Array<RDFData> | undefined
  influencedGenres: Array<RDFData> | undefined
  instruments: Array<RDFData> | undefined
  bandAlbums: Record<string, Array<RDFData>> | undefined

  constructor(router: Router, route: ActivatedRoute, private sparql: SparqlService) {
    router.routeReuseStrategy.shouldReuseRoute = () => false
    this.sparql.getGenres().subscribe(genres => {
      this.genres = genres.sort((a,b) => a['genreLabel'].localeCompare(b['genreLabel']))
      let genreParam = route.snapshot.paramMap.get('genre')
      if (genreParam !== null) {
        this.genreIdx = this.genres.findIndex(e => e['genre'] === genreParam)
        this.queryGenre()
      }
    })
  }

  ngOnInit(): void { }

  entries = Object.entries

  queryGenre() {
    this.supergenres = []
    this.subgenres= []
    this.originGenres = []
    this.influencedGenres = []
    this.sparql.getRelatedGenresOf(this.genres![this.genreIdx!]['genre']).subscribe(related => {
      for (let r of related) {
        if (r['supergenre'] !== undefined)
          this.supergenres?.push(r)
        if (r['subgenre'] !== undefined)
          this.subgenres?.push(r)
        if (r['parent'] !== undefined)
          this.originGenres?.push(r)
        if (r['child'] !== undefined)
          this.influencedGenres?.push(r)
      }
    })
    this.sparql.getInstrumentsOf(this.genres![this.genreIdx!]['genre']).subscribe(instruments =>
      this.instruments = instruments.sort(
        (a,b) => a['instrumentLabel'].localeCompare(b['instrumentLabel'])))
    this.sparql.getBandsAndAlbumsOf(this.genres![this.genreIdx!]['genre']).subscribe(res => {
      this.bandAlbums = {}
      for (let r of res) {
        if (this.bandAlbums[r['bandLabel']] === undefined)
          this.bandAlbums[r['bandLabel']] = []
        this.bandAlbums[r['bandLabel']].push(r)
      }
    })
  }

  format(s: string) {
    s = s.charAt(0).toUpperCase() + s.slice(1)
    if (!s.endsWith('.'))
      s += '.'
    return s
  }

  genreCondition() {
    return [this.supergenres, this.subgenres, this.originGenres, this.influencedGenres]
      .map(g => g !== undefined && g.length > 0)
      .reduce((p,c) => p || c)
  }

  albumsCondition() {
    return this.bandAlbums !== undefined && this.entries(this.bandAlbums).length > 0
  }
}
