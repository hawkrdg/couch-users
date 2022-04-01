 // couchdb-service.ts / CouchDbService
//		injectable service interface to couchdb
//		methods return a promise for the http response body - clients are responsible for parsing...
//
//		couchInitEndpoint(url)										set db_url endpoint for all calls...
//
//		couchLogin(name, password)								basic login
//		couchLogout()															basic logout
//
//		couchCurrentUser()												returns user context
//		couchGetUsers()														returns all user records
//
//		couchAllDBs()															returns array of server databases
//
//		couchGetRecordByID(db, id)								returns record from database by _id
//		couchGetRecords(db, view, options)				returns array of records from database by view,
//																							options: {limit?: number, start?: startkey, end?: endkey,
//																												descending? boolean}
//
//		** TO DO **
//
//		coucbCreateRecord(db, record)							add a new record to a database
//		couchDeleteRecord(db, id, rev)						delete a record from a database
//		couchUpdateRecord(db, record)							update a record for a database
//		couchUpdateRecords(db, records)						update array of records for a database using batch processing
//		couchDeleteRecords(db, records)						delete array of records from a database using batch processing
//
//		couchGetPartitionRecords(db, partition, viewDD, view, options)		return array of records from a database partition
//
//		** incorporate attachments **
//
//
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { last } from 'rxjs/operators';

// private header for proxies requesting verification...
const PROXY_HEADER = new HttpHeaders({'Access-Control-Allow-Credentials': 'true'});

@Injectable({providedIn: 'root'}) export class CouchDbService {
	response = {};
	db_url = '127.0.0.1:5984/';
	// db_url = 'couch/';

	constructor(
		private http: HttpClient,
		// private db: COUCH
	) {}

	couchInitEndpoint(url) {
		url = url.endsWith('/') ? url : url + '/';
		this.db_url = url;
	}

	couchLogin(name, password): Promise<any>  {
		return this.http.post(`${this.db_url}_session`, {name: name, password: password}, {observe: 'body', responseType: 'json', withCredentials: true}).toPromise();
	}

	couchLogout(): Promise<any> {
		return this.http.delete(this.db_url + '_session', {observe: 'body', responseType: 'json', withCredentials: true}).toPromise();
	}

	couchCurrentUser(): Promise<any> {
		return this.http.get(this.db_url + '_session', {observe: 'body', responseType: 'json', withCredentials: true}).toPromise();
	}

	couchGetUsers(): Promise<any> {
		return this.http.get(this.db_url + '_users/_design/views/_view/byName?include_docs=true', {observe: 'body', responseType: 'json', withCredentials: true}).toPromise();
	}

	couchAllDBs(): Promise<any> {
		return this.http.get(this.db_url + '_all_dbs', {observe: 'body', responseType: 'json', withCredentials: true}).toPromise();
	}

	couchGetRecords(table: string, view: string, options: {limit?, start?, end?, descending?}): Promise<any> {
		const optsLimit = typeof options.limit !== 'undefined' && options.limit > 0 ? '&limit=' + options.limit.toString() : '';
		const optsStart = typeof options.start !== 'undefined' ? '&startkey="' + options.start + '"': '';
		const optsEnd = typeof options.end !== 'undefined' ? '&endkey="' + options.end + '"' : '';
		const optsDesc = typeof options.descending !== 'undefined' && options.descending ? '&descending=true' : '';
		const opts = optsLimit + optsStart + optsEnd + optsDesc;
		const URL = `${this.db_url}${table.replaceAll('/', '')}/_design/views/_view/${view.replaceAll('/', '')}? &include_docs=true${opts}`;

		return this.http.get(URL, {observe: 'body', responseType: 'json', withCredentials: true}).toPromise();
	}

	couchGetPartitionRecords(table: string, partition: string, viewDD: string, view: string, options: {limit?, start?, end?, descending?}): Promise<any> {
		const optsLimit = typeof options.limit !== 'undefined' && options.limit > 0 ? '&limit=' + options.limit.toString() : '';
		const optsStart = typeof options.start !== 'undefined' ? '&startkey="' + options.start + '"': '';
		const optsEnd = typeof options.end !== 'undefined' ? '&endkey="' + options.end + '"' : '';
		const optsDesc = typeof options.descending !== 'undefined' && options.descending ? '&descending=true' : '';
		const opts = optsLimit + optsStart + optsEnd + optsDesc;
		const URL = `${this.db_url}${table.replaceAll('/', '')}/_partition/${partition.replaceAll('/', '')}/_design/${viewDD.replaceAll('/', '')}/_view/${view.replaceAll('/', '')}? &include_docs=true${opts}`;

		return this.http.get(URL, {observe: 'body', responseType: 'json', withCredentials: true}).toPromise();
	}

	couchGetRecordByID(table: string, id: string): Promise<any> {
		return this.http.get(this.db_url + table + '/' + id, {observe: 'body', responseType: 'json', withCredentials: true}).toPromise();
	}

	couchCreateRecord(table, doc): Promise<any>  {
		return this.http.put(this.db_url + table + '/' + doc._id, doc, {observe: 'body', responseType: 'json', withCredentials: true}).toPromise();
	}

	couchUpdateRecord(table, doc): Promise<any>  {
		return this.http.put(this.db_url + table + '/' + doc._id + '?rev=' + doc._rev, doc, {observe: 'body', responseType: 'json', withCredentials: true}).toPromise();
	}

	couchDeleteRecord(table, doc): Promise<any>  {
		return this.http.delete(this.db_url + table + '/' + doc._id + '?rev=' + doc._rev, {observe: 'body', responseType: 'json', withCredentials: true}).toPromise();
	}

}
