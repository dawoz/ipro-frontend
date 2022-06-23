import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {map, Observable} from "rxjs";

export type RDFData = Record<string, string>

@Injectable({
  providedIn: 'root'
})
export class SparqlService {
  private endpointUrl = 'http://localhost:7200/repositories/ipro'
  private prefix =
    `prefix : <http://www.semanticweb.org/ipro#>
    prefix dc: <http://purl.org/dc/elements/1.1/>
    prefix owl: <http://www.w3.org/2002/07/owl#>
    prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    prefix xml: <http://www.w3.org/XML/1998/namespace>
    prefix xsd: <http://www.w3.org/2001/XMLSchema#>
    prefix foaf: <http://xmlns.com/foaf/0.1/>
    prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    prefix time: <http://www.w3.org/2006/time#>
    prefix vann: <http://purl.org/vocab/vann/>
    prefix cpannotationschema: <http://www.ontologydesignpatterns.org/schemas/cpannotationschema.owl#>`

  constructor(private http: HttpClient) {
  }

  query(q: string): Observable<Array<RDFData>> {
    const params = new HttpParams()
      .set('query', this.prefix + '\n' + q)
      .set('format', 'json');
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/sparql-results+json'
      }),
      params
    };
    return this.http.get<any>(this.endpointUrl, options)
      .pipe(map(data => data.results.bindings
        .map((elem: any) => JSON.parse('{' + Object.keys(elem).map(k => ` "${k}" : "${elem[k].value}" `) + '}'))))
  }

  public getBands(): Observable<Array<RDFData>> {
    const q = `
      select ?band ?bandLabel where {
        ?band a :Band ;
              rdfs:label ?bandLabel .
      }`
    return this.query(q)
  }

  // get albums of bands
  public query1(bandUri: string): Observable<Array<RDFData>> {
    const q = `
      select ?album ?albumLabel ?year ?albumComment ?imageUrl {
        <${bandUri}> :discography [
          :containsRelease ?release
        ] .
        ?release :ofAlbum ?album ;
                 :releaseYear ?year .
        ?album rdfs:label ?albumLabel ;
               rdfs:comment ?albumComment ;
               :imageUrl ?imageUrl .
      }`
    return this.query(q)
  }

  // get tracks of an album
  public getTracksOf(albumUri: string): Observable<Array<RDFData>> {
    const q = `
      select ?n ?trackLabel ?minutes ?seconds {
        ?track :trackOf <${albumUri}> ;
               :trackNumber ?n ;
               rdfs:label ?trackLabel ;
               time:hasDuration [
                    time:minutes ?minutes ;
                    time:seconds ?seconds
                    ] .
      }
    `
    return this.query(q)
  }

  // get tracks of an album
  public getGenresOf(albumUri: string): Observable<Array<RDFData>> {
    const q = `
      select ?genreLabel ?genreComment {
        <${albumUri}> :hasGenre [
            rdfs:comment ?genreComment ;
           rdfs:label ?genreLabel .
        ]
      }
      order by ?trackNumber
    `
    return this.query(q)
  }
}
