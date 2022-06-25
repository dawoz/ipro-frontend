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
        .map((elem: any) => JSON.parse('{' + Object.keys(elem).map(k => ` "${k}" : "${elem[k].value.replaceAll('\"','\'')}" `) + '}'))))
  }

  public getBands(): Observable<Array<RDFData>> {
    const q = `
      select distinct ?band ?bandLabel where {
        ?band a :Band ;
              rdfs:label ?bandLabel .
      }`
    return this.query(q)
  }

  // get albums of bands
  public query1(bandIri: string): Observable<Array<RDFData>> {
    const q = `
      select distinct ?album ?albumLabel ?year ?albumComment ?imageUrl where {
        <${bandIri}> :discography [
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
  public getTracksOf(albumIri: string): Observable<Array<RDFData>> {
    const q = `
      select distinct ?n ?trackLabel ?minutes ?seconds where {
        ?track :trackOf <${albumIri}> ;
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
  public getGenresOf(albumIri: string): Observable<Array<RDFData>> {
    const q = `
      select distinct ?genre ?genreLabel ?genreComment where {
        <${albumIri}> :hasGenre ?genre .
        ?genre rdfs:comment ?genreComment ;
           rdfs:label ?genreLabel .
      }
    `
    return this.query(q)
  }

  public getMembersOf(albumIri: string): Observable<Array<RDFData>> {
    const q = `
      select distinct ?member ?role ?instrument ?memberLabel ?instrumentLabel ?roleLabel where {
        ?p :inAlbum <${albumIri}> .
        ?member :participatedIn ?p ;
                rdfs:label ?memberLabel .
        { ?p :withInstrument ?instrument .
           ?instrument rdfs:label ?instrumentLabel . }
        union
        { ?p :withProductionRole ?role .
          ?role rdfs:label ?roleLabel . }
      }
    `
    return this.query(q)
  }

  getGenres() {
    const q = `
      select distinct ?genre ?genreLabel ?genreComment where {
        ?genre a :Genre ;
               rdfs:label ?genreLabel ;
               rdfs:comment ?genreComment .
      }
    `
    return this.query(q)
  }

  getInstruments() {
    const q = `
      select distinct ?instrument ?instrumentLabel ?instrumentComment where {
        ?instrument a :MusicalInstrument ;
               rdfs:label ?instrumentLabel ;
               rdfs:comment ?instrumentComment .
      }
    `
    return this.query(q)
  }

  getProductionRoles() {
    const q = `
      select distinct ?role ?roleLabel ?roleComment where {
        ?role a :ProductionRole ;
               rdfs:label ?roleLabel ;
               rdfs:comment ?roleComment .
      }
    `
    return this.query(q)
  }

  getRelatedGenresOf(genreIri: string) {
    const q = `
      select distinct
            ?subgenre ?subgenreLabel
            ?supergenre ?supergenreLabel
            ?parent ?parentLabel
            ?child ?childLabel
      where {
        { <${genreIri}> :influences ?child .
            ?child rdfs:label ?childLabel . }
        union
        { ?parent :influences <${genreIri}> ;
                   rdfs:label ?parentLabel . }
        union
        { <${genreIri}> :hasSubgenre ?subgenre .
            ?subgenre rdfs:label ?subgenreLabel . }
        union
        { ?supergenre :hasSubgenre <${genreIri}> ;
                   rdfs:label ?supergenreLabel . }
      }
    `
    return this.query(q)
  }

  getInstrumentsOf(genreIri: string) {
    const q = `
      select distinct ?instrument ?instrumentLabel where {
      ?m :participatedIn [
          :inAlbum ?a ;
          :withInstrument ?instrument
      ] .
      ?instrument rdfs:label ?instrumentLabel .
      ?a :hasGenre <${genreIri}> .
  }
    `
    return this.query(q)
  }

  getBandsAndAlbumsOf(genreIri: string) {
    const q = `
      select distinct ?band ?bandLabel ?album ?albumLabel where {
      ?m :participatedIn [
          :inAlbum ?album ;
      ] .
      ?album rdfs:label ?albumLabel ;
             :hasGenre <${genreIri}> .
      ?release :ofAlbum ?album ;
               :releaseOf [ :discographyOf ?band ] .
      ?band rdfs:label ?bandLabel .
  }
    `
    return this.query(q)
  }

  getGenresWith(instrumentIri: string) {
    const q = `
      select distinct ?genre ?genreLabel where {
      [] :participatedIn [
          :inAlbum ?album ;
          :withInstrument <${instrumentIri}>
      ] .
      ?album :hasGenre ?genre .
      ?genre rdfs:label ?genreLabel .
  }
    `
    return this.query(q)
  }

  getMusiciansWithInstrument(instrumentIri: string) {
    const q = `
      select distinct ?musician ?musicianLabel where {
      ?musician :participatedIn [ :withInstrument <${instrumentIri}> ] .
      ?musician rdfs:label ?musicianLabel .
  }
    `
    return this.query(q)
  }

  getMusiciansWithProductionRole(roleIri: string) {
    const q = `
      select distinct ?musician ?musicianLabel where {
      ?musician :participatedIn [ :withProductionRole <${roleIri}> ] .
      ?musician rdfs:label ?musicianLabel .
  }
    `
    return this.query(q)
  }

  getMostSpecificClassOf(individualIri: string) {
    const q = `
      select distinct ?class ?classLabel where {
        <${individualIri}> a ?class .
        ?class rdfs:label ?classLabel .
        filter not exists {
          ?subclass ^a <${individualIri}> ;
                    rdfs:subClassOf ?class .
          filter( ?subclass != ?class )
        }
      }
    `
    return this.query(q)
  }
}
