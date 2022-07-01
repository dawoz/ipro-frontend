import {Component, OnInit, ViewEncapsulation, AfterViewChecked} from '@angular/core';
import {TimelineEvent} from "ng-vertical-timeline/lib/timeline-event";
import {RDFData, SparqlService} from "../sparql/sparql.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-evolution',
  templateUrl: './evolution.component.html',
  styleUrls: ['./evolution.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EvolutionComponent implements OnInit {
  bands: Array<RDFData> | undefined
  bandIdx: number | undefined
  genreEvolution: TimelineEvent[] | undefined

  constructor(private sparql: SparqlService, route: ActivatedRoute) {
    this.sparql.getBands().subscribe(d => {
      this.bands = d
      let bandParam = route.snapshot.paramMap.get('band')
      if (bandParam !== null) {
        this.bandIdx = this.bands.findIndex(e => e['band'] === bandParam)
        this.queryEvolution()
      }
    })
  }

  ngOnInit(): void { }

  queryEvolution() {
    this.sparql.getGenreEvolutionOfBand(this.bands![this.bandIdx!]['band']).subscribe(albums => {
      let m: Record<string, Array<RDFData>> = {}
      for (let albumIri of new Set(albums.map(a => a['album']))) {
        m[albumIri] = albums.filter(a => a['album'] === albumIri)
      }
      this.genreEvolution = Object.entries(m).map((e,i) => {
        return {
          id: i,
          title: `<a class="text-light" href='/band;band=${encodeURIComponent(this.bands![this.bandIdx!]['band'])};album=${encodeURIComponent(e[0])}'>${e[1][0]['albumLabel']}</a>`,
          content: '<strong class="me-2">Genres:</strong>' + e[1].map(a => `<a href="/genre;genre=${encodeURIComponent(a['genre'])}">${a['genreLabel']}</a>`).join(', '),
          date: '<p>'+e[1][0]['year']+'</p>$',
          icon: e[1][0]['imageUrl']
        }
      })
    })
  }

  ngAfterViewChecked() {
    const elements = document.getElementsByTagName('div');
    for (let i = 0; i < elements.length; i++ ) {
      if (elements[i].classList.contains('title') && !elements[i].classList.contains('no-modify')) {
        console.log(elements[i].textContent)

        let text = elements[i].textContent!
        elements[i].innerHTML = ""

        let year = document.createElement('p')
        year.innerHTML = text.split('$')[0].trim()

        let title = document.createElement('p')
        title.innerHTML = text.split('$')[1].trim()

        elements[i].append(year, title)
        elements[i].classList.add('no-modify')


      }
    }
  }
}
