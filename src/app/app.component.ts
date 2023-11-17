import { Component, OnInit } from '@angular/core';
import { EMPTY, Observable, Subject, of } from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap, tap, catchError, retry} from 'rxjs/operators'
import {HttpClient} from '@angular/common/http'

type Pokemon = {
  name: string,
  spites: {
    back_default: string,
    front_default: string,
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  inputValue : string = ''
  private searchTerm$ = new Subject<string>();
  searchResult$: Observable<any>;
  errorMessage: string = ''

  constructor(private http: HttpClient) {
    this.searchResult$ = this.searchTerm$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(term => console.log('Input:', term)),
      switchMap(term => this.apiCall(term)),
      tap(result => this.inputValue = ''),
      retry(3),
      catchError(error => {
        console.error('Error fetching data:', error);
        this.errorMessage = 'An error occurred. Please try again.';
        return of(null); // Return an observable to continue the stream
        
      })
    );
  }

  onInputChange(): void {
    this.searchTerm$.next(this.inputValue);
  }

  apiCall(term: string): Observable<any> {
    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${term}`;
    return this.http.get(apiUrl);
  }
}

