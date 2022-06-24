import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {RDFData, SparqlService} from "../sparql/sparql.service";

@Component({
  selector: 'app-genre',
  templateUrl: './genre.component.html',
  styleUrls: ['./genre.component.css']
})
export class GenreComponent implements OnInit {
  genres: Array<RDFData> | undefined
  genreIdx: number | undefined

  constructor(route: ActivatedRoute, private sparql: SparqlService) {
    this.sparql.getGenres().subscribe(genres => {
      this.genres = genres
      let genreParam = route.snapshot.paramMap.get('genre')
      if (genreParam !== null) {
        this.genreIdx = this.genres.findIndex(e => e['genre'] === genreParam)
      }
    })
  }

  ngOnInit(): void {
  }

}
