import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CouchDbService } from "./couchdb-service";
import { OverlayContainer } from '@angular/cdk/overlay';
import { cloneDeep } from "lodash-es";


@Injectable({providedIn: 'root'}) export class GlobalDataService {
	banner 					= 'CouchDB User Management...';
	isDataLoaded		= false;
	isLoggedIn			= false;
	showLogin				= true;
	showChangePW		= false;
	showDataLoading	=	false;

	disableAllEdits	= true;
	editMode 				= false;
	addOrEdit				= 'edit';

	userLogin			= '';
	userPassword	= '';
	userRoles			= [];
	oldPW					= '';
	newPW					= '';

	conf;

	availableRoles;
	users;
	currentUserSubmitBuf;
	currentUserSaveBuf;
	currentUserBuf;
	currentUserIdx = 0;
	currentRoleIdx;
	savedRoleIdx;

	//-- custom input masks --

	// allCaps = {'C': {pattern: new RegExp('\[A-Z\]')}};

	constructor(
		private http: HttpClient,
		private db: CouchDbService
	) {}

	//-- get the app conf file...
	//
	loadConf = async () => {
		try {
			await this.http.get('assets/conf/app-conf.json', {responseType: 'json'}).toPromise().then(
				(d: any) => {
					// console.log(`data: ${JSON.stringify(d, undefined, 2)}`);
					this.conf = d;
					this.availableRoles = cloneDeep(this.conf.userRoles);
					this.db.couchInitEndpoint(d.couchProxyEndpoint);
				});
		} catch (e:any) {
			console.log('ERROR FETCHING CONFIG: ', e.error);
		}
	}

	loadData = async () => {
		//-- for the user...
		await this.delay(1000);

		try {
			//-- load the users...
			this.users = [];
			await this.db.couchGetUsers().then(
				(d: any) => {
					this.users = d.rows.map((r, idx) => {
						return r.doc;
					});
					this.currentUserIdx = this.currentUserIdx > 0 ? this.currentUserIdx : 0;
					this.currentUserBuf = cloneDeep(this.users[this.currentUserIdx]);
					this.currentUserSubmitBuf = cloneDeep(this.users[this.currentUserIdx]);
				},
				e => {
					console.log('ERROR FETCHING USERS: ', e.error);
					throw(`${e.status.toString()}: ${e.error.error.toUpperCase()} - ${e.error.reason}`);
				}
			);

			this.isDataLoaded = true;
			this.showLogin = false;

		} catch (error) {
			throw(error);
		}
	}

	getRecordArrayIdx = (dbArray, matchField, matchValue) => {
		// console.log(`getRecordArrayIdx(${dbArray}, ${matchField}, ${matchValue})`);
		return dbArray.findIndex((r) => r[matchField] === matchValue);
		// const idx = dbArray.findIndex((r) => r[matchField] === matchValue);
		// return idx;
	}

 	delay(delay) {
	 	return new Promise<void>((resolve) => {
			setTimeout(() => {
				resolve();
			}, delay);
		});
	}

	findRecordIndex(db, fieldName, value) {
		return db.findIndex((r) => r[fieldName] === value);
	}
}
