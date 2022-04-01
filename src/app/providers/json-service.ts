import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, forkJoin} from 'rxjs';
import {map} from 'rxjs/operators';
// import {forkJoin} from 'rxjs';

@Injectable() export class JsonService {

	constructor(private http: HttpClient) {}

	//-- load JSON file --

	loadJSON(endpoint): Observable<any> {
		return Observable.create(observer => {
			this.http.get(endpoint).subscribe(
				result => {
					console.log(result);
					observer.next(result);
					observer.complete();
				},
				err => {
					console.log('SOMETHING WENT WRONG LOADING JSON FILE...');
					console.log(JSON.stringify(err));
				}
			);
		});
	}

}
