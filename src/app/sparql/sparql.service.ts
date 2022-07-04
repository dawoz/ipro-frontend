import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {map, Observable} from "rxjs";

export type RDFData = Record<string, string>

@Injectable({
  providedIn: 'root'
})
export class SparqlService {
  private endpointUrl = 'http://localhost:7200/repositories/ipro'

  // prefixes for the queries
  private prefix =
    `prefix : <http://www.semanticweb.org/ipro#>
    prefix dc: <http://purl.org/dc/elements/1.1/>
    prefix owl: <http://www.w3.org/2002/07/owl#>
    prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    prefix xml: <http://www.w3.org/XML/1998/namespace>
    prefix xsd: <http://www.w3.org/2001/XMLSchema#>
    prefix mo: <http://purl.org/ontology/mo/>
    prefix dbo: <http://dbpedia.org/ontology/>
    prefix foaf: <http://xmlns.com/foaf/0.1/>
    prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    prefix time: <http://www.w3.org/2006/time#>
    prefix vann: <http://purl.org/vocab/vann/>
    prefix cpannotationschema: <http://www.ontologydesignpatterns.org/schemas/cpannotationschema.owl#>`

  constructor(private http: HttpClient) { }

  /**
   * Helper function for querying GraphDB
   *
   * @param q query
   */
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

  /**
   * Get all bands
   */
  public getBands(): Observable<Array<RDFData>> {
    const q = `
      select distinct ?band ?bandLabel where {
        ?band a :Band ;
              rdfs:label ?bandLabel .
      }`
    return this.query(q)
  }

  /**
   * Get all albums of a band, with year, comment, label and URL of image
   *
   * @param bandIri
   */
  public getAlbumsOfBand(bandIri: string): Observable<Array<RDFData>> {
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

  /**
   * Get all tracks of an album, with number, label and duration
   *
   * @param albumIri
   */
  public getTracksOfAlbum(albumIri: string): Observable<Array<RDFData>> {
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

  /**
   * Get all genres of an album
   *
   * @param albumIri
   */
  public getGenresOfAlbum(albumIri: string): Observable<Array<RDFData>> {
    const q = `
      select distinct ?genre ?genreLabel ?genreComment where {
        <${albumIri}> :hasGenre ?genre .
        ?genre rdfs:comment ?genreComment ;
           rdfs:label ?genreLabel .
      }
    `
    return this.query(q)
  }

  /**
   * Get all musicians that played music in a given album
   *
   * @param albumIri
   */
  public getMembersOfAlbum(albumIri: string): Observable<Array<RDFData>> {
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

  /**
   * Get all musical genres
   */
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

  /**
   * Get all musical instruments
   */
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

  /**
   * Get all production roles
   */
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

  /**
   * Get all related genres of a given genre G. The possible relations are
   *  - supergenre
   *  - subgenre
   *  - influenced genre
   *  - genre that originated G
   *  All with labels
   *
   * @param genreIri
   */
  getRelatedGenresOfGenre(genreIri: string) {
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

  /**
   * Get all instruments that are typically used in a given genre
   *
   * @param genreIri
   */
  getInstrumentsOfGenre(genreIri: string) {
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

  /**
   * Get albums (and bands) that are classified with a given genre
   *
   * @param genreIri
   */
  getBandsAndAlbumsOfGenre(genreIri: string) {
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

  /**
   * Get all genres in which a given instrument is used
   *
   * @param instrumentIri
   */
  getGenresWithInstrument(instrumentIri: string) {
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

  /**
   * Get all musicians that play a given instrument
   *
   * @param instrumentIri
   */
  getMusiciansWithInstrument(instrumentIri: string) {
    const q = `
      select distinct ?musician ?musicianLabel where {
      ?musician :participatedIn [ :withInstrument <${instrumentIri}> ] .
      ?musician rdfs:label ?musicianLabel .
  }
    `
    return this.query(q)
  }

  /**
   * Get all musicians that had a particular production role
   *
   * @param roleIri
   */
  getMusiciansWithProductionRole(roleIri: string) {
    const q = `
      select distinct ?musician ?musicianLabel where {
      ?musician :participatedIn [ :withProductionRole <${roleIri}> ] .
      ?musician rdfs:label ?musicianLabel .
  }
    `
    return this.query(q)
  }

  /**
   * Get the most speficic class of an individual
   *
   * @param individualIri
   */
  getMostSpecificClassOfIndividual(individualIri: string) {
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

  /**
   * Get all the classes of musical instruments, excluded the root class
   */
  getInstrumentCategories() {
    const q = `
      select distinct ?category ?categoryLabel where {
        ?category rdfs:subClassOf :MusicalInstrument ;
               rdfs:label ?categoryLabel .
          filter( ?category != :Musical_Instrument )
      }
    `
    return this.query(q)
  }

  /**
   * Get all instruments of a given category
   *
   * @param classIri
   */
  getInstrumentOfCategory(classIri: string) {
    const q = `
      select distinct ?instrument ?instrumentLabel where {
        ?instrument a <${classIri}> ;
                    rdfs:label ?instrumentLabel ;
                    rdfs:comment ?instrumentComment .
      }
    `
    return this.query(q)
  }

  /**
   * Get all musicians (with label and comment)
   */
  getMusicians() {
    const q = `
      select distinct ?musician ?musicianLabel ?musicianComment where {
        ?musician a :Musician ;
               rdfs:label ?musicianLabel ;
               rdfs:comment ?musicianComment .
      }
    `
    return this.query(q)
  }

  /**
   * Get all albums (and band) in which a given musician participated with an instrument
   *
   * @param musicianIri
   */
  getBandsAndAlbumsOfMusician(musicianIri: string) {
    const q = `
      select distinct ?band ?bandLabel ?album ?albumLabel where {
      <${musicianIri}> :participatedIn [
          :inAlbum ?album ;
      ] .
      ?album rdfs:label ?albumLabel .
      ?release :ofAlbum ?album ;
               :releaseOf [ :discographyOf ?band ] .
      ?band rdfs:label ?bandLabel .
  }
    `
    return this.query(q)
  }

  /**
   * Get all instruments played by a musician
   *
   * @param musicianIri
   */
  getInstrumentsOfMusician(musicianIri: string) {
    const q = `
      select distinct ?instrument ?instrumentLabel where {
      <${musicianIri}> :participatedIn [ :withInstrument ?instrument ] .
      ?instrument rdfs:label ?instrumentLabel .
  }
    `
    return this.query(q)
  }

  /**
   * Get all classes of a given individual
   *
   * @param individualIri
   */
  getSubclassesOfMusician(individualIri: string) {
    const q = `
      select distinct ?class ?classLabel where {
        <${individualIri}> a ?class .
        ?class rdfs:label ?classLabel
        filter(?class != mo:MusicArtist && ?class != dbo:MusicalArtist && ?class != foaf:Person)
      }
    `
    return this.query(q)
  }

  /**
   * Gets all albums of a band with genres ordered by year
   *
   * @param bandIri
   */
  getGenreEvolutionOfBand(bandIri: string) {
    const q = `
      select distinct ?album ?albumLabel ?imageUrl ?year ?genre ?genreLabel where {
        <${bandIri}> :discography [
            :containsRelease [
                ?ofAlbum ?album ;
                :releaseYear ?year
            ]
         ] .
         ?album rdfs:label ?albumLabel ;
                :hasGenre ?genre ;
                :imageUrl ?imageUrl .
         ?genre rdfs:label ?genreLabel .
      }
        order by ?year
    `
    return this.query(q)
  }
}
