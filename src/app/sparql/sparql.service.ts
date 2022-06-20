import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {map, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SparqlService {
  private endpointUrl = 'http://localhost:7200/repositories/ipro'
  private prefix =
    `prefix : <http://ipro-semantic.com#>
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

  query(q: string): Observable<any[]> {
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

  public getBands(): Observable<Array<object>> {
    const q = `
      select ?band  where {
        ?band a :Band .
      }`
    return this.query(q)
  }

  // get members of bands
  public query1(bandUri: string): Observable<Array<object>> {
    const q = `
      select ?band ?member  where {
        ${bandUri} :hasMember ?member .
      }`
    return this.query(q)
  }
}
